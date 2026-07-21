import { useCallback, useEffect, useRef, useState } from 'react'
import { Loader2, Mic, Phone, PhoneOff, Square, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { API_URL } from '@/lib/api'
import { useAuth } from '@/stores/auth-store'
import { cn } from '@/lib/utils'

const LANGS = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'te', name: 'Telugu' },
  { code: 'ta', name: 'Tamil' },
  { code: 'kn', name: 'Kannada' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'mr', name: 'Marathi' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'pa', name: 'Punjabi' },
  { code: 'bn', name: 'Bengali' },
]

type Msg = { role: 'user' | 'agent'; text: string }
type Status = 'setup' | 'connecting' | 'idle' | 'recording' | 'processing' | 'speaking'

const STATUS_COPY: Record<Status, string> = {
  setup: 'Pick a language and start the call',
  connecting: 'Connecting…',
  idle: 'Tap the mic and speak as the caller',
  recording: 'Listening — tap to finish',
  processing: 'Transcribing & thinking…',
  speaking: 'Agent is speaking…',
}

/** Encode captured Float32 PCM into a 16-bit mono WAV file. */
function encodeWav(chunks: Float32Array[], sampleRate: number): Uint8Array {
  const total = chunks.reduce((n, c) => n + c.length, 0)
  const buffer = new ArrayBuffer(44 + total * 2)
  const view = new DataView(buffer)
  const writeStr = (off: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i))
  }
  writeStr(0, 'RIFF')
  view.setUint32(4, 36 + total * 2, true)
  writeStr(8, 'WAVE')
  writeStr(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true) // PCM
  view.setUint16(22, 1, true) // mono
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * 2, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  writeStr(36, 'data')
  view.setUint32(40, total * 2, true)
  let off = 44
  for (const chunk of chunks) {
    for (let i = 0; i < chunk.length; i++) {
      const s = Math.max(-1, Math.min(1, chunk[i]))
      view.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7fff, true)
      off += 2
    }
  }
  return new Uint8Array(buffer)
}

function bytesToBase64(bytes: Uint8Array): string {
  let bin = ''
  const CHUNK = 0x8000
  for (let i = 0; i < bytes.length; i += CHUNK) {
    bin += String.fromCharCode(...bytes.subarray(i, i + CHUNK))
  }
  return btoa(bin)
}

type RecordingRig = {
  stream: MediaStream
  ctx: AudioContext
  source: MediaStreamAudioSourceNode
  proc: ScriptProcessorNode
}

/** Voice test call: mic → WS (STT → flow/LLM → TTS) → speaker.
 *  Uses the same real-time pipeline as a live web call, so a published
 *  flow answers exactly as it would in production. */
export function TestCallPanel({
  agentId,
  defaultLanguage,
  onClose,
}: {
  agentId: string
  defaultLanguage?: string
  onClose: () => void
}) {
  const orgId = useAuth((s) => s.user?.organizationId)
  const [language, setLanguage] = useState(defaultLanguage || 'en')
  const [status, setStatus] = useState<Status>('setup')
  const [messages, setMessages] = useState<Msg[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)

  const wsRef = useRef<WebSocket | null>(null)
  const recRef = useRef<RecordingRig | null>(null)
  const chunksRef = useRef<Float32Array[]>([])
  const audioQueue = useRef<string[]>([])
  const playingRef = useRef(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const send = (type: string, data: Record<string, unknown> = {}) =>
    wsRef.current?.readyState === WebSocket.OPEN &&
    wsRef.current.send(JSON.stringify({ type, data }))

  const playNext = useCallback(() => {
    const next = audioQueue.current.shift()
    if (!next) {
      playingRef.current = false
      setStatus((s) => (s === 'speaking' ? 'idle' : s))
      return
    }
    playingRef.current = true
    setStatus('speaking')
    const audio = new Audio(`data:audio/wav;base64,${next}`)
    audioRef.current = audio
    audio.onended = playNext
    audio.onerror = playNext
    audio.play().catch(playNext)
  }, [])

  const startCall = () => {
    if (!orgId) {
      toast.error('No organization in session — sign in again')
      return
    }
    setStatus('connecting')
    const conversationId = `web-test-${Date.now().toString(36)}`
    const ws = new WebSocket(
      `${API_URL.replace(/^http/, 'ws')}/ws/conversation/${conversationId}`,
    )
    wsRef.current = ws
    ws.onopen = () =>
      send('session_start', {
        org_id: orgId,
        voice_agent_id: agentId,
        language,
      })
    ws.onmessage = (e) => {
      const event = JSON.parse(e.data) as { type: string; data: Record<string, unknown> }
      switch (event.type) {
        case 'session_created':
          setStatus('idle')
          break
        case 'final_transcript':
          setMessages((m) => [...m, { role: 'user', text: String(event.data.text ?? '') }])
          break
        case 'audio_chunk': {
          audioQueue.current.push(String(event.data.audio ?? ''))
          if (!playingRef.current) playNext()
          break
        }
        case 'response_completed':
          setMessages((m) => [...m, { role: 'agent', text: String(event.data.text ?? '') }])
          break
        case 'error':
          toast.error(String(event.data.error ?? 'Call error'))
          setStatus('idle')
          break
      }
    }
    ws.onerror = () => {
      toast.error('Call connection failed')
      setStatus('setup')
    }
    ws.onclose = () => {
      wsRef.current = null
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true },
      })
      const ctx = new AudioContext({ sampleRate: 16000 })
      const source = ctx.createMediaStreamSource(stream)
      const proc = ctx.createScriptProcessor(4096, 1, 1)
      chunksRef.current = []
      proc.onaudioprocess = (e) => {
        chunksRef.current.push(new Float32Array(e.inputBuffer.getChannelData(0)))
      }
      source.connect(proc)
      proc.connect(ctx.destination)
      recRef.current = { stream, ctx, source, proc }
      setStatus('recording')
    } catch {
      toast.error('Microphone access denied — allow the mic to test by voice')
    }
  }

  const stopRecording = async () => {
    const rec = recRef.current
    if (!rec) return
    recRef.current = null
    rec.proc.disconnect()
    rec.source.disconnect()
    rec.stream.getTracks().forEach((t) => t.stop())
    const sampleRate = rec.ctx.sampleRate
    await rec.ctx.close().catch(() => {})
    const wav = encodeWav(chunksRef.current, sampleRate)
    chunksRef.current = []
    if (wav.length <= 44) {
      setStatus('idle')
      return
    }
    send('audio_chunk', { audio: bytesToBase64(wav) })
    send('end_of_speech', {})
    setStatus('processing')
  }

  const hangUp = useCallback(() => {
    recRef.current?.stream.getTracks().forEach((t) => t.stop())
    recRef.current?.ctx.close().catch(() => {})
    recRef.current = null
    audioRef.current?.pause()
    audioQueue.current = []
    wsRef.current?.close()
    wsRef.current = null
  }, [])

  useEffect(() => hangUp, [hangUp]) // teardown on unmount

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, status])

  const live = status !== 'setup' && status !== 'connecting'

  return (
    <aside className="flex w-80 shrink-0 flex-col border-l border-line bg-popover/60 backdrop-blur">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <div>
          <h3 className="font-display text-sm font-semibold text-text-strong">Test call</h3>
          <p className="text-[10px] text-text-faint">
            Real voice pipeline — answers with the published flow
          </p>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-text-faint hover:bg-surface-strong hover:text-text-strong"
        >
          <X size={15} />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-2.5 overflow-y-auto p-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={cn(
              'max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed',
              m.role === 'agent'
                ? 'bg-surface-strong text-text-strong'
                : 'ml-auto bg-brand-blue/15 text-text-strong',
            )}
          >
            {m.text}
          </div>
        ))}
        {status === 'processing' && (
          <div className="flex items-center gap-1.5 text-[11px] text-text-faint">
            <Loader2 size={12} className="animate-spin" /> agent is thinking…
          </div>
        )}
      </div>

      <div className="space-y-3 border-t border-line p-4">
        <p className="text-center text-[11px] text-text-faint">{STATUS_COPY[status]}</p>

        {!live ? (
          <div className="flex items-center gap-2">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="h-9 flex-1 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGS.map((l) => (
                  <SelectItem key={l.code} value={l.code}>
                    {l.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              className="h-9 gap-1.5"
              onClick={startCall}
              disabled={status === 'connecting'}
            >
              {status === 'connecting' ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Phone size={14} />
              )}
              Start call
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-4">
            {/* waveform while the agent talks or the mic is open */}
            <div className="flex h-8 w-14 items-end justify-center gap-0.5">
              {(status === 'speaking' || status === 'recording') &&
                [0, 1, 2, 3, 4].map((i) => (
                  <span
                    key={i}
                    className="wave-bar w-1 rounded-full"
                    style={{ height: '100%', animationDelay: `${i * 120}ms` }}
                  />
                ))}
            </div>

            <button
              onClick={status === 'recording' ? stopRecording : startRecording}
              disabled={status === 'processing' || status === 'speaking'}
              title={status === 'recording' ? 'Finish speaking' : 'Speak as the caller'}
              className={cn(
                'flex size-12 items-center justify-center rounded-full border-2 transition-all',
                status === 'recording'
                  ? 'border-destructive bg-destructive/15 text-destructive'
                  : 'border-brand-blue bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/20',
                (status === 'processing' || status === 'speaking') &&
                  'cursor-not-allowed opacity-40',
              )}
            >
              {status === 'recording' ? <Square size={17} /> : <Mic size={19} />}
            </button>

            <button
              onClick={() => {
                hangUp()
                setStatus('setup')
                setMessages([])
              }}
              title="End call"
              className="flex size-9 items-center justify-center rounded-full border border-line text-text-faint transition-colors hover:border-destructive hover:text-destructive"
            >
              <PhoneOff size={15} />
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}

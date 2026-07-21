import { useState } from 'react'
import {
  Mic,
  Search,
  Star,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useVoices, type VoiceProfile } from '@/lib/queries'

export function VoicesView() {
  const [search, setSearch] = useState('')
  const [langFilter, setLangFilter] = useState('')
  const [genderFilter, setGenderFilter] = useState('')
  const { data, isLoading } = useVoices()

  const voices = data?.voices ?? []
  const filtered = voices.filter((v) => {
    if (search && !v.name.toLowerCase().includes(search.toLowerCase())) return false
    if (langFilter && v.language !== langFilter) return false
    if (genderFilter && v.gender !== genderFilter) return false
    return true
  })

  const languages = [...new Set(voices.map((v) => v.language))].sort()
  const genders = [...new Set(voices.map((v) => v.gender))].sort()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-semibold text-text-strong">Voices</h1>
        <p className="text-sm text-text-soft">Browse available voice models for your agents</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-faint" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search voices..."
            className="pl-9"
          />
        </div>
        <Select value={langFilter} onValueChange={setLangFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="All languages" /></SelectTrigger>
          <SelectContent>
            {languages.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={genderFilter} onValueChange={setGenderFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="All genders" /></SelectTrigger>
          <SelectContent>
            {genders.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <p className="text-sm text-text-soft">{filtered.length} voices</p>

      {isLoading ? (
        <div className="py-8 text-center text-text-soft">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((voice) => (
            <VoiceCard key={voice.voiceId} voice={voice} />
          ))}
        </div>
      )}
    </div>
  )
}

function VoiceCard({ voice }: { voice: VoiceProfile }) {
  return (
    <Card className="hover:bg-surface-strong transition-colors">
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-blue/15">
              <Mic size={14} className="text-brand-blue" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-strong">{voice.name}</p>
              <p className="text-xs text-text-faint">{voice.gender} &middot; {voice.language}</p>
            </div>
          </div>
          {voice.tone && <Badge variant="outline">{voice.tone}</Badge>}
        </div>
        {voice.useCases.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {voice.useCases.map((uc) => (
              <Badge key={uc} variant="secondary" className="text-xs">{uc}</Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

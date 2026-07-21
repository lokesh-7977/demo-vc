import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * UI-layer global error handler. Catches render/runtime errors from the
 * component tree (which the API-layer handler in query-client.ts cannot see)
 * and shows a recoverable fallback instead of a blank white screen.
 *
 * Wrap route content with it; pass `fallback` to customize per-area.
 */
type Props = {
  children: ReactNode
  fallback?: (reset: () => void, error: Error) => ReactNode
  onError?: (error: Error, info: ErrorInfo) => void
}

type State = { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Hook point for an error-reporting service (Sentry, etc.)
    console.error('UI ErrorBoundary caught:', error, info.componentStack)
    this.props.onError?.(error, info)
  }

  reset = () => this.setState({ error: null })

  render() {
    const { error } = this.state
    if (!error) return this.props.children
    if (this.props.fallback) return this.props.fallback(this.reset, error)

    return (
      <div className="flex h-full min-h-64 flex-col items-center justify-center gap-4 p-8 text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <AlertTriangle size={22} />
        </span>
        <div>
          <h2 className="font-display text-lg font-semibold text-text-strong">
            Something broke on this screen
          </h2>
          <p className="mt-1 max-w-sm text-sm text-text-soft">
            {error.message || 'An unexpected error occurred while rendering.'}
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={this.reset}>
          <RotateCcw size={14} className="mr-1" /> Try again
        </Button>
      </div>
    )
  }
}

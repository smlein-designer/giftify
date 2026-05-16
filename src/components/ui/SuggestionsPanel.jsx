import { useState } from 'react'
import { Loader2, AlertCircle, Sparkles } from 'lucide-react'
import SlidePanel from './SlidePanel'
import Button from './Button'

function SuggestionCard({ suggestion, primaryAction }) {
  const [done, setDone] = useState(false)

  const handleAction = () => {
    primaryAction.handler(suggestion)
    setDone(true)
  }

  return (
    <div className="p-4 bg-surface border border-border rounded-md">
      <div className="flex items-start justify-between gap-2 mb-1">
        <p className="font-bold text-foreground leading-snug">{suggestion.name}</p>
        {suggestion.in_library && (
          <span className="shrink-0 text-xs text-success bg-success/10 px-2 py-0.5 rounded-full">
            In library
          </span>
        )}
      </div>
      <p className="text-sm text-muted">{suggestion.description}</p>
      {suggestion.price_estimate && (
        <p className="text-sm font-medium text-foreground mt-1.5">{suggestion.price_estimate}</p>
      )}
      <div className="mt-3">
        {done ? (
          <span className="text-sm text-success font-medium">✓ {primaryAction.doneLabel ?? 'Done'}</span>
        ) : (
          <button
            type="button"
            onClick={handleAction}
            className="text-sm text-accent hover:text-accent-hover font-medium transition-colors"
          >
            {typeof primaryAction.label === 'function'
              ? primaryAction.label(suggestion)
              : primaryAction.label}
          </button>
        )}
      </div>
    </div>
  )
}

export default function SuggestionsPanel({
  isOpen,
  onClose,
  title,
  loading,
  error,
  onRetry,
  suggestions,
  primaryAction,
}) {
  return (
    <SlidePanel isOpen={isOpen} onClose={onClose} title={title}>
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 size={24} className="text-muted animate-spin" />
          <p className="text-sm text-muted">Thinking…</p>
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <AlertCircle size={24} className="text-error" />
          <p className="text-sm text-muted max-w-xs">{error}</p>
          {onRetry && (
            <Button variant="secondary" onClick={onRetry}>
              Try again
            </Button>
          )}
        </div>
      )}

      {!loading && !error && suggestions.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-xs text-muted mb-1">
            <Sparkles size={11} className="inline mr-1" />
            Powered by Claude
          </p>
          {suggestions.map((s, i) => (
            <SuggestionCard key={i} suggestion={s} primaryAction={primaryAction} />
          ))}
        </div>
      )}
    </SlidePanel>
  )
}

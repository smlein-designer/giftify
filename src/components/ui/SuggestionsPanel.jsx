import { useState } from 'react'
import { AlertCircle, Sparkles, Check } from 'lucide-react'
import SlidePanel from './SlidePanel'
import Button from './Button'
import Tag from './Tag'

function SuggestionCard({ suggestion, primaryAction, index }) {
  const [done, setDone] = useState(false)

  const handleAction = () => {
    primaryAction.handler(suggestion)
    setDone(true)
  }

  return (
    <div className="card p-5 animate-rise" style={{ animationDelay: `${index * 60}ms` }}>
      <div className="flex items-start justify-between gap-3">
        <p className="font-display font-semibold text-[16px] text-ink leading-snug">{suggestion.name}</p>
        {suggestion.price_estimate && (
          <span className="shrink-0 text-[14px] font-semibold text-ink tabular">{suggestion.price_estimate}</span>
        )}
      </div>
      <p className="text-[14px] text-ink-soft mt-1.5">{suggestion.description}</p>
      <div className="mt-4 flex items-center justify-between gap-3">
        {suggestion.in_library ? <Tag variant="success">In your library</Tag> : <span />}
        {done ? (
          <span className="inline-flex items-center gap-1.5 text-[14px] font-medium text-sage">
            <Check size={15} strokeWidth={2} /> {primaryAction.doneLabel ?? 'Done'}
          </span>
        ) : (
          <Button size="sm" variant="secondary" type="button" onClick={handleAction}>
            {typeof primaryAction.label === 'function' ? primaryAction.label(suggestion) : primaryAction.label}
          </Button>
        )}
      </div>
    </div>
  )
}

function SkeletonCard({ delay }) {
  return (
    <div className="card p-5" style={{ animationDelay: `${delay}ms` }}>
      <div className="h-4 w-2/3 rounded bg-sand animate-pulse" />
      <div className="h-3 w-full rounded bg-sand/70 animate-pulse mt-3" />
      <div className="h-3 w-4/5 rounded bg-sand/70 animate-pulse mt-2" />
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
    <SlidePanel isOpen={isOpen} onClose={onClose} title={title} subtitle="Ideas shaped by their notes and gift history">
      {loading && (
        <div className="flex flex-col gap-3" aria-live="polite">
          <p className="inline-flex items-center gap-2 text-[14px] text-ink-soft mb-1">
            <Sparkles size={15} strokeWidth={1.75} className="text-amber animate-pulse" />
            Thinking about what they'd love…
          </p>
          {[0, 1, 2].map((i) => (
            <SkeletonCard key={i} delay={i * 80} />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <span className="w-12 h-12 rounded-full bg-amber-tint text-amber inline-flex items-center justify-center">
            <AlertCircle size={22} strokeWidth={1.75} />
          </span>
          <p className="text-[14px] text-ink-soft max-w-xs">{error}</p>
          {onRetry && (
            <Button variant="secondary" onClick={onRetry}>
              Try again
            </Button>
          )}
        </div>
      )}

      {!loading && !error && suggestions.length > 0 && (
        <div className="flex flex-col gap-3">
          {suggestions.map((s, i) => (
            <SuggestionCard key={i} index={i} suggestion={s} primaryAction={primaryAction} />
          ))}
          <p className="inline-flex items-center gap-1.5 text-[12px] text-ink-faint mt-2">
            <Sparkles size={12} strokeWidth={1.75} /> Suggestions by Claude
          </p>
        </div>
      )}
    </SlidePanel>
  )
}

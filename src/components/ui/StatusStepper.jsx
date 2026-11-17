import { Check } from 'lucide-react'

// Horizontal progress through a gift's statuses
export default function StatusStepper({ steps, current }) {
  const idx = Math.max(0, steps.indexOf(current))
  const complete = idx === steps.length - 1
  return (
    <ol className="flex items-start w-full" aria-label={`Status: ${current}`}>
      {steps.map((s, i) => {
        const reached = i <= idx
        const isCurrent = i === idx
        return (
          <li key={s} className="flex-1 flex flex-col items-center relative min-w-0">
            {i > 0 && (
              <span
                className={`absolute top-[9px] h-[2px] rounded-full ${
                  i <= idx ? (complete ? 'bg-sage' : 'bg-ink') : 'bg-line'
                }`}
                style={{ left: 'calc(-50% + 14px)', right: 'calc(50% + 14px)' }}
              />
            )}
            <span
              className={`relative z-10 w-5 h-5 rounded-full inline-flex items-center justify-center transition-colors ${
                reached
                  ? complete
                    ? 'bg-sage text-paper'
                    : isCurrent
                      ? 'bg-card border-2 border-ink'
                      : 'bg-ink text-paper'
                  : 'bg-card border-2 border-line-strong'
              }`}
            >
              {reached && (!isCurrent || complete) && <Check size={11} strokeWidth={3} />}
              {isCurrent && !complete && <span className="w-2 h-2 rounded-full bg-amber" />}
            </span>
            <span
              className={`mt-1.5 text-[11px] capitalize truncate max-w-full px-0.5 ${
                isCurrent ? 'text-ink font-semibold' : reached ? 'text-ink-soft' : 'text-ink-faint'
              }`}
            >
              {s}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

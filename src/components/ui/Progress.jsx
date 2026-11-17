export default function Progress({ value = 0, total = 0, tone = 'ink', className = '' }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  const done = total > 0 && value === total
  const bar = done ? 'bg-sage' : tone === 'light' ? 'bg-paper' : 'bg-ink'
  const track = tone === 'light' ? 'bg-paper/20' : 'bg-sand'
  return (
    <div
      className={`h-1.5 w-full rounded-full overflow-hidden ${track} ${className}`}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={value}
    >
      <div className={`h-full rounded-full transition-all duration-500 ${bar}`} style={{ width: `${pct}%` }} />
    </div>
  )
}

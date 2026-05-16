export default function Tag({ children, variant = 'default' }) {
  const variants = {
    default: 'bg-surface border-border text-foreground',
    accent: 'bg-accent/10 border-accent/30 text-accent-hover',
    success: 'bg-success/10 border-success/30 text-success',
    warning: 'bg-amber-50 border-amber-200 text-amber-700',
  }
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-sm border text-xs font-normal ${variants[variant]}`}
    >
      {children}
    </span>
  )
}

const variants = {
  default: 'bg-sand text-ink-soft',
  accent: 'bg-amber-tint text-amber-deep',
  success: 'bg-sage-tint text-sage',
  warning: 'bg-ochre-tint text-ochre',
  outline: 'border border-line-strong text-ink-soft',
}

export default function Tag({ children, variant = 'default', className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 h-6 px-2.5 rounded-full text-[12px] font-medium whitespace-nowrap ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  )
}

export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const base =
    'inline-flex items-center gap-2 px-5 py-3 rounded-md text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed'
  const variants = {
    primary: 'bg-accent text-white hover:bg-accent-hover',
    secondary: 'bg-surface text-foreground border border-border hover:bg-border',
    ghost: 'text-muted hover:text-foreground hover:bg-surface',
  }
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}

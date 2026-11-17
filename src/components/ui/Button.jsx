import { forwardRef } from 'react'

const variants = {
  primary: 'bg-ink text-paper hover:bg-ink-hover shadow-[0_1px_0_rgba(255,255,255,0.08)_inset]',
  secondary: 'bg-card text-ink border border-line-strong hover:border-ink-faint',
  ghost: 'text-ink-soft hover:text-ink hover:bg-sand/70',
  danger: 'text-ink-soft hover:text-danger hover:bg-amber-tint/60',
  destructive: 'bg-danger text-paper hover:bg-[#8F2C22]',
}

const sizes = {
  md: 'h-11 px-5 text-[14px]',
  sm: 'h-9 px-3.5 text-[13px]',
  icon: 'h-10 w-10 justify-center',
}

const Button = forwardRef(function Button(
  { children, variant = 'primary', size = 'md', className = '', ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
})

export default Button

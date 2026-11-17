import { Link } from 'react-router-dom'
import { ArrowLeft, SearchX } from 'lucide-react'

export function BackLink({ to, children }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-1.5 h-8 -ml-1 pl-1 pr-3 rounded-full text-[13px] font-medium text-ink-soft hover:text-ink hover:bg-sand/70 transition-colors mb-5"
    >
      <ArrowLeft size={15} strokeWidth={1.75} /> {children}
    </Link>
  )
}

export default function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between mb-8 md:mb-10">
      <div className="min-w-0">
        {eyebrow && <p className="text-[13px] font-medium text-amber mb-2">{eyebrow}</p>}
        <h1 className="text-[32px] md:text-[40px] leading-[1.05] font-semibold text-ink">{title}</h1>
        {description && <p className="text-ink-soft mt-2.5 max-w-xl">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </header>
  )
}

export function SectionHeader({ title, count, action, className = '' }) {
  return (
    <div className={`flex items-center justify-between gap-3 mb-3.5 ${className}`}>
      <h2 className="flex items-center gap-2.5 text-[17px] font-semibold text-ink">
        {title}
        {count != null && (
          <span className="font-sans text-[12px] font-semibold text-ink-soft bg-sand rounded-full h-5 min-w-5 px-1.5 inline-flex items-center justify-center tabular">
            {count}
          </span>
        )}
      </h2>
      {action}
    </div>
  )
}

export function EmptyState({ icon: Icon, title, children, action }) {
  return (
    <div className="rounded-xl border border-dashed border-line-strong px-6 py-12 text-center">
      {Icon && (
        <span className="mx-auto mb-4 w-12 h-12 rounded-full bg-sand text-ink-soft inline-flex items-center justify-center">
          <Icon size={20} strokeWidth={1.75} />
        </span>
      )}
      <p className="font-display font-semibold text-ink text-[17px]">{title}</p>
      {children && <p className="text-ink-soft text-[14px] mt-1.5 max-w-sm mx-auto">{children}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  )
}

export function NotFound({ title = "We couldn't find that", backTo = '/occasions', backLabel = 'Back to occasions', children }) {
  return (
    <div className="pt-10">
      <EmptyState
        icon={SearchX}
        title={title}
        action={
          <Link
            to={backTo}
            className="inline-flex items-center gap-2 h-11 px-5 rounded-full border border-line-strong bg-card text-ink text-[14px] font-medium hover:border-ink-faint"
          >
            <ArrowLeft size={16} strokeWidth={1.75} /> {backLabel}
          </Link>
        }
      >
        {children ?? 'It may have been deleted, or the link is out of date.'}
      </EmptyState>
    </div>
  )
}

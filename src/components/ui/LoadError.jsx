import { CloudOff, RotateCw } from 'lucide-react'
import { LogoMark } from './Logo'
import Button from './Button'

export default function LoadError({ onRetry }) {
  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center px-6 text-center">
      <LogoMark size={36} />
      <span className="mt-8 w-14 h-14 rounded-full bg-amber-tint text-amber inline-flex items-center justify-center">
        <CloudOff size={24} strokeWidth={1.75} />
      </span>
      <h1 className="mt-5 text-[26px] font-semibold text-ink">We couldn't load your planner</h1>
      <p className="mt-2 text-ink-soft max-w-sm">
        Your gifts and dates are safe. This is usually a connection problem, so try again in a moment.
      </p>
      <Button className="mt-7" onClick={onRetry}>
        <RotateCw size={16} strokeWidth={1.75} />
        Try again
      </Button>
    </div>
  )
}

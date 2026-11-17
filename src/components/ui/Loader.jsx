import { LogoMark } from './Logo'

export default function FullPageLoader() {
  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center gap-4" aria-busy="true">
      <span className="animate-pulse">
        <LogoMark size={40} />
      </span>
      <span className="text-[13px] text-ink-faint">Gathering your occasions…</span>
    </div>
  )
}

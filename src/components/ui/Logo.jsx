// Giftify mark: a peach bow on an ink tile ("The bow", chosen 2026-11-17)
const LOOPS = 'M32 29 C24 12 7 12 8.5 23 C9.5 31 23 31.5 32 29 Z M27.5 26.6 C22 18.5 14 18.5 14.5 23.3 C15 27.4 22 27.6 27.5 26.6 Z M 32 29 C 40 12 57 12 55.5 23 C 54.5 31 41 31.5 32 29 Z M 36.5 26.6 C 42 18.5 50 18.5 49.5 23.3 C 49 27.4 42 27.6 36.5 26.6 Z'
const TAILS = 'M29.5 31 L19 51 L24.5 49 L27 54 L33.5 33 Z M 34.5 31 L 45 51 L 39.5 49 L 37 54 L 30.5 33 Z'

export function BowGlyph({ color = '#F2B33D', knotStroke = '#151C3B' }) {
  return (
    <>
      <path fillRule="evenodd" fill={color} d={LOOPS} />
      <path fill={color} d={TAILS} />
      <rect x="27.5" y="25" width="9" height="10" rx="3.2" fill={color} stroke={knotStroke} strokeWidth="1.6" />
    </>
  )
}

export function LogoMark({ size = 28, tile = true }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      {tile && <rect width="64" height="64" rx="14" fill="#151C3B" />}
      <BowGlyph />
    </svg>
  )
}

export default function Logo({ size = 28, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark size={size} />
      <span className="font-display font-bold text-[19px] tracking-tight text-ink">Giftify</span>
    </span>
  )
}

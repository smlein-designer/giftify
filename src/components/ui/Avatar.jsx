import { tintFor } from '../../lib/tint'
import Glyph from '../../lib/glyph'

const sizes = {
  xs: { box: 'w-7 h-7', icon: 14 },
  sm: { box: 'w-9 h-9', icon: 17 },
  md: { box: 'w-12 h-12', icon: 21 },
  lg: { box: 'w-16 h-16', icon: 27 },
  xl: { box: 'w-20 h-20', icon: 34 },
}

// Monogram (or a line icon for pets/babies) inside a soft, stable color disc
export default function Avatar({ emoji, name = '', size = 'md', className = '' }) {
  const t = tintFor(name)
  const s = sizes[size]
  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 select-none rounded-full ring-1 ring-inset ${t.ring} ${t.bg} ${t.fg} ${s.box} ${className}`}
      aria-hidden="true"
    >
      <Glyph emoji={emoji} name={name} size={s.icon} />
    </span>
  )
}

export function AvatarStack({ people = [], max = 4, size = 'xs' }) {
  const shown = people.slice(0, max)
  const extra = people.length - shown.length
  return (
    <span className="inline-flex items-center">
      {shown.map((p, i) => (
        <span key={p.id ?? i} className={`rounded-full ring-2 ring-card ${i > 0 ? '-ml-2' : ''}`}>
          <Avatar emoji={p.emoji} name={p.name} size={size} />
        </span>
      ))}
      {extra > 0 && (
        <span className="-ml-2 w-7 h-7 rounded-full bg-sand ring-2 ring-card text-[11px] font-semibold text-ink-soft inline-flex items-center justify-center">
          +{extra}
        </span>
      )}
    </span>
  )
}

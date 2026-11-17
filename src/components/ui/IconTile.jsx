import { tintFor } from '../../lib/tint'
import Glyph from '../../lib/glyph'

// Line icon in a soft, stable color square (dates, occasions)
export default function IconTile({ icon, name, size = 'md' }) {
  const t = tintFor(name)
  const lg = size === 'lg'
  const sm = size === 'sm'
  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 ring-1 ring-inset ${t.ring} ${t.bg} ${t.fg} ${
        lg ? 'w-16 h-16 rounded-xl' : sm ? 'w-full aspect-square rounded-[12px]' : 'w-12 h-12 rounded-md'
      }`}
    >
      <Glyph emoji={icon} name={name} size={lg ? 28 : sm ? 18 : 21} useName />
    </span>
  )
}

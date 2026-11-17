// Stable, curated color pairs for people and objects that have no photo.
// Class strings are written out in full so Tailwind keeps them.
const TINTS = [
  { bg: 'bg-[#FCEFD2]', fg: 'text-[#7A4100]', ring: 'ring-[#F0D9A6]' }, // amber
  { bg: 'bg-[#DBEEE5]', fg: 'text-[#2A5A46]', ring: 'ring-[#C0DCCE]' }, // sage
  { bg: 'bg-[#E1E6F8]', fg: 'text-[#3A3F86]', ring: 'ring-[#CDD2F0]' }, // plum
  { bg: 'bg-[#F4E8CC]', fg: 'text-[#7A5612]', ring: 'ring-[#E1D5AE]' }, // ochre
  { bg: 'bg-[#DFF0F1]', fg: 'text-[#22585E]', ring: 'ring-[#BCDDE0]' }, // slate
  { bg: 'bg-[#F6E1E8]', fg: 'text-[#86244A]', ring: 'ring-[#ECC6D3]' }, // rose
]

export function tintFor(key = '') {
  let h = 0
  const s = String(key)
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return TINTS[h % TINTS.length]
}

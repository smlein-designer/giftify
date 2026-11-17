import {
  TreePine, Cake, Dog, Cat, Rabbit, PawPrint, Flower2, GraduationCap, Wine, Egg, Heart, Gift,
  PartyPopper, Baby, Star, Snowflake, Moon, Gem, Clover, Bird, Fish, Squirrel, Ghost, Sun, CalendarDays,
} from 'lucide-react'

// Emoji are stored as data (recipient.emoji, holiday.icon) but displayed as
// fine line icons or monogram initials, so the UI never shows cartoon emoji.
const BY_EMOJI = {
  '🎄': TreePine, '🎅': TreePine, '⛄': Snowflake, '❄️': Snowflake,
  '🎂': Cake, '🧁': Cake, '🍰': Cake,
  '🐶': Dog, '🐕': Dog, '🐱': Cat, '🐈': Cat, '🐰': Rabbit, '🐇': Rabbit,
  '🐾': PawPrint, '🐹': Squirrel, '🐦': Bird, '🐠': Fish, '🐟': Fish,
  '💐': Flower2, '🌷': Flower2, '🌸': Flower2, '🌹': Flower2,
  '🎓': GraduationCap, '🥂': Wine, '🍾': Wine, '🍷': Wine,
  '🐣': Egg, '🥚': Egg, 
  '❤️': Heart, '💕': Heart, '💝': Heart, '💘': Heart,
  '🎁': Gift, '🎉': PartyPopper, '🎊': PartyPopper, '👶': Baby, '🍼': Baby,
  '⭐': Star, '🌟': Star, '🌙': Moon, '🕎': Star, '💍': Gem, '💎': Gem,
  '🍀': Clover, '☘️': Clover, '🎃': Ghost, '👻': Ghost, '☀️': Sun, '📅': CalendarDays,
}

// Fallback for dates whose emoji isn't recognized
const BY_NAME = [
  [/birthday|bday/i, Cake], [/anniversary|wedding/i, Wine], [/christmas|xmas/i, TreePine],
  [/graduat/i, GraduationCap], [/mother|mom/i, Flower2], [/valentine/i, Heart],
  [/easter/i, Egg], [/hanukkah|chanukah|diwali/i, Star], [/halloween/i, Ghost],
  [/baby|shower/i, Baby], [/new year/i, PartyPopper],
]

export function iconFor(emoji, name = '', { useName = false } = {}) {
  const key = (emoji || '').trim()
  if (BY_EMOJI[key]) return BY_EMOJI[key]
  if (useName) {
    const hit = BY_NAME.find(([re]) => re.test(name))
    if (hit) return hit[1]
  }
  return null
}

// Line icon if we have one, otherwise a Syne monogram
export default function Glyph({ emoji, name = '', size = 20, useName = false, className = '' }) {
  const Icon = iconFor(emoji, name, { useName })
  if (Icon) return <Icon size={size} strokeWidth={1.5} className={className} aria-hidden="true" />
  return (
    <span
      className={`font-display font-semibold leading-none ${className}`}
      style={{ fontSize: Math.round(size * 1.05), letterSpacing: '-0.02em' }}
      aria-hidden="true"
    >
      {name.trim().charAt(0).toUpperCase() || '·'}
    </span>
  )
}

// Choices offered in the forms (stored as emoji for data compatibility)
export const RECIPIENT_GLYPHS = [
  { value: '👤', label: 'Initial' },
  { value: '👶', label: 'Baby' },
  { value: '🐶', label: 'Dog' },
  { value: '🐱', label: 'Cat' },
  { value: '🐰', label: 'Rabbit' },
  { value: '🐦', label: 'Bird' },
  { value: '🐠', label: 'Fish' },
  { value: '🐹', label: 'Small pet' },
  { value: '🐾', label: 'Other pet' },
]

export const HOLIDAY_GLYPHS = [
  { value: '🎂', label: 'Birthday' },
  { value: '🥂', label: 'Anniversary' },
  { value: '❤️', label: 'Love' },
  { value: '💐', label: 'Flowers' },
  { value: '🎓', label: 'Graduation' },
  { value: '👶', label: 'Baby' },
  { value: '💍', label: 'Wedding' },
  { value: '🎄', label: 'Tree' },
  { value: '❄️', label: 'Winter' },
  { value: '🐣', label: 'Spring' },
  { value: '⭐', label: 'Star' },
  { value: '🌙', label: 'Moon' },
  { value: '🍀', label: 'Clover' },
  { value: '🎃', label: 'Autumn' },
  { value: '🎉', label: 'Celebration' },
  { value: '🎁', label: 'Gift' },
]

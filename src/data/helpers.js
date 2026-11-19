import {
  holidays,
  recipients,
  products,
  occasions,
  gifts,
  giftRecipients,
  giftProducts,
  holidayRecipients,
  holidayProducts,
} from './seed'
import { HOLIDAY_DATES } from './holidayDates'

// Dates are stored as 'YYYY-MM-DD'. Parse them as local dates so they
// don't shift a day earlier in US time zones.
export function parseDate(dateStr) {
  if (!dateStr) return null
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr)
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  return new Date(dateStr)
}

export function daysUntil(dateStr) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = parseDate(dateStr)
  target.setHours(0, 0, 0, 0)
  return Math.round((target - today) / (1000 * 60 * 60 * 24))
}

export function isUpcoming(dateStr) {
  return daysUntil(dateStr) >= 0
}

export function formatDate(dateStr) {
  return parseDate(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

// Western Easter Sunday for a year (anonymous Gregorian algorithm), as 'YYYY-MM-DD'
export function easterDate(year) {
  const a = year % 19, b = Math.floor(year / 100), c = year % 100
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

const pad = (n) => String(n).padStart(2, '0')
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

// Nth weekday of a month (nth = -1 for the last one), shifted by `offset` days.
// Mother's Day: { month: 5, weekday: 0, nth: 2 } (second Sunday in May)
export function nthWeekdayDate(year, { month, weekday, nth, offset = 0 }) {
  let d
  if (nth > 0) {
    d = new Date(year, month - 1, 1)
    d.setDate(1 + ((weekday - d.getDay() + 7) % 7) + (nth - 1) * 7)
  } else {
    d = new Date(year, month, 0) // last day of the month
    d.setDate(d.getDate() - ((d.getDay() - weekday + 7) % 7))
  }
  d.setDate(d.getDate() + offset)
  return ymd(d)
}

// The date a holiday falls on in a given year, or null if we can't work it out
export function holidayDateInYear(holiday, year) {
  const dl = holiday?.date_logic
  if (dl?.type === 'fixed') return `${year}-${pad(dl.month)}-${pad(dl.day)}`
  if (dl?.type === 'calculated' && dl.rule === 'easter') return easterDate(year)
  if (dl?.type === 'weekday') return nthWeekdayDate(year, dl)
  if (dl?.type === 'table') return (HOLIDAY_DATES[dl.key] ?? []).find((d) => d.startsWith(`${year}-`)) ?? null
  return null
}

// The next `count` upcoming dates for a holiday: [{ year, date }]
export function upcomingHolidayDates(holiday, count = 3) {
  const dl = holiday?.date_logic
  if (dl?.type === 'table') {
    // Lunar holidays can fall twice in one year, so walk the list itself
    return (HOLIDAY_DATES[dl.key] ?? [])
      .filter(isUpcoming)
      .slice(0, count)
      .map((date) => ({ year: Number(date.slice(0, 4)), date }))
  }
  const out = []
  const start = new Date().getFullYear()
  for (let y = start; out.length < count && y < start + count + 1; y++) {
    const date = holidayDateInYear(holiday, y)
    if (date && isUpcoming(date)) out.push({ year: y, date })
  }
  return out
}

// Occasion rows for a holiday's next three upcoming dates, skipping any that exist
export function occasionsForHoliday(holiday, existingOccasions = []) {
  return upcomingHolidayDates(holiday, 3)
    .filter(({ date }) => !existingOccasions.some((o) => o.holiday_id === holiday.id && o.date === date))
    .map(({ year, date }) => ({
      holiday_id: holiday.id,
      name: `${holiday.name} ${year}`,
      date,
      notes: null,
    }))
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

// "Every year on February 14", "Second Sunday in May"
export function describeDateLogic(dl) {
  if (!dl) return 'Date changes each year'
  if (dl.label) return dl.label
  if (dl.type === 'fixed') return `Every year on ${MONTH_NAMES[dl.month - 1]} ${dl.day}`
  if (dl.type === 'calculated' && dl.rule === 'easter') return 'Easter Sunday, which moves each year'
  return 'Date changes each year'
}

// "Ann and Luke", "Ann, Luke and Mia"
function joinNames(list) {
  if (list.length <= 2) return list.join(' and ')
  return `${list.slice(0, -1).join(', ')} and ${list[list.length - 1]}`
}

// What an occasion is called without its year: "Christmas", "Graduation party"
export function occasionLabel(occasion, holiday) {
  if (holiday?.name) return holiday.name
  return (occasion?.name ?? '').replace(/\s+\d{4}$/, '').trim() || null
}

// The name a gift gets from its context:
// "Garlic press for Luke", "Apron and mixing bowls for Mom",
// and before a product is chosen, "Christmas gift for Mom"
export function giftAutoName(recipients = [], products = [], context = null) {
  const items = products.map((p) => p.name)
  const what =
    items.length === 0
      ? context ? `${context} gift` : 'Gift'
      : items.length <= 2 ? joinNames(items) : `${items[0]} + ${items.length - 1} more`
  const name = recipients.length ? `${what} for ${joinNames(recipients.map((r) => r.name))}` : what
  return name.length > 80 ? name.slice(0, 79) + '…' : name
}

// $35, $1,249.99
export function formatMoney(n) {
  const v = Number(n)
  if (n == null || n === '' || isNaN(v)) return ''
  return '$' + v.toLocaleString('en-US', { minimumFractionDigits: v % 1 ? 2 : 0, maximumFractionDigits: 2 })
}

// "Dec 25"
export function formatShort(dateStr) {
  return parseDate(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// { month: 'Dec', day: 25, weekday: 'Fri' }
export function dateParts(dateStr) {
  const d = parseDate(dateStr)
  return {
    month: d.toLocaleDateString('en-US', { month: 'short' }),
    day: d.getDate(),
    weekday: d.toLocaleDateString('en-US', { weekday: 'short' }),
  }
}

// "December 2026", used to group lists by month
export function monthLabel(dateStr) {
  return parseDate(dateStr).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

// "Today", "Tomorrow", "In 12 days", "3 days ago"
export function relativeDays(days) {
  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  if (days === -1) return 'Yesterday'
  if (days < 0) return `${Math.abs(days)} days ago`
  return `In ${days} days`
}

export function getHolidayById(id) {
  return holidays.find((h) => h.id === id)
}

export function getRecipientById(id) {
  return recipients.find((r) => r.id === id)
}

export function getProductById(id) {
  return products.find((p) => p.id === id)
}

export function getOccasionById(id) {
  return occasions.find((o) => o.id === id)
}

export function getGiftById(id) {
  return gifts.find((g) => g.id === id)
}

export function getGiftsForOccasion(occasionId) {
  return gifts.filter((g) => g.occasion_id === occasionId)
}

export function getRecipientsForGift(giftId) {
  return giftRecipients
    .filter((gr) => gr.gift_id === giftId)
    .map((gr) => getRecipientById(gr.recipient_id))
    .filter(Boolean)
}

export function getProductsForGift(giftId) {
  return giftProducts
    .filter((gp) => gp.gift_id === giftId)
    .map((gp) => getProductById(gp.product_id))
    .filter(Boolean)
}

export function getDefaultRecipientsForHoliday(holidayId) {
  return holidayRecipients
    .filter((hr) => hr.holiday_id === holidayId)
    .map((hr) => getRecipientById(hr.recipient_id))
    .filter(Boolean)
}

export function getProductsForHoliday(holidayId) {
  return holidayProducts
    .filter((hp) => hp.holiday_id === holidayId)
    .map((hp) => getProductById(hp.product_id))
    .filter(Boolean)
}

export function getOccasionsForHoliday(holidayId) {
  return occasions.filter((o) => o.holiday_id === holidayId)
}

export function getGiftsForRecipient(recipientId) {
  return giftRecipients
    .filter((gr) => gr.recipient_id === recipientId)
    .map((gr) => getGiftById(gr.gift_id))
    .filter(Boolean)
}

export function getTimesGiven(productId) {
  return giftProducts.filter((gp) => gp.product_id === productId).length
}

export function getUpcomingOccasions() {
  return occasions
    .filter((o) => isUpcoming(o.date))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
}

export function getPastOccasions() {
  return occasions
    .filter((o) => !isUpcoming(o.date))
    .sort((a, b) => new Date(b.date) - new Date(a.date))
}

export function getGiftProgress(occasionId) {
  const occasionGifts = getGiftsForOccasion(occasionId)
  const total = occasionGifts.length
  const purchased = occasionGifts.filter(
    (g) =>
      g.physical_status === 'purchased' ||
      g.physical_status === 'wrapped' ||
      g.physical_status === 'shipped' ||
      g.physical_status === 'received' ||
      g.experience_status === 'confirmed' ||
      g.experience_status === 'executed'
  ).length
  return { total, purchased }
}

export function getNextOccasionForHoliday(holidayId) {
  const upcoming = occasions
    .filter((o) => o.holiday_id === holidayId && isUpcoming(o.date))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
  return upcoming[0] || null
}

export { holidays, recipients, products, occasions, gifts, giftProducts }

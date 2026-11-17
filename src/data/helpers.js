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

// The date a holiday falls on in a given year, or null if we can't work it out
export function holidayDateInYear(holiday, year) {
  const dl = holiday?.date_logic
  if (dl?.type === 'fixed') return `${year}-${String(dl.month).padStart(2, '0')}-${String(dl.day).padStart(2, '0')}`
  if (dl?.type === 'calculated' && dl.rule === 'easter') return easterDate(year)
  return null
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

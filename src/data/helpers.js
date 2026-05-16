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

export function daysUntil(dateStr) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr)
  target.setHours(0, 0, 0, 0)
  return Math.round((target - today) / (1000 * 60 * 60 * 24))
}

export function isUpcoming(dateStr) {
  return daysUntil(dateStr) >= 0
}

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
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

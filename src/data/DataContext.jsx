import { createContext, useContext, useState } from 'react'
import {
  holidays as seedHolidays,
  recipients as seedRecipients,
  products as seedProducts,
  occasions as seedOccasions,
  gifts as seedGifts,
  giftRecipients as seedGiftRecipients,
  giftProducts as seedGiftProducts,
  holidayRecipients as seedHolidayRecipients,
  holidayProducts as seedHolidayProducts,
} from './seed'
import { daysUntil, isUpcoming } from './helpers'

const DataContext = createContext(null)

export function DataProvider({ children }) {
  const [holidays, setHolidays] = useState(seedHolidays)
  const [recipients, setRecipients] = useState(seedRecipients)
  const [products, setProducts] = useState(seedProducts)
  const [occasions, setOccasions] = useState(seedOccasions)
  const [gifts, setGifts] = useState(seedGifts)
  const [giftRecipients, setGiftRecipients] = useState(seedGiftRecipients)
  const [giftProducts, setGiftProducts] = useState(seedGiftProducts)
  const [holidayRecipients, setHolidayRecipients] = useState(seedHolidayRecipients)

  // ── Lookup helpers ──────────────────────────────────────────────────

  const getHolidayById = (id) => holidays.find((h) => h.id === id)
  const getRecipientById = (id) => recipients.find((r) => r.id === id)
  const getProductById = (id) => products.find((p) => p.id === id)
  const getOccasionById = (id) => occasions.find((o) => o.id === id)
  const getGiftById = (id) => gifts.find((g) => g.id === id)

  const getGiftsForOccasion = (occasionId) =>
    gifts.filter((g) => g.occasion_id === occasionId)

  const getRecipientsForGift = (giftId) =>
    giftRecipients
      .filter((gr) => gr.gift_id === giftId)
      .map((gr) => getRecipientById(gr.recipient_id))
      .filter(Boolean)

  const getProductsForGift = (giftId) =>
    giftProducts
      .filter((gp) => gp.gift_id === giftId)
      .map((gp) => getProductById(gp.product_id))
      .filter(Boolean)

  const getDefaultRecipientsForHoliday = (holidayId) =>
    holidayRecipients
      .filter((hr) => hr.holiday_id === holidayId)
      .map((hr) => getRecipientById(hr.recipient_id))
      .filter(Boolean)

  const getOccasionsForHoliday = (holidayId) =>
    occasions.filter((o) => o.holiday_id === holidayId)

  const getGiftsForRecipient = (recipientId) =>
    giftRecipients
      .filter((gr) => gr.recipient_id === recipientId)
      .map((gr) => getGiftById(gr.gift_id))
      .filter(Boolean)

  const getTimesGiven = (productId) =>
    giftProducts.filter((gp) => gp.product_id === productId).length

  const getUpcomingOccasions = () =>
    occasions
      .filter((o) => isUpcoming(o.date))
      .sort((a, b) => new Date(a.date) - new Date(b.date))

  const getPastOccasions = () =>
    occasions
      .filter((o) => !isUpcoming(o.date))
      .sort((a, b) => new Date(b.date) - new Date(a.date))

  const getGiftProgress = (occasionId) => {
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

  const getNextOccasionForHoliday = (holidayId) => {
    const upcoming = occasions
      .filter((o) => o.holiday_id === holidayId && isUpcoming(o.date))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
    return upcoming[0] || null
  }

  // ── Recipient mutations ─────────────────────────────────────────────

  const addRecipient = (data) => {
    const newRecipient = { ...data, id: `r${Date.now()}` }
    setRecipients((prev) => [...prev, newRecipient])
    return newRecipient
  }

  const updateRecipient = (id, data) => {
    setRecipients((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...data } : r))
    )
  }

  const deleteRecipient = (id) => {
    setRecipients((prev) => prev.filter((r) => r.id !== id))
    setGiftRecipients((prev) => prev.filter((gr) => gr.recipient_id !== id))
    setHolidayRecipients((prev) => prev.filter((hr) => hr.recipient_id !== id))
  }

  // ── Product mutations ───────────────────────────────────────────────

  const addProduct = (data) => {
    const newProduct = { ...data, id: `p${Date.now()}` }
    setProducts((prev) => [...prev, newProduct])
    return newProduct
  }

  const updateProduct = (id, data) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...data } : p))
    )
  }

  const deleteProduct = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id))
    setGiftProducts((prev) => prev.filter((gp) => gp.product_id !== id))
  }

  // ── Occasion mutations ──────────────────────────────────────────────

  const addOccasion = (data) => {
    const newOccasion = { ...data, id: `o${Date.now()}` }
    setOccasions((prev) => [...prev, newOccasion])
    return newOccasion
  }

  const updateOccasion = (id, data) => {
    setOccasions((prev) =>
      prev.map((o) => (o.id === id ? { ...o, ...data } : o))
    )
  }

  const deleteOccasion = (id) => {
    setOccasions((prev) => prev.filter((o) => o.id !== id))
    const occasionGiftIds = gifts.filter((g) => g.occasion_id === id).map((g) => g.id)
    setGifts((prev) => prev.filter((g) => g.occasion_id !== id))
    setGiftRecipients((prev) => prev.filter((gr) => !occasionGiftIds.includes(gr.gift_id)))
    setGiftProducts((prev) => prev.filter((gp) => !occasionGiftIds.includes(gp.gift_id)))
  }

  // ── Gift mutations ──────────────────────────────────────────────────

  const addGift = (data, recipientIds = [], productIds = []) => {
    const newGift = { ...data, id: `g${Date.now()}` }
    setGifts((prev) => [...prev, newGift])
    recipientIds.forEach((rid) =>
      setGiftRecipients((prev) => [...prev, { gift_id: newGift.id, recipient_id: rid }])
    )
    productIds.forEach((pid) =>
      setGiftProducts((prev) => [...prev, { gift_id: newGift.id, product_id: pid }])
    )
    return newGift
  }

  const updateGift = (id, data) => {
    setGifts((prev) => prev.map((g) => (g.id === id ? { ...g, ...data } : g)))
  }

  const updateGiftRelations = (giftId, recipientIds, productIds) => {
    setGiftRecipients((prev) => [
      ...prev.filter((gr) => gr.gift_id !== giftId),
      ...recipientIds.map((rid) => ({ gift_id: giftId, recipient_id: rid })),
    ])
    setGiftProducts((prev) => [
      ...prev.filter((gp) => gp.gift_id !== giftId),
      ...productIds.map((pid) => ({ gift_id: giftId, product_id: pid })),
    ])
  }

  const deleteGift = (id) => {
    setGifts((prev) => prev.filter((g) => g.id !== id))
    setGiftRecipients((prev) => prev.filter((gr) => gr.gift_id !== id))
    setGiftProducts((prev) => prev.filter((gp) => gp.gift_id !== id))
  }

  // ── Holiday mutations ───────────────────────────────────────────────

  const addHoliday = (data) => {
    const newHoliday = { ...data, id: `h${Date.now()}`, is_system: false }
    setHolidays((prev) => [...prev, newHoliday])
    return newHoliday
  }

  const updateHoliday = (id, data) => {
    setHolidays((prev) => prev.map((h) => (h.id === id ? { ...h, ...data } : h)))
  }

  const deleteHoliday = (id) => {
    setHolidays((prev) => prev.filter((h) => h.id !== id))
    setHolidayRecipients((prev) => prev.filter((hr) => hr.holiday_id !== id))
  }

  const setDefaultRecipientsForHoliday = (holidayId, recipientIds) => {
    setHolidayRecipients((prev) => [
      ...prev.filter((hr) => hr.holiday_id !== holidayId),
      ...recipientIds.map((rid) => ({ holiday_id: holidayId, recipient_id: rid })),
    ])
  }

  const value = {
    // Raw state
    holidays, recipients, products, occasions, gifts,
    giftRecipients, giftProducts, holidayRecipients,
    // Lookup helpers
    getHolidayById, getRecipientById, getProductById, getOccasionById, getGiftById,
    getGiftsForOccasion, getRecipientsForGift, getProductsForGift,
    getDefaultRecipientsForHoliday, getOccasionsForHoliday,
    getGiftsForRecipient, getTimesGiven,
    getUpcomingOccasions, getPastOccasions, getGiftProgress, getNextOccasionForHoliday,
    // Mutations
    addRecipient, updateRecipient, deleteRecipient,
    addProduct, updateProduct, deleteProduct,
    addOccasion, updateOccasion, deleteOccasion,
    addGift, updateGift, updateGiftRelations, deleteGift,
    addHoliday, updateHoliday, deleteHoliday, setDefaultRecipientsForHoliday,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used inside DataProvider')
  return ctx
}

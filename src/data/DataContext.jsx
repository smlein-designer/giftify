import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { isUpcoming } from './helpers'

const DataContext = createContext(null)

const SYSTEM_HOLIDAYS = [
  { name: 'Christmas', icon: '🎄', date_logic: { type: 'fixed', month: 12, day: 25 }, is_system: true },
  { name: 'Easter', icon: '🐣', date_logic: { type: 'calculated', rule: 'easter' }, is_system: true },
]

export function DataProvider({ children, userId }) {
  const [loading, setLoading] = useState(true)
  const [holidays, setHolidays] = useState([])
  const [recipients, setRecipients] = useState([])
  const [products, setProducts] = useState([])
  const [occasions, setOccasions] = useState([])
  const [gifts, setGifts] = useState([])
  const [giftRecipients, setGiftRecipients] = useState([])
  const [giftProducts, setGiftProducts] = useState([])
  const [holidayRecipients, setHolidayRecipients] = useState([])

  useEffect(() => {
    loadAll()
  }, [])

  async function loadAll() {
    const [
      { data: h }, { data: r }, { data: p }, { data: o }, { data: g },
      { data: gr }, { data: gp }, { data: hr },
    ] = await Promise.all([
      supabase.from('holidays').select('*').order('created_at'),
      supabase.from('recipients').select('*').order('created_at'),
      supabase.from('products').select('*').order('created_at'),
      supabase.from('occasions').select('*').order('date'),
      supabase.from('gifts').select('*').order('created_at'),
      supabase.from('gift_recipients').select('*'),
      supabase.from('gift_products').select('*'),
      supabase.from('holiday_recipients').select('*'),
    ])

    const loadedHolidays = h || []
    if (loadedHolidays.length === 0) {
      const toInsert = SYSTEM_HOLIDAYS.map((sh) => ({
        ...sh,
        id: crypto.randomUUID(),
        user_id: userId,
      }))
      await supabase.from('holidays').insert(toInsert)
      setHolidays(toInsert)
    } else {
      setHolidays(loadedHolidays)
    }

    setRecipients(r || [])
    setProducts(p || [])
    setOccasions(o || [])
    setGifts(g || [])
    setGiftRecipients(gr || [])
    setGiftProducts(gp || [])
    setHolidayRecipients(hr || [])
    setLoading(false)
  }

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
    const newRecipient = { ...data, id: crypto.randomUUID(), user_id: userId }
    setRecipients((prev) => [...prev, newRecipient])
    supabase.from('recipients').insert(newRecipient).then(() => {})
    return newRecipient
  }

  const updateRecipient = (id, data) => {
    setRecipients((prev) => prev.map((r) => (r.id === id ? { ...r, ...data } : r)))
    supabase.from('recipients').update(data).eq('id', id).then(() => {})
  }

  const deleteRecipient = (id) => {
    setRecipients((prev) => prev.filter((r) => r.id !== id))
    setGiftRecipients((prev) => prev.filter((gr) => gr.recipient_id !== id))
    setHolidayRecipients((prev) => prev.filter((hr) => hr.recipient_id !== id))
    supabase.from('recipients').delete().eq('id', id).then(() => {})
  }

  // ── Product mutations ───────────────────────────────────────────────

  const addProduct = (data) => {
    const newProduct = { ...data, id: crypto.randomUUID(), user_id: userId }
    setProducts((prev) => [...prev, newProduct])
    supabase.from('products').insert(newProduct).then(() => {})
    return newProduct
  }

  const updateProduct = (id, data) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)))
    supabase.from('products').update(data).eq('id', id).then(() => {})
  }

  const deleteProduct = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id))
    setGiftProducts((prev) => prev.filter((gp) => gp.product_id !== id))
    supabase.from('products').delete().eq('id', id).then(() => {})
  }

  // ── Occasion mutations ──────────────────────────────────────────────

  const addOccasion = (data) => {
    const newOccasion = { ...data, id: crypto.randomUUID(), user_id: userId }
    setOccasions((prev) => [...prev, newOccasion])
    supabase.from('occasions').insert(newOccasion).then(() => {})
    return newOccasion
  }

  const updateOccasion = (id, data) => {
    setOccasions((prev) => prev.map((o) => (o.id === id ? { ...o, ...data } : o)))
    supabase.from('occasions').update(data).eq('id', id).then(() => {})
  }

  const deleteOccasion = (id) => {
    const occasionGiftIds = gifts.filter((g) => g.occasion_id === id).map((g) => g.id)
    setOccasions((prev) => prev.filter((o) => o.id !== id))
    setGifts((prev) => prev.filter((g) => g.occasion_id !== id))
    setGiftRecipients((prev) => prev.filter((gr) => !occasionGiftIds.includes(gr.gift_id)))
    setGiftProducts((prev) => prev.filter((gp) => !occasionGiftIds.includes(gp.gift_id)))
    supabase.from('occasions').delete().eq('id', id).then(() => {})
  }

  // ── Gift mutations ──────────────────────────────────────────────────

  const addGift = (data, recipientIds = [], productIds = []) => {
    const newGift = { ...data, id: crypto.randomUUID(), user_id: userId }
    const grRows = recipientIds.map((rid) => ({ gift_id: newGift.id, recipient_id: rid }))
    const gpRows = productIds.map((pid) => ({ gift_id: newGift.id, product_id: pid }))
    setGifts((prev) => [...prev, newGift])
    setGiftRecipients((prev) => [...prev, ...grRows])
    setGiftProducts((prev) => [...prev, ...gpRows])
    supabase.from('gifts').insert(newGift).then(() => {})
    if (grRows.length > 0) supabase.from('gift_recipients').insert(grRows).then(() => {})
    if (gpRows.length > 0) supabase.from('gift_products').insert(gpRows).then(() => {})
    return newGift
  }

  const updateGift = (id, data) => {
    setGifts((prev) => prev.map((g) => (g.id === id ? { ...g, ...data } : g)))
    supabase.from('gifts').update(data).eq('id', id).then(() => {})
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
    supabase
      .from('gift_recipients')
      .delete()
      .eq('gift_id', giftId)
      .then(() => {
        if (recipientIds.length > 0) {
          supabase
            .from('gift_recipients')
            .insert(recipientIds.map((rid) => ({ gift_id: giftId, recipient_id: rid })))
            .then(() => {})
        }
      })
    supabase
      .from('gift_products')
      .delete()
      .eq('gift_id', giftId)
      .then(() => {
        if (productIds.length > 0) {
          supabase
            .from('gift_products')
            .insert(productIds.map((pid) => ({ gift_id: giftId, product_id: pid })))
            .then(() => {})
        }
      })
  }

  const deleteGift = (id) => {
    setGifts((prev) => prev.filter((g) => g.id !== id))
    setGiftRecipients((prev) => prev.filter((gr) => gr.gift_id !== id))
    setGiftProducts((prev) => prev.filter((gp) => gp.gift_id !== id))
    supabase.from('gifts').delete().eq('id', id).then(() => {})
  }

  // ── Holiday mutations ───────────────────────────────────────────────

  const addHoliday = (data) => {
    const newHoliday = { ...data, id: crypto.randomUUID(), user_id: userId, is_system: false }
    setHolidays((prev) => [...prev, newHoliday])
    supabase.from('holidays').insert(newHoliday).then(() => {})
    return newHoliday
  }

  const updateHoliday = (id, data) => {
    setHolidays((prev) => prev.map((h) => (h.id === id ? { ...h, ...data } : h)))
    supabase.from('holidays').update(data).eq('id', id).then(() => {})
  }

  const deleteHoliday = (id) => {
    setHolidays((prev) => prev.filter((h) => h.id !== id))
    setHolidayRecipients((prev) => prev.filter((hr) => hr.holiday_id !== id))
    supabase.from('holidays').delete().eq('id', id).then(() => {})
  }

  const setDefaultRecipientsForHoliday = (holidayId, recipientIds) => {
    setHolidayRecipients((prev) => [
      ...prev.filter((hr) => hr.holiday_id !== holidayId),
      ...recipientIds.map((rid) => ({ holiday_id: holidayId, recipient_id: rid })),
    ])
    supabase
      .from('holiday_recipients')
      .delete()
      .eq('holiday_id', holidayId)
      .then(() => {
        if (recipientIds.length > 0) {
          supabase
            .from('holiday_recipients')
            .insert(recipientIds.map((rid) => ({ holiday_id: holidayId, recipient_id: rid })))
            .then(() => {})
        }
      })
  }

  const value = {
    holidays, recipients, products, occasions, gifts,
    giftRecipients, giftProducts, holidayRecipients,
    getHolidayById, getRecipientById, getProductById, getOccasionById, getGiftById,
    getGiftsForOccasion, getRecipientsForGift, getProductsForGift,
    getDefaultRecipientsForHoliday, getOccasionsForHoliday,
    getGiftsForRecipient, getTimesGiven,
    getUpcomingOccasions, getPastOccasions, getGiftProgress, getNextOccasionForHoliday,
    addRecipient, updateRecipient, deleteRecipient,
    addProduct, updateProduct, deleteProduct,
    addOccasion, updateOccasion, deleteOccasion,
    addGift, updateGift, updateGiftRelations, deleteGift,
    addHoliday, updateHoliday, deleteHoliday, setDefaultRecipientsForHoliday,
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used inside DataProvider')
  return ctx
}

import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { isUpcoming, holidayDateInYear } from './helpers'
import FullPageLoader from '../components/ui/Loader'
import { useToast } from '../components/ui/Toast'
import LoadError from '../components/ui/LoadError'

const DataContext = createContext(null)

const SYSTEM_HOLIDAYS = [
  { name: 'Christmas', icon: '🎄', date_logic: { type: 'fixed', month: 12, day: 25 }, is_system: true },
  { name: 'Easter', icon: '🐣', date_logic: { type: 'calculated', rule: 'easter' }, is_system: true },
]

export function DataProvider({ children, userId }) {
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
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
    setLoading(true)
    setLoadError(null)
    const results = await Promise.all([
      supabase.from('holidays').select('*').order('created_at'),
      supabase.from('recipients').select('*').order('created_at'),
      supabase.from('products').select('*').order('created_at'),
      supabase.from('occasions').select('*').order('date'),
      supabase.from('gifts').select('*').order('created_at'),
      supabase.from('gift_recipients').select('*'),
      supabase.from('gift_products').select('*'),
      supabase.from('holiday_recipients').select('*'),
    ]).catch((err) => [{ error: err }])

    const failed = results.find((r) => r?.error)
    if (failed) {
      console.error('Giftify: failed to load data', failed.error)
      setLoadError(failed.error)
      setLoading(false)
      return
    }
    const [
      { data: h }, { data: r }, { data: p }, { data: o }, { data: g },
      { data: gr }, { data: gp }, { data: hr },
    ] = results

    const loadedHolidays = h || []
    let loadedOccasions = o || []
    if (loadedHolidays.length === 0) {
      // First sign-in: add the standard holidays, plus their next three years
      // of occasions so the home screen isn't empty on day one.
      const toInsert = SYSTEM_HOLIDAYS.map((sh) => ({
        ...sh,
        id: crypto.randomUUID(),
        user_id: userId,
      }))
      const year = new Date().getFullYear()
      const starterOccasions = toInsert.flatMap((hol) =>
        [year, year + 1, year + 2]
          .map((y) => ({ y, date: holidayDateInYear(hol, y) }))
          .filter(({ date }) => date && isUpcoming(date))
          .map(({ y, date }) => ({
            id: crypto.randomUUID(),
            user_id: userId,
            holiday_id: hol.id,
            name: `${hol.name} ${y}`,
            date,
            notes: null,
          }))
      )
      const { error } = await supabase.from('holidays').insert(toInsert)
      if (error) {
        console.error('Giftify: could not seed holidays', error)
      } else if (starterOccasions.length > 0) {
        const { error: occError } = await supabase.from('occasions').insert(starterOccasions)
        if (occError) console.error('Giftify: could not seed occasions', occError)
        else loadedOccasions = [...loadedOccasions, ...starterOccasions]
      }
      setHolidays(toInsert)
    } else {
      setHolidays(loadedHolidays)
    }

    setRecipients(r || [])
    setProducts(p || [])
    setOccasions(loadedOccasions)
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

  // ── Saving ──────────────────────────────────────────────────────────
  //
  // Changes show on screen immediately, then save in the background. If the
  // database rejects a change, the screen is put back the way it was and a
  // message explains what happened. A success message, when given, only
  // appears once the database has confirmed the save.

  const must = async (query) => {
    const { error } = await query
    if (error) throw error
  }

  const snapshot = () => {
    const s = { holidays, recipients, products, occasions, gifts, giftRecipients, giftProducts, holidayRecipients }
    return () => {
      setHolidays(s.holidays)
      setRecipients(s.recipients)
      setProducts(s.products)
      setOccasions(s.occasions)
      setGifts(s.gifts)
      setGiftRecipients(s.giftRecipients)
      setGiftProducts(s.giftProducts)
      setHolidayRecipients(s.holidayRecipients)
    }
  }

  const persist = (action, run, { restore, success } = {}) =>
    Promise.resolve()
      .then(run)
      .then(() => {
        if (success) toast.success(success)
        return true
      })
      .catch((err) => {
        console.error(`Giftify: could not ${action}`, err)
        restore?.()
        toast.error(`Couldn't ${action}, so the change was undone. Check your connection and try again.`)
        return false
      })

  // Replace a join table's rows for one parent (delete, then insert)
  const replaceRows = async (table, key, id, rows) => {
    await must(supabase.from(table).delete().eq(key, id))
    if (rows.length > 0) await must(supabase.from(table).insert(rows))
  }

  // ── Recipient mutations ─────────────────────────────────────────────

  const addRecipient = (data, opts = {}) => {
    const restore = snapshot()
    const newRecipient = { ...data, id: crypto.randomUUID(), user_id: userId }
    setRecipients((prev) => [...prev, newRecipient])
    persist('add this person', () => must(supabase.from('recipients').insert(newRecipient)), { restore, ...opts })
    return newRecipient
  }

  const updateRecipient = (id, data, opts = {}) => {
    const restore = snapshot()
    setRecipients((prev) => prev.map((r) => (r.id === id ? { ...r, ...data } : r)))
    return persist('save these changes', () => must(supabase.from('recipients').update(data).eq('id', id)), { restore, ...opts })
  }

  const deleteRecipient = (id, opts = {}) => {
    const restore = snapshot()
    setRecipients((prev) => prev.filter((r) => r.id !== id))
    setGiftRecipients((prev) => prev.filter((gr) => gr.recipient_id !== id))
    setHolidayRecipients((prev) => prev.filter((hr) => hr.recipient_id !== id))
    return persist('delete this person', () => must(supabase.from('recipients').delete().eq('id', id)), { restore, ...opts })
  }

  // ── Product mutations ───────────────────────────────────────────────

  const addProduct = (data, opts = {}) => {
    const restore = snapshot()
    const newProduct = { ...data, id: crypto.randomUUID(), user_id: userId }
    setProducts((prev) => [...prev, newProduct])
    persist('save this idea', () => must(supabase.from('products').insert(newProduct)), { restore, ...opts })
    return newProduct
  }

  const updateProduct = (id, data, opts = {}) => {
    const restore = snapshot()
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)))
    return persist('save these changes', () => must(supabase.from('products').update(data).eq('id', id)), { restore, ...opts })
  }

  const deleteProduct = (id, opts = {}) => {
    const restore = snapshot()
    setProducts((prev) => prev.filter((p) => p.id !== id))
    setGiftProducts((prev) => prev.filter((gp) => gp.product_id !== id))
    return persist('delete this idea', () => must(supabase.from('products').delete().eq('id', id)), { restore, ...opts })
  }

  // ── Occasion mutations ──────────────────────────────────────────────

  const addOccasion = (data, opts = {}) => {
    const restore = snapshot()
    const newOccasion = { ...data, id: crypto.randomUUID(), user_id: userId }
    setOccasions((prev) => [...prev, newOccasion])
    persist('add this occasion', () => must(supabase.from('occasions').insert(newOccasion)), { restore, ...opts })
    return newOccasion
  }

  const updateOccasion = (id, data, opts = {}) => {
    const restore = snapshot()
    setOccasions((prev) => prev.map((o) => (o.id === id ? { ...o, ...data } : o)))
    return persist('save these changes', () => must(supabase.from('occasions').update(data).eq('id', id)), { restore, ...opts })
  }

  const deleteOccasion = (id, opts = {}) => {
    const restore = snapshot()
    const occasionGiftIds = gifts.filter((g) => g.occasion_id === id).map((g) => g.id)
    setOccasions((prev) => prev.filter((o) => o.id !== id))
    setGifts((prev) => prev.filter((g) => g.occasion_id !== id))
    setGiftRecipients((prev) => prev.filter((gr) => !occasionGiftIds.includes(gr.gift_id)))
    setGiftProducts((prev) => prev.filter((gp) => !occasionGiftIds.includes(gp.gift_id)))
    return persist('delete this occasion', () => must(supabase.from('occasions').delete().eq('id', id)), { restore, ...opts })
  }

  // ── Gift mutations ──────────────────────────────────────────────────

  const addGift = (data, recipientIds = [], productIds = [], opts = {}) => {
    const restore = snapshot()
    const newGift = { ...data, id: crypto.randomUUID(), user_id: userId }
    const grRows = recipientIds.map((rid) => ({ gift_id: newGift.id, recipient_id: rid }))
    const gpRows = productIds.map((pid) => ({ gift_id: newGift.id, product_id: pid }))
    setGifts((prev) => [...prev, newGift])
    setGiftRecipients((prev) => [...prev, ...grRows])
    setGiftProducts((prev) => [...prev, ...gpRows])
    persist(
      'add this gift',
      async () => {
        await must(supabase.from('gifts').insert(newGift))
        await Promise.all([
          grRows.length > 0 && must(supabase.from('gift_recipients').insert(grRows)),
          gpRows.length > 0 && must(supabase.from('gift_products').insert(gpRows)),
        ])
      },
      { restore, ...opts }
    )
    return newGift
  }

  const updateGift = (id, data, opts = {}) => {
    const restore = snapshot()
    setGifts((prev) => prev.map((g) => (g.id === id ? { ...g, ...data } : g)))
    return persist('update this gift', () => must(supabase.from('gifts').update(data).eq('id', id)), { restore, ...opts })
  }

  const updateGiftRelations = (giftId, recipientIds, productIds, opts = {}) => {
    const restore = snapshot()
    const grRows = recipientIds.map((rid) => ({ gift_id: giftId, recipient_id: rid }))
    const gpRows = productIds.map((pid) => ({ gift_id: giftId, product_id: pid }))
    setGiftRecipients((prev) => [...prev.filter((gr) => gr.gift_id !== giftId), ...grRows])
    setGiftProducts((prev) => [...prev.filter((gp) => gp.gift_id !== giftId), ...gpRows])
    return persist(
      'update this gift',
      () =>
        Promise.all([
          replaceRows('gift_recipients', 'gift_id', giftId, grRows),
          replaceRows('gift_products', 'gift_id', giftId, gpRows),
        ]),
      { restore, ...opts }
    )
  }

  const deleteGift = (id, opts = {}) => {
    const restore = snapshot()
    setGifts((prev) => prev.filter((g) => g.id !== id))
    setGiftRecipients((prev) => prev.filter((gr) => gr.gift_id !== id))
    setGiftProducts((prev) => prev.filter((gp) => gp.gift_id !== id))
    return persist('delete this gift', () => must(supabase.from('gifts').delete().eq('id', id)), { restore, ...opts })
  }

  // ── Holiday mutations ───────────────────────────────────────────────

  const addHoliday = (data, opts = {}) => {
    const restore = snapshot()
    const newHoliday = { ...data, id: crypto.randomUUID(), user_id: userId, is_system: false }
    setHolidays((prev) => [...prev, newHoliday])
    persist('add this date', () => must(supabase.from('holidays').insert(newHoliday)), { restore, ...opts })
    return newHoliday
  }

  const updateHoliday = (id, data, opts = {}) => {
    const restore = snapshot()
    setHolidays((prev) => prev.map((h) => (h.id === id ? { ...h, ...data } : h)))
    return persist('save these changes', () => must(supabase.from('holidays').update(data).eq('id', id)), { restore, ...opts })
  }

  const deleteHoliday = (id, opts = {}) => {
    const restore = snapshot()
    setHolidays((prev) => prev.filter((h) => h.id !== id))
    setHolidayRecipients((prev) => prev.filter((hr) => hr.holiday_id !== id))
    return persist('delete this date', () => must(supabase.from('holidays').delete().eq('id', id)), { restore, ...opts })
  }

  const setDefaultRecipientsForHoliday = (holidayId, recipientIds, opts = {}) => {
    const restore = snapshot()
    const rows = recipientIds.map((rid) => ({ holiday_id: holidayId, recipient_id: rid }))
    setHolidayRecipients((prev) => [...prev.filter((hr) => hr.holiday_id !== holidayId), ...rows])
    return persist(
      'update who you give to',
      () => replaceRows('holiday_recipients', 'holiday_id', holidayId, rows),
      { restore, ...opts }
    )
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

  if (loading) return <FullPageLoader />
  if (loadError) return <LoadError onRetry={loadAll} />

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used inside DataProvider')
  return ctx
}

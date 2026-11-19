import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Pencil, Trash2, Plus, Sparkles, ArrowRight, Gift as GiftIcon } from 'lucide-react'
import { useData } from '../data/DataContext'
import { formatDate, formatShort, daysUntil, formatMoney, giftAutoName, occasionLabel } from '../data/helpers'
import Avatar from '../components/ui/Avatar'
import IconTile from '../components/ui/IconTile'
import Progress from '../components/ui/Progress'
import StatusStepper from '../components/ui/StatusStepper'
import { BackLink, SectionHeader, EmptyState, NotFound } from '../components/ui/PageHeader'
import { useConfirm } from '../components/ui/ConfirmDialog'
import { suggestForGift } from '../lib/claude'
import Tag from '../components/ui/Tag'
import Button from '../components/ui/Button'
import SlidePanel from '../components/ui/SlidePanel'
import SuggestionsPanel from '../components/ui/SuggestionsPanel'
import OccasionForm from '../components/occasions/OccasionForm'
import GiftForm from '../components/gifts/GiftForm'

const PHYSICAL_STATUSES = ['idea', 'purchased', 'wrapped', 'shipped', 'received']
const EXPERIENCE_STATUSES = ['planned', 'confirmed', 'executed']

function nextStatus(gift) {
  if (gift.type === 'physical') {
    const idx = PHYSICAL_STATUSES.indexOf(gift.physical_status)
    return idx >= 0 && idx < PHYSICAL_STATUSES.length - 1 ? PHYSICAL_STATUSES[idx + 1] : null
  }
  if (gift.type === 'experience') {
    const idx = EXPERIENCE_STATUSES.indexOf(gift.experience_status)
    return idx >= 0 && idx < EXPERIENCE_STATUSES.length - 1 ? EXPERIENCE_STATUSES[idx + 1] : null
  }
  return null
}

function statusLabel(gift) {
  if (gift.physical_status) return gift.physical_status
  if (gift.experience_status) return gift.experience_status
  return 'idea'
}

function isDone(gift) {
  return gift.physical_status === 'received' || gift.experience_status === 'executed'
}

export default function OccasionDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const {
    getOccasionById, getHolidayById, holidays,
    getGiftsForOccasion, getRecipientsForGift, getProductsForGift,
    getDefaultRecipientsForHoliday,
    recipients, products,
    getGiftsForRecipient,
    updateOccasion, deleteOccasion,
    addGift, updateGift, updateGiftRelations, deleteGift,
    addProduct,
  } = useData()

  const confirm = useConfirm()
  const occasion = getOccasionById(id)
  const [editOccasionOpen, setEditOccasionOpen] = useState(false)
  const [addGiftOpen, setAddGiftOpen] = useState(false)
  const [editingGiftId, setEditingGiftId] = useState(null)

  // Suggestions state
  const [suggestOpen, setSuggestOpen] = useState(false)
  const [suggestTitle, setSuggestTitle] = useState('')
  const [suggestLoading, setSuggestLoading] = useState(false)
  const [suggestError, setSuggestError] = useState(null)
  const [suggestions, setSuggestions] = useState([])
  const [suggestGiftId, setSuggestGiftId] = useState(null)

  if (!occasion) return <NotFound title="We couldn't find that occasion" backTo="/occasions" backLabel="Back to occasions" />

  const holiday = getHolidayById(occasion.holiday_id)
  const context = occasionLabel(occasion, holiday)
  const gifts = getGiftsForOccasion(id)
  const days = daysUntil(occasion.date)

  const defaultRecipients = occasion.holiday_id
    ? getDefaultRecipientsForHoliday(occasion.holiday_id)
    : []
  const canAutoCreate = defaultRecipients.length > 0

  // ── Occasion actions ────────────────────────────────────────────────

  const handleSaveOccasion = (formData) => {
    updateOccasion(id, formData, { success: 'Changes saved' })
    setEditOccasionOpen(false)
  }

  const handleDeleteOccasion = async () => {
    const n = gifts.length
    const ok = await confirm({
      title: `Delete ${occasion.name}?`,
      body:
        n > 0
          ? `This also deletes its ${n} gift${n === 1 ? '' : 's'} and their notes. This can't be undone.`
          : "This can't be undone.",
      confirmLabel: 'Delete occasion',
    })
    if (!ok) return
    deleteOccasion(id, { success: `${occasion.name} deleted` })
    navigate('/occasions')
  }

  // ── Gift actions ─────────────────────────────────────────────────────

  const handleAddGift = (giftData, recipientIds, productIds) => {
    addGift(giftData, recipientIds, productIds, { success: 'Gift added' })
    setAddGiftOpen(false)
  }

  const handleSaveGift = (giftData, recipientIds, productIds) => {
    updateGift(editingGiftId, giftData)
    updateGiftRelations(editingGiftId, recipientIds, productIds, { success: 'Gift updated' })
    setEditingGiftId(null)
  }

  const handleDeleteGift = async (giftId, giftName) => {
    const ok = await confirm({
      title: `Delete ${giftName}?`,
      body: "Its status and notes will be lost. Products stay in your gift library.",
      confirmLabel: 'Delete gift',
    })
    if (!ok) return
    deleteGift(giftId, { success: 'Gift deleted' })
  }

  const handleAdvanceStatus = (gift) => {
    const next = nextStatus(gift)
    if (!next) return
    const opts = { success: `Marked ${next}` }
    if (gift.type === 'physical') updateGift(gift.id, { physical_status: next }, opts)
    if (gift.type === 'experience') updateGift(gift.id, { experience_status: next }, opts)
  }

  const handleAutoCreate = () => {
    defaultRecipients.forEach((r, i) => {
      addGift(
        {
          occasion_id: id,
          name: giftAutoName([r], [], context),
          type: null,
          physical_status: 'idea',
          experience_status: null,
          notes: null,
          reception_notes: null,
        },
        [r.id],
        [],
        i === defaultRecipients.length - 1
          ? { success: `Added ${defaultRecipients.length} placeholder gift${defaultRecipients.length === 1 ? '' : 's'}` }
          : {}
      )
    })
  }

  // ── Suggestions ──────────────────────────────────────────────────────

  const fetchSuggestions = async (giftId) => {
    const gift = gifts.find((g) => g.id === giftId)
    const giftRecipientList = getRecipientsForGift(giftId)
    const recipient = giftRecipientList[0]
    if (!recipient) return

    const pastGifts = getGiftsForRecipient(recipient.id).filter(
      (g) => g.occasion_id !== id
    )

    setSuggestGiftId(giftId)
    setSuggestTitle(`Ideas for ${recipient.name}`)
    setSuggestOpen(true)
    setSuggestLoading(true)
    setSuggestError(null)
    setSuggestions([])

    try {
      const results = await suggestForGift({
        recipient,
        occasion,
        libraryProducts: products,
        pastGifts: gifts.filter(
          (g) => g.occasion_id !== id && getRecipientsForGift(g.id).some((r) => r.id === recipient.id)
        ),
      })
      setSuggestions(results)
    } catch (err) {
      setSuggestError(err.message)
    } finally {
      setSuggestLoading(false)
    }
  }

  const handleSuggestionAction = (suggestion) => {
    // Find or create the product in the library
    const existing = products.find(
      (p) => p.name.toLowerCase() === suggestion.name.toLowerCase()
    )
    let productId
    if (existing) {
      productId = existing.id
    } else {
      const newProduct = addProduct({
        name: suggestion.name,
        description: suggestion.description,
        price: null,
        link: null,
        photo_url: null,
      })
      productId = newProduct.id
    }
    // Add to the current gift
    const currentProductIds = getProductsForGift(suggestGiftId).map((p) => p.id)
    if (!currentProductIds.includes(productId)) {
      const giftRecipientList = getRecipientsForGift(suggestGiftId)
      const currentProducts = getProductsForGift(suggestGiftId)
      const gift = gifts.find((g) => g.id === suggestGiftId)
      updateGiftRelations(
        suggestGiftId,
        giftRecipientList.map((r) => r.id),
        [...currentProductIds, productId]
      )
      // A gift still on its automatic name picks up the new product
      if (gift && gift.name === giftAutoName(giftRecipientList, currentProducts, context)) {
        const product = existing ?? { name: suggestion.name }
        updateGift(suggestGiftId, { name: giftAutoName(giftRecipientList, [...currentProducts, product], context) })
      }
    }
  }

  // ── Editing gift context ─────────────────────────────────────────────

  const editingGift = editingGiftId ? gifts.find((g) => g.id === editingGiftId) : null
  const editingGiftRecipientIds = editingGift
    ? getRecipientsForGift(editingGiftId).map((r) => r.id)
    : []
  const editingGiftProductIds = editingGift
    ? getProductsForGift(editingGiftId).map((p) => p.id)
    : []

  // ── Summary numbers ──────────────────────────────────────────────────

  const readyCount = gifts.filter((g) => {
    const st = g.physical_status || g.experience_status
    return st && !['idea', 'planned'].includes(st)
  }).length
  const plannedSpend = gifts.reduce(
    (sum, g) => sum + getProductsForGift(g.id).reduce((s2, p) => s2 + (Number(p.price) || 0), 0),
    0
  )

  const stats = [
    {
      label: days >= 0 ? (days === 1 ? 'Day to go' : 'Days to go') : 'Days ago',
      value: Math.abs(days),
      tone: days >= 0 && days <= 14 ? 'text-amber' : 'text-ink',
    },
    { label: 'Gifts ready', value: `${readyCount}/${gifts.length}`, progress: true },
    occasion.start_shopping_date && {
      label: daysUntil(occasion.start_shopping_date) < 0 && days >= 0 ? 'Shopping started' : 'Start shopping',
      value: formatShort(occasion.start_shopping_date),
    },
    occasion.ship_date && { label: 'Ship by', value: formatShort(occasion.ship_date) },
    { label: 'Planned spend', value: formatMoney(plannedSpend) || '$0' },
  ].filter(Boolean)

  return (
    <div>
      <BackLink to="/occasions">Occasions</BackLink>

      {/* Header */}
      <header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between mb-8">
        <div className="flex items-start gap-4 min-w-0">
          <IconTile icon={holiday?.icon ?? '📅'} name={holiday?.name ?? occasion.name} size="lg" />
          <div className="min-w-0">
            <h1 className="text-[30px] md:text-[36px] leading-[1.05] font-semibold text-ink">{occasion.name}</h1>
            <p className="text-ink-soft mt-2">{formatDate(occasion.date)}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Button size="sm" variant="secondary" onClick={() => setEditOccasionOpen(true)}>
            <Pencil size={14} strokeWidth={1.75} />
            Edit
          </Button>
          <Button size="icon" variant="danger" onClick={handleDeleteOccasion} aria-label="Delete occasion">
            <Trash2 size={17} strokeWidth={1.75} />
          </Button>
        </div>
      </header>

      {/* Summary strip */}
      <div className={`grid grid-cols-2 gap-px bg-line rounded-xl overflow-hidden border border-line mb-8 ${stats.length >= 5 ? 'sm:grid-cols-5' : stats.length === 4 ? 'sm:grid-cols-4' : 'sm:grid-cols-3'}`}>
        {stats.map((st) => (
          <div key={st.label} className="bg-card px-4 py-4 [&:nth-child(odd):last-child]:col-span-2 sm:[&:nth-child(odd):last-child]:col-span-1">
            <p className="eyebrow">{st.label}</p>
            <p className={`font-display font-semibold text-[24px] leading-tight mt-1 ${/^[\d$/,.]+$/.test(String(st.value)) ? 'tracking-numeral' : 'tracking-[-0.03em]'} ${st.tone ?? 'text-ink'}`}>{st.value}</p>
            {st.progress && <Progress value={readyCount} total={gifts.length} className="mt-2.5" />}
          </div>
        ))}
      </div>

      {occasion.notes && (
        <div className="mb-10 rounded-xl bg-sand/70 px-5 py-4">
          <p className="eyebrow mb-1">Notes</p>
          <p className="text-ink">{occasion.notes}</p>
        </div>
      )}

      {/* Gifts */}
      <SectionHeader
        title="Gifts"
        count={gifts.length}
        className="mt-2"
        action={
          <div className="flex items-center gap-2">
            {canAutoCreate && gifts.length === 0 && (
              <Button size="sm" variant="secondary" onClick={handleAutoCreate}>
                <Sparkles size={14} strokeWidth={1.75} />
                Auto-create
              </Button>
            )}
            <Button size="sm" onClick={() => setAddGiftOpen(true)}>
              <Plus size={15} strokeWidth={2} />
              Add gift
            </Button>
          </div>
        }
      />

      {gifts.length > 0 ? (
        <div className="flex flex-col gap-3">
          {gifts.map((gift) => {
            const giftRecipients = getRecipientsForGift(gift.id)
            const giftProducts = getProductsForGift(gift.id)
            const next = nextStatus(gift)
            const done = isDone(gift)
            const total = giftProducts.reduce((sum, p) => sum + (Number(p.price) || 0), 0)
            const steps = gift.type === 'experience' ? EXPERIENCE_STATUSES : gift.type === 'physical' ? PHYSICAL_STATUSES : null
            const lead = giftRecipients[0]

            return (
              <article key={gift.id} className={`card p-5 ${done ? 'bg-sage-tint/40 border-sage/20' : ''}`}>
                <div className="flex items-start gap-3.5">
                  {lead ? (
                    <Avatar emoji={lead.emoji} name={lead.name} size="md" />
                  ) : (
                    <span className="w-12 h-12 rounded-full bg-sand text-ink-faint inline-flex items-center justify-center shrink-0">
                      <GiftIcon size={20} strokeWidth={1.75} />
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-display font-semibold text-[17px] text-ink leading-snug">{gift.name}</p>
                      {gift.type && (
                        <Tag variant="outline" className="capitalize hidden sm:inline-flex">{gift.type}</Tag>
                      )}
                    </div>
                    {giftRecipients.length > 0 && (
                      <p className="text-[14px] text-ink-soft mt-0.5">
                        For {giftRecipients.map((r) => r.name).join(', ')}
                      </p>
                    )}
                    {giftProducts.length > 0 && (
                      <p className="text-[14px] text-ink mt-2">
                        {giftProducts.map((p) => p.name).join(' + ')}
                        {total > 0 && <span className="text-ink-soft tabular"> · {formatMoney(total)}</span>}
                      </p>
                    )}
                    {gift.notes && <p className="text-[14px] text-ink-soft mt-1.5">{gift.notes}</p>}
                  </div>
                </div>

                <div className="mt-5">
                  {steps ? (
                    <StatusStepper steps={steps} current={statusLabel(gift)} />
                  ) : (
                    <p className="text-[13px] text-ink-faint">Still an idea. Choose physical or experience to track progress.</p>
                  )}
                </div>

                {gift.reception_notes && (
                  <p className="mt-4 rounded-md bg-sage-tint px-3.5 py-2.5 text-[14px] text-sage">
                    “{gift.reception_notes}”
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-1 mt-4 pt-4 border-t border-line">
                  {next && (
                    <Button size="sm" variant="secondary" type="button" onClick={() => handleAdvanceStatus(gift)} className="mr-auto">
                      Mark {next}
                      <ArrowRight size={14} strokeWidth={1.75} />
                    </Button>
                  )}
                  <div className="flex items-center gap-0.5 ml-auto">
                    {giftRecipients.length > 0 && (
                      <Button size="sm" variant="ghost" type="button" onClick={() => fetchSuggestions(gift.id)}>
                        <Sparkles size={14} strokeWidth={1.75} className="text-amber" />
                        Ideas
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" type="button" onClick={() => setEditingGiftId(gift.id)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="danger" type="button" onClick={() => handleDeleteGift(gift.id, gift.name)}>
                      Delete
                    </Button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <EmptyState
          icon={GiftIcon}
          title="No gifts planned yet"
          action={
            canAutoCreate && (
              <Button variant="secondary" onClick={handleAutoCreate}>
                <Sparkles size={15} strokeWidth={1.75} />
                Add one for each default person
              </Button>
            )
          }
        >
          {canAutoCreate
            ? `Start a placeholder for ${defaultRecipients.map((r) => r.name).join(', ')}, then fill in ideas as they come.`
            : 'Add a gift to start planning.'}
        </EmptyState>
      )}

      {/* Edit occasion panel */}
      <SlidePanel isOpen={editOccasionOpen} onClose={() => setEditOccasionOpen(false)} title="Edit occasion">
        <OccasionForm
          occasion={occasion}
          holidays={holidays}
          onSave={handleSaveOccasion}
          onCancel={() => setEditOccasionOpen(false)}
        />
      </SlidePanel>

      {/* Add gift panel */}
      <SlidePanel isOpen={addGiftOpen} onClose={() => setAddGiftOpen(false)} title="New gift">
        <GiftForm
          occasionContext={context}
          occasionId={id}
          recipients={recipients}
          products={products}
          onSave={handleAddGift}
          onCancel={() => setAddGiftOpen(false)}
        />
      </SlidePanel>

      {/* Edit gift panel */}
      <SlidePanel
        isOpen={!!editingGiftId}
        onClose={() => setEditingGiftId(null)}
        title="Edit gift"
      >
        {editingGift && (
          <GiftForm
          occasionContext={context}
            key={editingGiftId}
            gift={editingGift}
            occasionId={id}
            recipients={recipients}
            products={products}
            initialRecipientIds={editingGiftRecipientIds}
            initialProductIds={editingGiftProductIds}
            onSave={handleSaveGift}
            onCancel={() => setEditingGiftId(null)}
          />
        )}
      </SlidePanel>

      {/* Suggestions panel */}
      <SuggestionsPanel
        isOpen={suggestOpen}
        onClose={() => setSuggestOpen(false)}
        title={suggestTitle}
        loading={suggestLoading}
        error={suggestError}
        onRetry={() => suggestGiftId && fetchSuggestions(suggestGiftId)}
        suggestions={suggestions}
        primaryAction={{
          label: (s) => s.in_library ? 'Add to gift' : 'Save to library & add to gift',
          doneLabel: 'Added to gift',
          handler: handleSuggestionAction,
        }}
      />
    </div>
  )
}

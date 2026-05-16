import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2, Plus, Sparkles } from 'lucide-react'
import { useData } from '../data/DataContext'
import { formatDate, daysUntil } from '../data/helpers'
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

  if (!occasion) return <p className="text-muted">Occasion not found.</p>

  const holiday = getHolidayById(occasion.holiday_id)
  const gifts = getGiftsForOccasion(id)
  const days = daysUntil(occasion.date)

  const defaultRecipients = occasion.holiday_id
    ? getDefaultRecipientsForHoliday(occasion.holiday_id)
    : []
  const canAutoCreate = defaultRecipients.length > 0

  // ── Occasion actions ────────────────────────────────────────────────

  const handleSaveOccasion = (formData) => {
    updateOccasion(id, formData)
    setEditOccasionOpen(false)
  }

  const handleDeleteOccasion = () => {
    if (!window.confirm(`Remove "${occasion.name}"? Its gifts will also be deleted.`)) return
    deleteOccasion(id)
    navigate('/occasions')
  }

  // ── Gift actions ─────────────────────────────────────────────────────

  const handleAddGift = (giftData, recipientIds, productIds) => {
    addGift(giftData, recipientIds, productIds)
    setAddGiftOpen(false)
  }

  const handleSaveGift = (giftData, recipientIds, productIds) => {
    updateGift(editingGiftId, giftData)
    updateGiftRelations(editingGiftId, recipientIds, productIds)
    setEditingGiftId(null)
  }

  const handleDeleteGift = (giftId, giftName) => {
    if (!window.confirm(`Remove "${giftName}"?`)) return
    deleteGift(giftId)
  }

  const handleAdvanceStatus = (gift) => {
    const next = nextStatus(gift)
    if (!next) return
    if (gift.type === 'physical') updateGift(gift.id, { physical_status: next })
    if (gift.type === 'experience') updateGift(gift.id, { experience_status: next })
  }

  const handleAutoCreate = () => {
    defaultRecipients.forEach((r) => {
      addGift(
        {
          occasion_id: id,
          name: `${r.name} — ${occasion.name}`,
          type: null,
          physical_status: 'idea',
          experience_status: null,
          notes: null,
          reception_notes: null,
        },
        [r.id],
        []
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
      updateGiftRelations(
        suggestGiftId,
        getRecipientsForGift(suggestGiftId).map((r) => r.id),
        [...currentProductIds, productId]
      )
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

  return (
    <div>
      <Link to="/occasions" className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground mb-6">
        <ArrowLeft size={14} /> Occasions
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <span className="text-3xl mt-0.5">{holiday?.icon ?? '📅'}</span>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{occasion.name}</h1>
            <p className="text-muted mt-1 text-sm">
              {formatDate(occasion.date)} ·{' '}
              {days >= 0 ? `${days} day${days !== 1 ? 's' : ''} away` : `${Math.abs(days)} days ago`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="secondary" onClick={() => setEditOccasionOpen(true)}>
            <Pencil size={14} />
            Edit
          </Button>
          <Button variant="ghost" onClick={handleDeleteOccasion}>
            <Trash2 size={14} />
            Delete
          </Button>
        </div>
      </div>

      {/* Planning dates */}
      {(occasion.start_shopping_date || occasion.ship_date) && (
        <div className="flex gap-6 mb-5 p-4 bg-surface border border-border rounded-md">
          {occasion.start_shopping_date && (
            <div>
              <p className="text-xs text-muted uppercase tracking-wider">Start Shopping</p>
              <p className="text-sm font-medium text-foreground mt-0.5">{formatDate(occasion.start_shopping_date)}</p>
            </div>
          )}
          {occasion.ship_date && (
            <div>
              <p className="text-xs text-muted uppercase tracking-wider">Ship By</p>
              <p className="text-sm font-medium text-foreground mt-0.5">{formatDate(occasion.ship_date)}</p>
            </div>
          )}
        </div>
      )}

      {occasion.notes && (
        <p className="text-sm text-muted mb-5 italic">{occasion.notes}</p>
      )}

      {/* Gifts section header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-muted uppercase tracking-widest">
          Gifts ({gifts.length})
        </h2>
        <div className="flex items-center gap-2">
          {canAutoCreate && gifts.length === 0 && (
            <Button variant="secondary" onClick={handleAutoCreate}>
              <Sparkles size={14} />
              Auto-create
            </Button>
          )}
          <Button variant="primary" onClick={() => setAddGiftOpen(true)}>
            <Plus size={14} />
            Add gift
          </Button>
        </div>
      </div>

      {/* Gift cards */}
      {gifts.length > 0 ? (
        <div className="flex flex-col gap-2">
          {gifts.map((gift) => {
            const giftRecipients = getRecipientsForGift(gift.id)
            const giftProducts = getProductsForGift(gift.id)
            const next = nextStatus(gift)
            const done = isDone(gift)
            const total = giftProducts.reduce((sum, p) => sum + (p.price || 0), 0)

            return (
              <div
                key={gift.id}
                className={`p-4 bg-surface border rounded-md ${done ? 'border-success/30' : 'border-border'}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-bold text-foreground leading-snug">{gift.name}</p>
                  <Tag variant={done ? 'success' : 'default'}>{statusLabel(gift)}</Tag>
                </div>

                {giftRecipients.length > 0 && (
                  <p className="text-sm text-muted mt-1">
                    For {giftRecipients.map((r) => `${r.emoji} ${r.name}`).join(', ')}
                  </p>
                )}

                {giftProducts.length > 0 && (
                  <p className="text-sm text-muted mt-0.5">
                    {giftProducts.map((p) => p.name).join(' + ')}
                    {total > 0 && ` · $${total}`}
                  </p>
                )}

                {gift.notes && (
                  <p className="text-sm text-muted mt-1 italic">{gift.notes}</p>
                )}

                {gift.reception_notes && (
                  <p className="text-xs text-success mt-2">✓ {gift.reception_notes}</p>
                )}

                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/60">
                  {next && (
                    <button
                      type="button"
                      onClick={() => handleAdvanceStatus(gift)}
                      className="text-sm text-accent hover:text-accent-hover font-medium transition-colors"
                    >
                      → Mark as {next}
                    </button>
                  )}
                  <div className="flex items-center gap-2 ml-auto">
                    {getRecipientsForGift(gift.id).length > 0 && (
                      <button
                        type="button"
                        onClick={() => fetchSuggestions(gift.id)}
                        className="text-sm text-muted hover:text-foreground transition-colors inline-flex items-center gap-1"
                      >
                        <Sparkles size={12} />
                        Ideas
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setEditingGiftId(gift.id)}
                      className="text-sm text-muted hover:text-foreground transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteGift(gift.id, gift.name)}
                      className="text-sm text-muted hover:text-error transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="p-6 bg-surface border border-border rounded-md text-center">
          <p className="text-sm text-muted mb-3">No gifts yet for this occasion.</p>
          {canAutoCreate && (
            <Button variant="secondary" onClick={handleAutoCreate}>
              <Sparkles size={14} />
              Auto-create from default recipients
            </Button>
          )}
        </div>
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

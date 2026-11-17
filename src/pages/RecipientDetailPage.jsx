import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Pencil, Trash2, Sparkles, Gift as GiftIcon, ChevronRight } from 'lucide-react'
import { useData } from '../data/DataContext'
import { formatShort, daysUntil, relativeDays } from '../data/helpers'
import Avatar from '../components/ui/Avatar'
import { BackLink, SectionHeader, EmptyState, NotFound } from '../components/ui/PageHeader'
import { useConfirm } from '../components/ui/ConfirmDialog'
import { suggestForRecipient } from '../lib/claude'
import Tag from '../components/ui/Tag'
import Button from '../components/ui/Button'
import SlidePanel from '../components/ui/SlidePanel'
import SuggestionsPanel from '../components/ui/SuggestionsPanel'
import RecipientForm from '../components/recipients/RecipientForm'

export default function RecipientDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getRecipientById, getGiftsForRecipient, getProductsForGift, getOccasionById, updateRecipient, deleteRecipient, products, addProduct } = useData()

  const confirm = useConfirm()
  const recipient = getRecipientById(id)
  const [editOpen, setEditOpen] = useState(false)

  // Suggestions state
  const [suggestOpen, setSuggestOpen] = useState(false)
  const [suggestLoading, setSuggestLoading] = useState(false)
  const [suggestError, setSuggestError] = useState(null)
  const [suggestions, setSuggestions] = useState([])

  if (!recipient) return <NotFound title="We couldn't find that person" backTo="/recipients" backLabel="Back to people" />

  const gifts = getGiftsForRecipient(id)
  const past = gifts.filter((g) => g.physical_status === 'received' || g.experience_status === 'executed')
  const upcoming = gifts.filter((g) => g.physical_status !== 'received' && g.experience_status !== 'executed')

  const handleSave = (formData) => {
    updateRecipient(id, formData, { success: 'Changes saved' })
    setEditOpen(false)
  }

  const fetchSuggestions = async () => {
    setSuggestOpen(true)
    setSuggestLoading(true)
    setSuggestError(null)
    setSuggestions([])
    try {
      const results = await suggestForRecipient({
        recipient,
        libraryProducts: products,
        pastGifts: getGiftsForRecipient(id),
      })
      setSuggestions(results)
    } catch (err) {
      setSuggestError(err.message)
    } finally {
      setSuggestLoading(false)
    }
  }

  const handleSuggestionSave = (suggestion) => {
    const existing = products.find(
      (p) => p.name.toLowerCase() === suggestion.name.toLowerCase()
    )
    if (!existing) {
      addProduct({
        name: suggestion.name,
        description: suggestion.description,
        price: null,
        link: null,
        photo_url: null,
      })
    }
  }

  const handleDelete = async () => {
    const n = gifts.length
    const ok = await confirm({
      title: `Delete ${recipient.name}?`,
      body:
        (n > 0
          ? `They'll be removed from ${n} gift${n === 1 ? '' : 's'} and any dates they're a default for. The gifts themselves stay. `
          : '') + "This can't be undone.",
      confirmLabel: 'Delete person',
    })
    if (!ok) return
    deleteRecipient(id, { success: `${recipient.name} deleted` })
    navigate('/recipients')
  }

  const statusOf = (g) => g.physical_status || g.experience_status || 'idea'
  const byDate = (dir) => (a, b) => {
    const oa = getOccasionById(a.occasion_id)
    const ob = getOccasionById(b.occasion_id)
    return dir * ((oa ? daysUntil(oa.date) : 0) - (ob ? daysUntil(ob.date) : 0))
  }

  return (
    <div>
      <BackLink to="/recipients">People</BackLink>

      <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-5 min-w-0">
          <Avatar emoji={recipient.emoji} name={recipient.name} size="xl" />
          <div className="min-w-0">
            <h1 className="text-[32px] md:text-[40px] leading-[1.05] font-semibold text-ink">{recipient.name}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-2.5">
              {recipient.group_tag && <Tag>{recipient.group_tag}</Tag>}
              {recipient.budget && <Tag variant="outline">Budget {recipient.budget}</Tag>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Button onClick={fetchSuggestions}>
            <Sparkles size={16} strokeWidth={1.75} className="text-marigold" />
            Gift ideas
          </Button>
          <Button size="icon" variant="secondary" onClick={() => setEditOpen(true)} aria-label="Edit person">
            <Pencil size={16} strokeWidth={1.75} />
          </Button>
          <Button size="icon" variant="danger" onClick={handleDelete} aria-label="Delete person">
            <Trash2 size={17} strokeWidth={1.75} />
          </Button>
        </div>
      </header>

      {recipient.gift_prompt && (
        <div className="mb-12 rounded-xl bg-card border border-line px-6 py-5 relative overflow-hidden">
          <span className="absolute left-0 inset-y-0 w-1 bg-amber" />
          <p className="eyebrow mb-1.5">What they love</p>
          <p className="text-[17px] leading-relaxed text-ink">{recipient.gift_prompt}</p>
        </div>
      )}

      {upcoming.length > 0 && (
        <section className="mb-12">
          <SectionHeader title="In the works" count={upcoming.length} />
          <div className="card divide-y divide-line overflow-hidden">
            {[...upcoming].sort(byDate(1)).map((gift) => {
              const occasion = getOccasionById(gift.occasion_id)
              const products = getProductsForGift(gift.id)
              const days = occasion ? daysUntil(occasion.date) : null
              return (
                <Link
                  key={gift.id}
                  to={occasion ? `/occasions/${occasion.id}` : '#'}
                  className="group flex items-center gap-4 px-5 py-4 hover:bg-sand/40 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-display font-semibold text-[16px] text-ink truncate">{gift.name}</p>
                    <p className="text-[13px] text-ink-soft mt-1">
                      {occasion && (
                        <>
                          {occasion.name.replace(/ \d{4}$/, '')}, {formatShort(occasion.date)}
                          {days != null && days >= 0 && (
                            <span className={days <= 14 ? 'text-amber font-medium' : 'text-ink-faint'}> · {relativeDays(days).toLowerCase()}</span>
                          )}
                        </>
                      )}
                      {products.length > 0 && <span className="text-ink-faint"> · {products.map((p) => p.name).join(' + ')}</span>}
                    </p>
                  </div>
                  <Tag className="capitalize">{statusOf(gift)}</Tag>
                  <ChevronRight size={18} strokeWidth={1.75} className="text-ink-faint group-hover:text-ink shrink-0" />
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section>
          <SectionHeader title="Gift history" count={past.length} />
          <ol className="relative ml-2 border-l border-line-strong">
            {[...past].sort(byDate(-1)).map((gift) => {
              const occasion = getOccasionById(gift.occasion_id)
              const products = getProductsForGift(gift.id)
              return (
                <li key={gift.id} className="relative pl-7 pb-8 last:pb-0">
                  <span className="absolute -left-[7px] top-1.5 w-3.5 h-3.5 rounded-full bg-paper border-2 border-sage" />
                  {occasion && <p className="text-[13px] font-medium text-ink-faint">{occasion.name}</p>}
                  <p className="font-display font-semibold text-[16px] text-ink mt-0.5">
                    {products.length > 0 ? products.map((p) => p.name).join(' + ') : gift.name}
                  </p>
                  {gift.reception_notes && (
                    <p className="mt-2 inline-block rounded-md bg-sage-tint px-3.5 py-2 text-[14px] text-sage">
                      “{gift.reception_notes}”
                    </p>
                  )}
                </li>
              )
            })}
          </ol>
        </section>
      )}

      {upcoming.length === 0 && past.length === 0 && (
        <EmptyState icon={GiftIcon} title={`Nothing for ${recipient.name} yet`}>
          Add {recipient.name} to an occasion, or ask for gift ideas to get started.
        </EmptyState>
      )}

      <SlidePanel isOpen={editOpen} onClose={() => setEditOpen(false)} title={`Edit ${recipient.name}`}>
        <RecipientForm recipient={recipient} onSave={handleSave} onCancel={() => setEditOpen(false)} />
      </SlidePanel>

      <SuggestionsPanel
        isOpen={suggestOpen}
        onClose={() => setSuggestOpen(false)}
        title={`Gift ideas for ${recipient.name}`}
        loading={suggestLoading}
        error={suggestError}
        onRetry={fetchSuggestions}
        suggestions={suggestions}
        primaryAction={{
          label: (s) => s.in_library ? 'Already in library' : 'Save to library',
          doneLabel: 'Saved to library',
          handler: handleSuggestionSave,
        }}
      />
    </div>
  )
}

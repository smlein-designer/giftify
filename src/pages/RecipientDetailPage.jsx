import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import { useData } from '../data/DataContext'
import Tag from '../components/ui/Tag'
import Button from '../components/ui/Button'
import SlidePanel from '../components/ui/SlidePanel'
import RecipientForm from '../components/recipients/RecipientForm'

export default function RecipientDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getRecipientById, getGiftsForRecipient, getProductsForGift, getOccasionById, updateRecipient, deleteRecipient } = useData()

  const recipient = getRecipientById(id)
  const [editOpen, setEditOpen] = useState(false)

  if (!recipient) return <p className="text-muted">Recipient not found.</p>

  const gifts = getGiftsForRecipient(id)
  const past = gifts.filter((g) => g.physical_status === 'received' || g.experience_status === 'executed')
  const upcoming = gifts.filter((g) => g.physical_status !== 'received' && g.experience_status !== 'executed')

  const handleSave = (formData) => {
    updateRecipient(id, formData)
    setEditOpen(false)
  }

  const handleDelete = () => {
    if (!window.confirm(`Remove ${recipient.name}? This can't be undone.`)) return
    deleteRecipient(id)
    navigate('/recipients')
  }

  return (
    <div>
      <Link to="/recipients" className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground mb-6">
        <ArrowLeft size={14} /> Recipients
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{recipient.emoji}</span>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{recipient.name}</h1>
            <p className="text-sm text-muted">{recipient.group_tag}{recipient.budget ? ` · Budget ${recipient.budget}` : ''}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => setEditOpen(true)}>
            <Pencil size={14} />
            Edit
          </Button>
          <Button variant="ghost" onClick={handleDelete}>
            <Trash2 size={14} />
            Delete
          </Button>
        </div>
      </div>

      {recipient.gift_prompt && (
        <div className="mb-6 p-4 bg-surface border border-border rounded-md">
          <p className="text-xs text-muted uppercase tracking-wider mb-1">Gift-giving notes</p>
          <p className="text-sm text-foreground">{recipient.gift_prompt}</p>
        </div>
      )}

      {upcoming.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-medium text-muted uppercase tracking-widest mb-3">Upcoming</h2>
          <div className="flex flex-col gap-2">
            {upcoming.map((gift) => {
              const occasion = getOccasionById(gift.occasion_id)
              const products = getProductsForGift(gift.id)
              return (
                <div key={gift.id} className="p-4 bg-surface border border-border rounded-md">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-foreground">{gift.name}</p>
                    <Tag>{gift.physical_status || gift.experience_status || 'idea'}</Tag>
                  </div>
                  {occasion && <p className="text-sm text-muted mt-0.5">{occasion.name}</p>}
                  {products.length > 0 && (
                    <p className="text-sm text-muted mt-0.5">{products.map((p) => p.name).join(' + ')}</p>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-muted uppercase tracking-widest mb-3">Gift history</h2>
          <div className="flex flex-col gap-2">
            {past.map((gift) => {
              const occasion = getOccasionById(gift.occasion_id)
              const products = getProductsForGift(gift.id)
              return (
                <div key={gift.id} className="p-4 bg-surface border border-border rounded-md">
                  <p className="font-bold text-foreground">{gift.name}</p>
                  {occasion && <p className="text-sm text-muted mt-0.5">{occasion.name}</p>}
                  {products.length > 0 && (
                    <p className="text-sm text-muted mt-0.5">{products.map((p) => p.name).join(' + ')}</p>
                  )}
                  {gift.reception_notes && (
                    <p className="text-xs text-success mt-2">✓ {gift.reception_notes}</p>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}

      {upcoming.length === 0 && past.length === 0 && (
        <p className="text-sm text-muted">No gifts yet for {recipient.name}.</p>
      )}

      <SlidePanel isOpen={editOpen} onClose={() => setEditOpen(false)} title={`Edit ${recipient.name}`}>
        <RecipientForm recipient={recipient} onSave={handleSave} onCancel={() => setEditOpen(false)} />
      </SlidePanel>
    </div>
  )
}

import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import {
  getOccasionById,
  getHolidayById,
  getGiftsForOccasion,
  getRecipientsForGift,
  getProductsForGift,
  formatDate,
  daysUntil,
} from '../data/helpers'
import Tag from '../components/ui/Tag'

function statusLabel(gift) {
  if (gift.physical_status) return gift.physical_status
  if (gift.experience_status) return gift.experience_status
  return 'idea'
}

export default function OccasionDetailPage() {
  const { id } = useParams()
  const occasion = getOccasionById(id)
  if (!occasion) return <p className="text-muted">Occasion not found.</p>

  const holiday = getHolidayById(occasion.holiday_id)
  const gifts = getGiftsForOccasion(occasion.id)
  const days = daysUntil(occasion.date)

  return (
    <div>
      <Link to="/occasions" className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground mb-6">
        <ArrowLeft size={14} /> Occasions
      </Link>

      <div className="flex items-start gap-3 mb-6">
        <span className="text-3xl">{holiday?.icon ?? '📅'}</span>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{occasion.name}</h1>
          <p className="text-muted mt-1">
            {formatDate(occasion.date)} ·{' '}
            {days >= 0 ? `${days} days away` : `${Math.abs(days)} days ago`}
          </p>
        </div>
      </div>

      {(occasion.start_shopping_date || occasion.ship_date) && (
        <div className="flex gap-4 mb-6 p-4 bg-surface border border-border rounded-md">
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

      <h2 className="text-sm font-medium text-muted uppercase tracking-widest mb-3">
        Gifts ({gifts.length})
      </h2>

      <div className="flex flex-col gap-2">
        {gifts.map((gift) => {
          const giftRecipients = getRecipientsForGift(gift.id)
          const giftProducts = getProductsForGift(gift.id)
          return (
            <div key={gift.id} className="p-4 bg-surface border border-border rounded-md">
              <div className="flex items-start justify-between">
                <p className="font-bold text-foreground">{gift.name}</p>
                <Tag variant={gift.physical_status === 'received' || gift.experience_status === 'executed' ? 'success' : 'default'}>
                  {statusLabel(gift)}
                </Tag>
              </div>
              {giftRecipients.length > 0 && (
                <p className="text-sm text-muted mt-1">
                  For {giftRecipients.map((r) => `${r.emoji} ${r.name}`).join(', ')}
                </p>
              )}
              {giftProducts.length > 0 && (
                <p className="text-sm text-muted mt-0.5">
                  {giftProducts.map((p) => p.name).join(' + ')} · ${giftProducts.reduce((sum, p) => sum + (p.price || 0), 0)}
                </p>
              )}
              {gift.notes && <p className="text-sm text-muted mt-1 italic">{gift.notes}</p>}
              {gift.reception_notes && (
                <p className="text-xs text-success mt-2">✓ {gift.reception_notes}</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

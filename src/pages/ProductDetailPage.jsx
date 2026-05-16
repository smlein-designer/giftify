import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ExternalLink, Package } from 'lucide-react'
import { getProductById, getTimesGiven, giftProducts, getGiftById, getRecipientsForGift } from '../data/helpers'
import Tag from '../components/ui/Tag'

export default function ProductDetailPage() {
  const { id } = useParams()
  const product = getProductById(id)
  if (!product) return <p className="text-muted">Product not found.</p>

  const timesGiven = getTimesGiven(id)
  const givenIn = giftProducts
    .filter((gp) => gp.product_id === id)
    .map((gp) => getGiftById(gp.gift_id))
    .filter(Boolean)

  return (
    <div>
      <Link to="/products" className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground mb-6">
        <ArrowLeft size={14} /> Gift Library
      </Link>

      <div className="bg-surface border border-border rounded-md overflow-hidden mb-6">
        <div className="bg-border/40 h-48 flex items-center justify-center">
          <Package size={40} className="text-border" />
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl font-bold text-foreground">{product.name}</h1>
            {product.price && (
              <span className="text-lg font-bold text-foreground shrink-0">${product.price}</span>
            )}
          </div>
          {product.description && (
            <p className="text-sm text-muted mt-2">{product.description}</p>
          )}
          <div className="flex items-center gap-2 mt-4">
            {timesGiven > 0 && <Tag variant="success">Given {timesGiven}×</Tag>}
            {product.link && (
              <a
                href={product.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-accent hover:text-accent-hover"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink size={13} /> Buy
              </a>
            )}
          </div>
        </div>
      </div>

      {givenIn.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-muted uppercase tracking-widest mb-3">Given as</h2>
          <div className="flex flex-col gap-2">
            {givenIn.map((gift) => {
              const recipients = getRecipientsForGift(gift.id)
              return (
                <div key={gift.id} className="p-4 bg-surface border border-border rounded-md">
                  <p className="font-bold text-foreground">{gift.name}</p>
                  {recipients.length > 0 && (
                    <p className="text-sm text-muted mt-0.5">
                      {recipients.map((r) => `${r.emoji} ${r.name}`).join(', ')}
                    </p>
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
    </div>
  )
}

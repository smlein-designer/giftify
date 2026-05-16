import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ExternalLink, Package, Pencil, Trash2 } from 'lucide-react'
import { useData } from '../data/DataContext'
import Tag from '../components/ui/Tag'
import Button from '../components/ui/Button'
import SlidePanel from '../components/ui/SlidePanel'
import ProductForm from '../components/products/ProductForm'

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getProductById, getTimesGiven, giftProducts, getGiftById, getRecipientsForGift, updateProduct, deleteProduct } = useData()

  const product = getProductById(id)
  const [editOpen, setEditOpen] = useState(false)

  if (!product) return <p className="text-muted">Product not found.</p>

  const timesGiven = getTimesGiven(id)
  const givenIn = giftProducts
    .filter((gp) => gp.product_id === id)
    .map((gp) => getGiftById(gp.gift_id))
    .filter(Boolean)

  const handleSave = (formData) => {
    updateProduct(id, formData)
    setEditOpen(false)
  }

  const handleDelete = () => {
    if (!window.confirm(`Remove "${product.name}" from your library? This can't be undone.`)) return
    deleteProduct(id)
    navigate('/products')
  }

  return (
    <div>
      <Link to="/products" className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground mb-6">
        <ArrowLeft size={14} /> Gift Library
      </Link>

      <div className="bg-surface border border-border rounded-md overflow-hidden mb-6">
        <div className="bg-border/40 h-48 flex items-center justify-center overflow-hidden">
          {product.photo_url ? (
            <img src={product.photo_url} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <Package size={40} className="text-border" />
          )}
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl font-bold text-foreground">{product.name}</h1>
            <div className="flex items-center gap-2 shrink-0">
              {product.price != null && (
                <span className="text-lg font-bold text-foreground">${product.price}</span>
              )}
            </div>
          </div>
          {product.description && (
            <p className="text-sm text-muted mt-2">{product.description}</p>
          )}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
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

      <SlidePanel isOpen={editOpen} onClose={() => setEditOpen(false)} title={`Edit product`}>
        <ProductForm product={product} onSave={handleSave} onCancel={() => setEditOpen(false)} />
      </SlidePanel>
    </div>
  )
}

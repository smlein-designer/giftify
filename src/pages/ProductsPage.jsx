import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Gift, Plus } from 'lucide-react'
import { useData } from '../data/DataContext'
import { tintFor } from '../lib/tint'
import { formatMoney } from '../data/helpers'
import Tag from '../components/ui/Tag'
import Button from '../components/ui/Button'
import PageHeader, { EmptyState } from '../components/ui/PageHeader'
import SlidePanel from '../components/ui/SlidePanel'
import ProductForm from '../components/products/ProductForm'

// Photos are links to store images, which can move. If one stops loading,
// show the lettered placeholder instead of a broken image and tell the parent.
export function ProductImage({ product, className = '', large, onBroken }) {
  const t = tintFor(product.name)
  const [brokenUrl, setBrokenUrl] = useState(null)
  const broken = !!product.photo_url && brokenUrl === product.photo_url
  if (product.photo_url && !broken) {
    return (
      <img
        src={product.photo_url}
        alt={product.name}
        className={`w-full h-full object-cover ${className}`}
        onError={() => {
          setBrokenUrl(product.photo_url)
          onBroken?.()
        }}
      />
    )
  }
  return (
    <div className={`w-full h-full flex items-center justify-center ${t.bg} ${className}`}>
      <span className={`font-display font-bold ${t.fg} opacity-80 ${large ? 'text-[96px]' : 'text-[56px]'} leading-none`}>
        {product.name.charAt(0)}
      </span>
    </div>
  )
}

function ProductCard({ product, timesGiven }) {
  return (
    <Link to={`/products/${product.id}`} className="group flex flex-col">
      <div className="relative aspect-square rounded-xl overflow-hidden bg-sand">
        <ProductImage product={product} className="transition-transform duration-500 group-hover:scale-[1.03]" />
        {product.price != null && (
          <span className="absolute left-3 top-3 h-7 px-2.5 rounded-full bg-card/95 text-ink text-[13px] font-semibold tabular inline-flex items-center shadow-paper">
            {formatMoney(product.price)}
          </span>
        )}
        {product.link && (
          <span className="absolute right-3 top-3 w-7 h-7 rounded-full bg-card/95 text-ink inline-flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowUpRight size={15} strokeWidth={1.75} />
          </span>
        )}
      </div>
      <div className="pt-3 px-0.5">
        <p className="font-display font-semibold text-[15px] text-ink leading-snug">{product.name}</p>
        {product.description && <p className="text-[13px] text-ink-soft mt-1 line-clamp-2">{product.description}</p>}
        {timesGiven > 0 && <Tag variant="success" className="mt-2">Given {timesGiven}×</Tag>}
      </div>
    </Link>
  )
}

export default function ProductsPage() {
  const { products, getTimesGiven, addProduct } = useData()
  const [panelOpen, setPanelOpen] = useState(false)

  const handleSave = (formData) => {
    addProduct(formData, { success: 'Saved to your gift library' })
    setPanelOpen(false)
  }

  return (
    <div>
      <PageHeader
        eyebrow="Gift library"
        title="Ideas worth keeping"
        description="Save things you spot all year, then pull from here when an occasion comes around."
        actions={
          <Button onClick={() => setPanelOpen(true)}>
            <Plus size={17} strokeWidth={2} />
            Save an idea
          </Button>
        }
      />

      {products.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} timesGiven={getTimesGiven(p.id)} />
          ))}
        </div>
      ) : (
        <EmptyState icon={Gift} title="Your library is empty">
          Paste a link to anything you'd like to give someday. It'll be here when you need it.
        </EmptyState>
      )}

      <SlidePanel isOpen={panelOpen} onClose={() => setPanelOpen(false)} title="Save a gift idea">
        <ProductForm onSave={handleSave} onCancel={() => setPanelOpen(false)} />
      </SlidePanel>
    </div>
  )
}

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink, Package, Plus } from 'lucide-react'
import { useData } from '../data/DataContext'
import Tag from '../components/ui/Tag'
import Button from '../components/ui/Button'
import SlidePanel from '../components/ui/SlidePanel'
import ProductForm from '../components/products/ProductForm'

function ProductCard({ product, timesGiven }) {
  return (
    <Link
      to={`/products/${product.id}`}
      className="flex flex-col bg-surface border border-border rounded-md overflow-hidden hover:border-accent/40 transition-colors group"
    >
      <div className="bg-border/40 h-36 flex items-center justify-center overflow-hidden">
        {product.photo_url ? (
          <img src={product.photo_url} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <Package size={28} className="text-border" />
        )}
      </div>
      <div className="p-4">
        <p className="font-bold text-foreground text-[15px] leading-snug">{product.name}</p>
        {product.description && (
          <p className="text-sm text-muted mt-1 line-clamp-2">{product.description}</p>
        )}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            {product.price != null && (
              <span className="text-sm font-medium text-foreground">${product.price}</span>
            )}
            {timesGiven > 0 && <Tag variant="success">Given {timesGiven}×</Tag>}
          </div>
          {product.link && (
            <ExternalLink size={13} className="text-border group-hover:text-muted transition-colors" />
          )}
        </div>
      </div>
    </Link>
  )
}

export default function ProductsPage() {
  const { products, getTimesGiven, addProduct } = useData()
  const [panelOpen, setPanelOpen] = useState(false)

  const handleSave = (formData) => {
    addProduct(formData)
    setPanelOpen(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Gift Library</h1>
        <Button variant="primary" onClick={() => setPanelOpen(true)}>
          <Plus size={16} />
          Add product
        </Button>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} timesGiven={getTimesGiven(p.id)} />
          ))}
        </div>
      ) : (
        <p className="text-muted text-sm">No products yet. Add something to your gift library.</p>
      )}

      <SlidePanel isOpen={panelOpen} onClose={() => setPanelOpen(false)} title="New product">
        <ProductForm onSave={handleSave} onCancel={() => setPanelOpen(false)} />
      </SlidePanel>
    </div>
  )
}

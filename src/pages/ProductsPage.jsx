import { Link } from 'react-router-dom'
import { ExternalLink, Package } from 'lucide-react'
import { products, getTimesGiven } from '../data/helpers'
import Tag from '../components/ui/Tag'

function ProductCard({ product }) {
  const timesGiven = getTimesGiven(product.id)

  return (
    <Link
      to={`/products/${product.id}`}
      className="flex flex-col bg-surface border border-border rounded-md overflow-hidden hover:border-accent/40 transition-colors group"
    >
      <div className="bg-border/40 h-36 flex items-center justify-center">
        <Package size={28} className="text-border" />
      </div>
      <div className="p-4">
        <p className="font-bold text-foreground text-[15px] leading-snug">{product.name}</p>
        <p className="text-sm text-muted mt-1 line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            {product.price && (
              <span className="text-sm font-medium text-foreground">${product.price}</span>
            )}
            {timesGiven > 0 && (
              <Tag variant="success">
                Given {timesGiven}×
              </Tag>
            )}
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
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Gift Library</h1>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  )
}

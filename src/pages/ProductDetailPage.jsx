import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowUpRight, Pencil, Trash2 } from 'lucide-react'
import { useData } from '../data/DataContext'
import Avatar from '../components/ui/Avatar'
import { formatMoney } from '../data/helpers'
import { BackLink, SectionHeader, NotFound } from '../components/ui/PageHeader'
import { useConfirm } from '../components/ui/ConfirmDialog'
import { ProductImage } from './ProductsPage'
import Tag from '../components/ui/Tag'
import Button from '../components/ui/Button'
import SlidePanel from '../components/ui/SlidePanel'
import ProductForm from '../components/products/ProductForm'

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getProductById, getTimesGiven, giftProducts, getGiftById, getRecipientsForGift, getOccasionById, updateProduct, deleteProduct } = useData()

  const confirm = useConfirm()
  const product = getProductById(id)
  const [editOpen, setEditOpen] = useState(false)

  if (!product) return <NotFound title="We couldn't find that gift idea" backTo="/products" backLabel="Back to gift library" />

  const timesGiven = getTimesGiven(id)
  const givenIn = giftProducts
    .filter((gp) => gp.product_id === id)
    .map((gp) => getGiftById(gp.gift_id))
    .filter(Boolean)

  const handleSave = (formData) => {
    updateProduct(id, formData, { success: 'Changes saved' })
    setEditOpen(false)
  }

  const handleDelete = async () => {
    const n = givenIn.length
    const ok = await confirm({
      title: `Delete ${product.name}?`,
      body:
        (n > 0 ? `It will be removed from ${n} gift${n === 1 ? '' : 's'}; the gifts themselves stay. ` : '') +
        "This can't be undone.",
      confirmLabel: 'Delete idea',
    })
    if (!ok) return
    deleteProduct(id, { success: `${product.name} deleted` })
    navigate('/products')
  }

  return (
    <div>
      <BackLink to="/products">Gift library</BackLink>

      <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-10 mb-12">
        <div className="aspect-square rounded-2xl overflow-hidden bg-sand">
          <ProductImage product={product} large />
        </div>

        <div className="flex flex-col">
          <div className="flex items-start justify-between gap-3">
            {timesGiven > 0 ? <Tag variant="success">Given {timesGiven}×</Tag> : <Tag>Not given yet</Tag>}
            <div className="flex items-center gap-1 -mt-1 -mr-1">
              <Button size="icon" variant="ghost" onClick={() => setEditOpen(true)} aria-label="Edit gift idea">
                <Pencil size={16} strokeWidth={1.75} />
              </Button>
              <Button size="icon" variant="danger" onClick={handleDelete} aria-label="Delete gift idea">
                <Trash2 size={17} strokeWidth={1.75} />
              </Button>
            </div>
          </div>
          <h1 className="text-[30px] md:text-[36px] leading-[1.05] font-semibold text-ink mt-3">{product.name}</h1>
          {product.price != null && (
            <p className="font-display font-semibold text-[26px] text-ink mt-3 tracking-numeral">{formatMoney(product.price)}</p>
          )}
          {product.description && <p className="text-[16px] leading-relaxed text-ink-soft mt-4">{product.description}</p>}

          {product.link && (
            <a
              href={product.link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full bg-ink text-paper font-medium hover:bg-ink-hover transition-colors self-start"
            >
              View where to buy
              <ArrowUpRight size={17} strokeWidth={1.75} />
            </a>
          )}
        </div>
      </div>

      {givenIn.length > 0 && (
        <section>
          <SectionHeader title="Gifted in" count={givenIn.length} />
          <div className="card divide-y divide-line overflow-hidden">
            {givenIn.map((gift) => {
              const recipients = getRecipientsForGift(gift.id)
              const occasion = getOccasionById(gift.occasion_id)
              const lead = recipients[0]
              return (
                <div key={gift.id} className="flex items-start gap-4 px-5 py-4">
                  {lead && <Avatar emoji={lead.emoji} name={lead.name} size="sm" />}
                  <div className="min-w-0">
                    <p className="font-display font-semibold text-[15px] text-ink">
                      {recipients.map((r) => r.name).join(', ') || gift.name}
                    </p>
                    {occasion && <p className="text-[13px] text-ink-soft mt-0.5">{occasion.name}</p>}
                    {gift.reception_notes && (
                      <p className="mt-2 inline-block rounded-md bg-sage-tint px-3 py-1.5 text-[14px] text-sage">
                        “{gift.reception_notes}”
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      <SlidePanel isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit gift idea">
        <ProductForm product={product} onSave={handleSave} onCancel={() => setEditOpen(false)} />
      </SlidePanel>
    </div>
  )
}

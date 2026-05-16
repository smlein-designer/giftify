import { useState } from 'react'
import Button from '../ui/Button'

const inputClass =
  'w-full h-10 px-3 border border-border rounded-md bg-white text-foreground text-sm placeholder:text-muted/60 focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/20'

export default function ProductForm({ product, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: product?.name ?? '',
    link: product?.link ?? '',
    description: product?.description ?? '',
    price: product?.price ?? '',
    photo_url: product?.photo_url ?? '',
  })

  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    onSave({
      ...form,
      price: form.price !== '' ? parseFloat(form.price) : null,
      photo_url: form.photo_url.trim() || null,
      link: form.link.trim() || null,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Name */}
      <div>
        <label className="block text-xs text-muted mb-1.5">
          Name <span className="text-accent">*</span>
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder="e.g. Rocker Garlic Press"
          className={inputClass}
          required
        />
      </div>

      {/* Price + Link */}
      <div className="flex gap-3">
        <div className="w-28 shrink-0">
          <label className="block text-xs text-muted mb-1.5">Price</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">$</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => set('price', e.target.value)}
              placeholder="0.00"
              className={`${inputClass} pl-6`}
            />
          </div>
        </div>
        <div className="flex-1">
          <label className="block text-xs text-muted mb-1.5">Buy link</label>
          <input
            type="url"
            value={form.link}
            onChange={(e) => set('link', e.target.value)}
            placeholder="https://..."
            className={inputClass}
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs text-muted mb-1.5">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          placeholder="What makes it a good gift? Any relevant details."
          rows={3}
          className="w-full px-3 py-2.5 border border-border rounded-md bg-white text-foreground text-sm placeholder:text-muted/60 focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/20 resize-none"
        />
      </div>

      {/* Photo URL */}
      <div>
        <label className="block text-xs text-muted mb-1.5">Photo URL</label>
        <input
          type="url"
          value={form.photo_url}
          onChange={(e) => set('photo_url', e.target.value)}
          placeholder="https://... (paste an image URL)"
          className={inputClass}
        />
        {form.photo_url && (
          <div className="mt-2 h-24 rounded-md overflow-hidden border border-border bg-border/20">
            <img
              src={form.photo_url}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={(e) => { e.target.style.display = 'none' }}
            />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <Button type="submit" variant="primary" className="flex-1">
          {product ? 'Save changes' : 'Add to library'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

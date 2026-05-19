import { useState } from 'react'
import { Upload, Loader2, X, Link2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
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
  const [uploading, setUploading] = useState(false)
  const [grabbing, setGrabbing] = useState(false)

  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `${crypto.randomUUID()}.${ext}`
    const { error } = await supabase.storage.from('product-photos').upload(path, file)
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from('product-photos').getPublicUrl(path)
      set('photo_url', publicUrl)
    }
    setUploading(false)
  }

  const handleGrabPhoto = async () => {
    if (!form.link) return
    setGrabbing(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetch-og`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ url: form.link }),
        }
      )
      const data = await res.json()
      if (data.imageUrl) set('photo_url', data.imageUrl)
    } catch {
      // fail silently — user can still upload or paste a URL
    }
    setGrabbing(false)
  }

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

      {/* Photo */}
      <div>
        <label className="block text-xs text-muted mb-1.5">Photo</label>

        <div className="relative h-36 rounded-md overflow-hidden border border-border bg-surface mb-2 flex items-center justify-center">
          {form.photo_url ? (
            <>
              <img
                src={form.photo_url}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={(e) => { e.target.style.display = 'none' }}
              />
              <button
                type="button"
                onClick={() => set('photo_url', '')}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
              >
                <X size={12} />
              </button>
            </>
          ) : (
            <label className="cursor-pointer flex flex-col items-center gap-2 text-muted hover:text-foreground transition-colors">
              {uploading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Upload size={20} />
              )}
              <span className="text-xs">{uploading ? 'Uploading…' : 'Click to upload'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="sr-only"
                disabled={uploading}
              />
            </label>
          )}
        </div>

        <input
          type="url"
          value={form.photo_url}
          onChange={(e) => set('photo_url', e.target.value)}
          placeholder="or paste an image URL"
          className={inputClass}
        />

        {!form.photo_url && form.link && (
          <button
            type="button"
            onClick={handleGrabPhoto}
            disabled={grabbing}
            className="mt-2 text-sm text-accent hover:text-accent-hover font-medium flex items-center gap-1.5 disabled:opacity-50 transition-colors"
          >
            {grabbing ? <Loader2 size={13} className="animate-spin" /> : <Link2 size={13} />}
            {grabbing ? 'Fetching…' : 'Grab photo from buy link'}
          </button>
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

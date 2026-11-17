import { useRef, useState } from 'react'
import { Upload, Loader2, X, Link2, ImageOff } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import Button from '../ui/Button'
import Field, { isUrl, focusFirstError } from '../ui/Field'

export default function ProductForm({ product, onSave, onCancel }) {
  const formRef = useRef(null)
  const submitted = useRef(false)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [form, setForm] = useState({
    name: product?.name ?? '',
    link: product?.link ?? '',
    description: product?.description ?? '',
    price: product?.price ?? '',
    photo_url: product?.photo_url ?? '',
  })
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const [imgBroken, setImgBroken] = useState(false)
  const [grabbing, setGrabbing] = useState(false)
  const [grabFailed, setGrabFailed] = useState(false)

  const set = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
    if (field === 'photo_url') setImgBroken(false)
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) return setUploadError('That file isn’t an image. Try a JPG, PNG or WebP.')
    if (file.size > 8 * 1024 * 1024) return setUploadError('That image is over 8 MB. Try a smaller one.')
    setUploadError(null)
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `${crypto.randomUUID()}.${ext}`
    const { error } = await supabase.storage.from('product-photos').upload(path, file)
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from('product-photos').getPublicUrl(path)
      set('photo_url', publicUrl)
    } else {
      console.error('Giftify: photo upload failed', error)
      setUploadError('The upload didn’t go through. Check your connection and try again.')
    }
    setUploading(false)
  }

  const handleGrabPhoto = async () => {
    if (!form.link) return
    setGrabbing(true)
    setGrabFailed(false)
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
      if (data.imageUrl) {
        set('photo_url', data.imageUrl)
      } else {
        setGrabFailed(true)
      }
    } catch {
      setGrabFailed(true)
    }
    setGrabbing(false)
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Give this idea a name.'
    const price = String(form.price).trim()
    if (price !== '' && (isNaN(Number(price)) || Number(price) < 0)) e.price = 'Use a number, like 24.99.'
    if (form.link.trim() && !isUrl(form.link.trim())) e.link = 'Paste the full link, starting with https://'
    if (form.photo_url.trim() && !isUrl(form.photo_url.trim())) e.photo_url = 'Paste the full image link, starting with https://'
    return e
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (submitted.current) return
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      focusFirstError(formRef.current)
      return
    }
    submitted.current = true
    setSaving(true)
    onSave({
      ...form,
      name: form.name.trim(),
      description: form.description.trim(),
      price: String(form.price).trim() !== '' ? Math.round(parseFloat(form.price) * 100) / 100 : null,
      photo_url: form.photo_url.trim() || null,
      link: form.link.trim() || null,
    })
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <Field label="Name" required error={errors.name}>
        <input
          type="text"
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder="e.g. Rocker Garlic Press"
          className="field"
          maxLength={80}
          autoComplete="off"
        />
      </Field>

      <div className="grid grid-cols-[7.5rem_1fr] gap-3">
        <Field label="Price" controlId="product-price" error={errors.price}>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[15px] text-ink-soft" aria-hidden="true">$</span>
            <input
              id="product-price"
              type="text"
              inputMode="decimal"
              value={form.price}
              onChange={(e) => set('price', e.target.value.replace(/[^0-9.]/g, ''))}
              placeholder="0.00"
              aria-invalid={errors.price ? true : undefined}
              aria-describedby={errors.price ? 'product-price-error' : undefined}
              className="field pl-7 tabular"
            />
          </div>
        </Field>
        <Field label="Where to buy" error={errors.link}>
          <input
            type="url"
            inputMode="url"
            value={form.link}
            onChange={(e) => {
              set('link', e.target.value)
              setGrabFailed(false)
            }}
            placeholder="https://"
            className="field"
            autoComplete="off"
          />
        </Field>
      </div>

      <Field label="Why it's a good gift">
        <textarea
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          placeholder="What makes it special? Sizes, colors, details to remember."
          rows={3}
          className="field-area"
        />
      </Field>

      <fieldset>
        <legend className="field-label">Photo</legend>

        <div className="relative h-44 rounded-lg overflow-hidden border border-dashed border-line-strong bg-sand/50 mb-2.5 flex items-center justify-center">
          {form.photo_url && !imgBroken ? (
            <>
              <img src={form.photo_url} alt="" className="w-full h-full object-cover" onError={() => setImgBroken(true)} />
              <button
                type="button"
                onClick={() => set('photo_url', '')}
                aria-label="Remove photo"
                className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-ink/70 hover:bg-ink text-paper flex items-center justify-center transition-colors"
              >
                <X size={14} strokeWidth={2} />
              </button>
            </>
          ) : form.photo_url && imgBroken ? (
            <div className="flex flex-col items-center gap-2 text-ink-soft px-6 text-center">
              <ImageOff size={20} strokeWidth={1.75} />
              <span className="text-[14px]">That image link didn't load.</span>
              <button type="button" onClick={() => set('photo_url', '')} className="text-[13px] font-medium text-ink underline underline-offset-4">
                Remove it
              </button>
            </div>
          ) : (
            <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center gap-2 text-ink-soft hover:text-ink transition-colors focus-within:ring-2 focus-within:ring-ink focus-within:ring-inset rounded-lg">
              {uploading ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} strokeWidth={1.75} />}
              <span className="text-[14px] font-medium">{uploading ? 'Uploading…' : 'Upload a photo'}</span>
              <span className="text-[12px] text-ink-faint">JPG, PNG or WebP, up to 8 MB</span>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="sr-only" disabled={uploading} />
            </label>
          )}
        </div>
        {uploadError && (
          <p role="alert" className="text-[13px] text-danger mb-2">
            {uploadError}
          </p>
        )}

        <Field error={errors.photo_url}>
          <input
            type="url"
            inputMode="url"
            aria-label="Image link"
            value={form.photo_url}
            onChange={(e) => set('photo_url', e.target.value)}
            placeholder="or paste an image link"
            className="field"
            autoComplete="off"
          />
        </Field>

        {!form.photo_url && form.link && isUrl(form.link.trim()) && (
          <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1">
            <button
              type="button"
              onClick={handleGrabPhoto}
              disabled={grabbing}
              className="text-[14px] text-ink font-medium underline decoration-line-strong underline-offset-4 hover:decoration-ink flex items-center gap-1.5 disabled:opacity-50 transition-colors"
            >
              {grabbing ? <Loader2 size={13} className="animate-spin" /> : <Link2 size={13} />}
              {grabbing ? 'Looking for a photo…' : 'Grab the photo from that link'}
            </button>
            {grabFailed && (
              <span role="status" className="text-[13px] text-ink-faint">
                No photo found there. Try uploading one instead.
              </span>
            )}
          </div>
        )}
      </fieldset>

      <div className="flex gap-2 pt-4 mt-2 border-t border-line">
        <Button type="submit" className="flex-1" disabled={saving || uploading}>
          {saving ? 'Saving…' : product ? 'Save changes' : 'Save to library'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

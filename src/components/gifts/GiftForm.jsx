import { useState } from 'react'
import Button from '../ui/Button'

const PHYSICAL_STATUSES = ['idea', 'purchased', 'wrapped', 'shipped', 'received']
const EXPERIENCE_STATUSES = ['planned', 'confirmed', 'executed']

const inputClass =
  'w-full h-10 px-3 border border-border rounded-md bg-white text-foreground text-sm placeholder:text-muted/60 focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/20'

export default function GiftForm({
  gift,
  occasionId,
  recipients,
  products,
  initialRecipientIds = [],
  initialProductIds = [],
  onSave,
  onCancel,
}) {
  const [form, setForm] = useState({
    name: gift?.name ?? '',
    type: gift?.type ?? null,
    physical_status: gift?.physical_status ?? 'idea',
    experience_status: gift?.experience_status ?? 'planned',
    notes: gift?.notes ?? '',
    reception_notes: gift?.reception_notes ?? '',
  })
  const [recipientIds, setRecipientIds] = useState(new Set(initialRecipientIds))
  const [productIds, setProductIds] = useState(new Set(initialProductIds))

  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  const toggleRecipient = (id) =>
    setRecipientIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const toggleProduct = (id) =>
    setProductIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const setType = (type) => {
    setForm((prev) => ({
      ...prev,
      type,
      physical_status: type === 'physical' ? (prev.physical_status || 'idea') : prev.physical_status,
      experience_status: type === 'experience' ? (prev.experience_status || 'planned') : prev.experience_status,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    onSave(
      {
        occasion_id: occasionId,
        name: form.name.trim(),
        type: form.type,
        physical_status: form.type === 'physical' ? form.physical_status : null,
        experience_status: form.type === 'experience' ? form.experience_status : null,
        notes: form.notes.trim() || null,
        reception_notes: form.reception_notes.trim() || null,
      },
      [...recipientIds],
      [...productIds]
    )
  }

  const statuses = form.type === 'physical' ? PHYSICAL_STATUSES : EXPERIENCE_STATUSES
  const currentStatus = form.type === 'physical' ? form.physical_status : form.experience_status
  const statusField = form.type === 'physical' ? 'physical_status' : 'experience_status'

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
          placeholder="e.g. Luke — Christmas 2026"
          className={inputClass}
          required
        />
      </div>

      {/* Type */}
      <div>
        <label className="block text-xs text-muted mb-1.5">Type</label>
        <div className="flex gap-2">
          {['physical', 'experience'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`flex-1 h-10 rounded-md border text-sm font-medium transition-colors capitalize ${
                form.type === t
                  ? 'bg-accent/10 border-accent/40 text-foreground'
                  : 'bg-white border-border text-muted hover:border-accent/30'
              }`}
            >
              {t}
            </button>
          ))}
          {form.type && (
            <button
              type="button"
              onClick={() => setType(null)}
              className="px-3 h-10 rounded-md border border-border text-sm text-muted hover:border-accent/30 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Status */}
      {form.type && (
        <div>
          <label className="block text-xs text-muted mb-1.5">Status</label>
          <select
            value={currentStatus}
            onChange={(e) => set(statusField, e.target.value)}
            className={inputClass}
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Recipients */}
      {recipients.length > 0 && (
        <div>
          <label className="block text-xs text-muted mb-2">Recipients</label>
          <div className="flex flex-wrap gap-2">
            {recipients.map((r) => {
              const selected = recipientIds.has(r.id)
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => toggleRecipient(r.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm border transition-colors ${
                    selected
                      ? 'bg-accent/10 border-accent/40 text-foreground'
                      : 'bg-white border-border text-muted hover:border-accent/30'
                  }`}
                >
                  <span>{r.emoji}</span>
                  <span className={selected ? 'font-medium' : ''}>{r.name}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Products */}
      {products.length > 0 && (
        <div>
          <label className="block text-xs text-muted mb-2">Products from library</label>
          <div className="flex flex-col gap-1.5">
            {products.map((p) => {
              const selected = productIds.has(p.id)
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => toggleProduct(p.id)}
                  className={`flex items-center justify-between px-3 py-2 rounded-md text-sm border transition-colors text-left ${
                    selected
                      ? 'bg-accent/10 border-accent/40 text-foreground'
                      : 'bg-white border-border text-muted hover:border-accent/30'
                  }`}
                >
                  <span className={selected ? 'font-medium' : ''}>{p.name}</span>
                  {p.price != null && (
                    <span className="text-xs text-muted shrink-0 ml-2">${p.price}</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Notes */}
      <div>
        <label className="block text-xs text-muted mb-1.5">Notes</label>
        <textarea
          value={form.notes}
          onChange={(e) => set('notes', e.target.value)}
          placeholder="Wrapping instructions, reminders, etc."
          rows={2}
          className="w-full px-3 py-2.5 border border-border rounded-md bg-white text-foreground text-sm placeholder:text-muted/60 focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/20 resize-none"
        />
      </div>

      {/* Reception notes */}
      <div>
        <label className="block text-xs text-muted mb-1.5">How did they like it?</label>
        <textarea
          value={form.reception_notes}
          onChange={(e) => set('reception_notes', e.target.value)}
          placeholder="Fill in after the gift is given — helps with future suggestions"
          rows={2}
          className="w-full px-3 py-2.5 border border-border rounded-md bg-white text-foreground text-sm placeholder:text-muted/60 focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/20 resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <Button type="submit" variant="primary" className="flex-1">
          {gift ? 'Save changes' : 'Add gift'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

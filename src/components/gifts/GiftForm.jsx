import { useRef, useState } from 'react'
import Button from '../ui/Button'
import Avatar from '../ui/Avatar'
import Field, { focusFirstError } from '../ui/Field'
import { formatMoney } from '../../data/helpers'

const PHYSICAL_STATUSES = ['idea', 'purchased', 'wrapped', 'shipped', 'received']
const EXPERIENCE_STATUSES = ['planned', 'confirmed', 'executed']


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
  const formRef = useRef(null)
  const submitted = useRef(false)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
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

  const set = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

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
    if (submitted.current) return
    if (!form.name.trim()) {
      setErrors({ name: 'Give this gift a name, like “Scarf for Mom”.' })
      focusFirstError(formRef.current)
      return
    }
    submitted.current = true
    setSaving(true)
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
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <Field label="Name" required error={errors.name}>
        <input
          type="text"
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder="e.g. Linen apron for Mom"
          className="field"
          maxLength={80}
          autoComplete="off"
        />
      </Field>

      <fieldset>
        <legend className="field-label">Type</legend>
        <div className="flex gap-2" role="radiogroup" aria-label="Gift type">
          {['physical', 'experience'].map((t) => (
            <button
              key={t}
              type="button"
              role="radio"
              aria-checked={form.type === t}
              onClick={() => setType(t)}
              className={`chip flex-1 justify-center font-medium capitalize ${form.type === t ? 'chip-on' : ''}`}
            >
              {t}
            </button>
          ))}
          {form.type && (
            <button type="button" onClick={() => setType(null)} className="chip">
              Clear
            </button>
          )}
        </div>
        {!form.type && <p className="text-[13px] text-ink-faint mt-1.5">Choose a type to track its progress.</p>}
      </fieldset>

      {form.type && (
        <Field label="Status">
          <select value={currentStatus} onChange={(e) => set(statusField, e.target.value)} className="field">
            {statuses.map((st) => (
              <option key={st} value={st}>
                {st.charAt(0).toUpperCase() + st.slice(1)}
              </option>
            ))}
          </select>
        </Field>
      )}

      {recipients.length > 0 ? (
        <fieldset>
          <legend className="field-label">For</legend>
          <div className="flex flex-wrap gap-2">
            {recipients.map((r) => {
              const selected = recipientIds.has(r.id)
              return (
                <button
                  key={r.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleRecipient(r.id)}
                  className={`chip ${selected ? 'chip-on' : ''}`}
                >
                  <Avatar emoji={r.emoji} name={r.name} size="xs" className="-ml-2" />
                  <span className="font-medium max-w-[10rem] truncate">{r.name}</span>
                </button>
              )
            })}
          </div>
        </fieldset>
      ) : (
        <p className="text-[13px] text-ink-faint">Add people on the People page to assign this gift to someone.</p>
      )}

      {products.length > 0 && (
        <fieldset>
          <legend className="field-label">From your gift library</legend>
          <div className="flex flex-col gap-1.5 max-h-72 overflow-y-auto -mx-1 px-1 py-1">
            {products.map((p) => {
              const selected = productIds.has(p.id)
              return (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleProduct(p.id)}
                  className={`flex items-center justify-between gap-3 min-h-12 px-4 py-2 rounded-md text-[14px] border transition-colors text-left ${
                    selected
                      ? 'bg-ink border-ink text-paper'
                      : 'bg-card border-line-strong text-ink hover:border-ink-faint'
                  }`}
                >
                  <span className="font-medium">{p.name}</span>
                  {p.price != null && (
                    <span className={`text-[13px] shrink-0 tabular ${selected ? 'text-paper/70' : 'text-ink-soft'}`}>{formatMoney(p.price)}</span>
                  )}
                </button>
              )
            })}
          </div>
        </fieldset>
      )}

      <Field label="Notes">
        <textarea
          value={form.notes}
          onChange={(e) => set('notes', e.target.value)}
          placeholder="Wrapping instructions, reminders, etc."
          rows={2}
          className="field-area"
        />
      </Field>

      <Field label="How did they like it?" hint="Fill this in after it's given. It helps future suggestions.">
        <textarea
          value={form.reception_notes}
          onChange={(e) => set('reception_notes', e.target.value)}
          rows={2}
          className="field-area"
        />
      </Field>

      <div className="flex gap-2 pt-4 mt-2 border-t border-line">
        <Button type="submit" className="flex-1" disabled={saving}>
          {saving ? 'Saving…' : gift ? 'Save changes' : 'Add gift'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

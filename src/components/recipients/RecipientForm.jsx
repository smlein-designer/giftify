import { useRef, useState } from 'react'
import Button from '../ui/Button'
import Avatar from '../ui/Avatar'
import Field, { isEmail, focusFirstError } from '../ui/Field'
import { RECIPIENT_GLYPHS, iconFor } from '../../lib/glyph'

const GROUPS = ['Family', 'Friends', 'Coworkers', 'Other']

export default function RecipientForm({ recipient, onSave, onCancel }) {
  const formRef = useRef(null)
  const submitted = useRef(false)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [form, setForm] = useState({
    name: recipient?.name ?? '',
    emoji: recipient?.emoji ?? '👤',
    group_tag: recipient?.group_tag ?? 'Family',
    budget: recipient?.budget ?? '',
    gift_prompt: recipient?.gift_prompt ?? '',
    shipping_address: recipient?.shipping_address ?? '',
    email: recipient?.email ?? '',
    phone: recipient?.phone ?? '',
  })

  const set = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Add a name so you can find them later.'
    if (form.email.trim() && !isEmail(form.email.trim())) e.email = "That email doesn't look complete."
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
    onSave({ ...form, name: form.name.trim(), email: form.email.trim() })
  }

  const currentGlyph = iconFor(form.emoji) ? form.emoji : '👤'

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <Field label="Name" required error={errors.name}>
        <input
          type="text"
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder="e.g. Mom, Lucky"
          className="field"
          maxLength={60}
          autoComplete="off"
        />
      </Field>

      <fieldset>
        <legend className="field-label">Avatar</legend>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Avatar">
          {RECIPIENT_GLYPHS.map((g) => {
            const selected = currentGlyph === g.value
            return (
              <button
                key={g.value}
                type="button"
                role="radio"
                aria-checked={selected}
                title={g.label}
                aria-label={g.label}
                onClick={() => set('emoji', g.value)}
                className={`rounded-full p-0.5 transition-shadow ${selected ? 'ring-2 ring-ink' : 'ring-1 ring-transparent hover:ring-line-strong'}`}
              >
                <Avatar emoji={g.value} name={form.name || 'A'} size="md" />
              </button>
            )
          })}
        </div>
      </fieldset>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Group">
          <select value={form.group_tag} onChange={(e) => set('group_tag', e.target.value)} className="field">
            {GROUPS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Budget">
          <input
            type="text"
            value={form.budget}
            onChange={(e) => set('budget', e.target.value)}
            placeholder="e.g. $50–75"
            className="field"
            maxLength={30}
          />
        </Field>
      </div>

      <Field label="What they love" hint="Interests, tastes, things to avoid. Gift ideas get much better with a few details.">
        <textarea
          value={form.gift_prompt}
          onChange={(e) => set('gift_prompt', e.target.value)}
          placeholder="e.g. Loves gardening and cooking shows. Quality over quantity."
          rows={4}
          className="field-area"
        />
      </Field>

      <fieldset className="flex flex-col gap-3">
        <legend className="font-display font-semibold text-[15px] text-ink mb-1">
          Contact details <span className="font-sans font-normal text-[13px] text-ink-faint">(optional)</span>
        </legend>
        <Field label="Shipping address">
          <input
            type="text"
            value={form.shipping_address}
            onChange={(e) => set('shipping_address', e.target.value)}
            className="field"
            autoComplete="off"
          />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Email" error={errors.email}>
            <input
              type="email"
              inputMode="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              className="field"
              autoComplete="off"
            />
          </Field>
          <Field label="Phone">
            <input
              type="tel"
              inputMode="tel"
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
              className="field"
              autoComplete="off"
            />
          </Field>
        </div>
      </fieldset>

      <div className="flex gap-2 pt-4 mt-2 border-t border-line">
        <Button type="submit" className="flex-1" disabled={saving}>
          {saving ? 'Saving…' : recipient ? 'Save changes' : 'Add person'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

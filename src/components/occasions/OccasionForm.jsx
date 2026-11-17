import { useRef, useState } from 'react'
import Button from '../ui/Button'
import Field, { focusFirstError } from '../ui/Field'

function nextDateForHoliday(holiday) {
  if (!holiday || holiday.date_logic?.type !== 'fixed') return ''
  const { month, day } = holiday.date_logic
  const today = new Date()
  const y = today.getFullYear()
  const candidate = new Date(y, month - 1, day)
  const year = candidate >= today ? y : y + 1
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export default function OccasionForm({ occasion, holidays, onSave, onCancel }) {
  const formRef = useRef(null)
  const submitted = useRef(false)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [form, setForm] = useState({
    holiday_id: occasion?.holiday_id ?? '',
    name: occasion?.name ?? '',
    date: occasion?.date ?? '',
    start_shopping_date: occasion?.start_shopping_date ?? '',
    ship_date: occasion?.ship_date ?? '',
    notes: occasion?.notes ?? '',
  })

  const set = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const handleHolidayChange = (holidayId) => {
    const h = holidays.find((h) => h.id === holidayId)
    const newDate = h ? nextDateForHoliday(h) : ''
    const year = newDate ? Number(newDate.slice(0, 4)) : new Date().getFullYear()
    const autoName = h ? `${h.name} ${year}` : ''
    setForm((prev) => ({
      ...prev,
      holiday_id: holidayId,
      date: newDate || prev.date,
      name: autoName || prev.name,
    }))
    setErrors({})
  }

  // ISO date strings compare correctly as text
  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Give this occasion a name.'
    if (!form.date) e.date = 'Pick the date of the occasion.'
    if (form.date && form.start_shopping_date && form.start_shopping_date > form.date)
      e.start_shopping_date = 'This should be on or before the occasion date.'
    if (form.date && form.ship_date && form.ship_date > form.date)
      e.ship_date = 'Ship-by should be on or before the occasion date.'
    else if (form.start_shopping_date && form.ship_date && form.ship_date < form.start_shopping_date)
      e.ship_date = 'Ship-by should come after you start shopping.'
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
      holiday_id: form.holiday_id || null,
      name: form.name.trim(),
      date: form.date,
      start_shopping_date: form.start_shopping_date || null,
      ship_date: form.ship_date || null,
      notes: form.notes.trim() || null,
    })
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <Field label="Repeating date" hint="Pick one to fill in the name and date for you.">
        <select value={form.holiday_id} onChange={(e) => handleHolidayChange(e.target.value)} className="field">
          <option value="">None (one-time occasion)</option>
          {holidays.map((h) => (
            <option key={h.id} value={h.id}>
              {h.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Name" required error={errors.name}>
        <input
          type="text"
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder="e.g. Christmas 2026"
          className="field"
          maxLength={80}
          autoComplete="off"
        />
      </Field>

      <Field label="Date" required error={errors.date}>
        <input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} className="field" />
      </Field>

      <fieldset className="flex flex-col gap-3">
        <legend className="font-display font-semibold text-[15px] text-ink mb-1">
          Planning dates <span className="font-sans font-normal text-[13px] text-ink-faint">(optional)</span>
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Start shopping" error={errors.start_shopping_date}>
            <input
              type="date"
              value={form.start_shopping_date}
              max={form.date || undefined}
              onChange={(e) => set('start_shopping_date', e.target.value)}
              className="field"
            />
          </Field>
          <Field label="Ship by" error={errors.ship_date}>
            <input
              type="date"
              value={form.ship_date}
              max={form.date || undefined}
              onChange={(e) => set('ship_date', e.target.value)}
              className="field"
            />
          </Field>
        </div>
      </fieldset>

      <Field label="Notes">
        <textarea
          value={form.notes}
          onChange={(e) => set('notes', e.target.value)}
          placeholder="Any reminders or context for this occasion"
          rows={3}
          className="field-area"
        />
      </Field>

      <div className="flex gap-2 pt-4 mt-2 border-t border-line">
        <Button type="submit" className="flex-1" disabled={saving}>
          {saving ? 'Saving…' : occasion ? 'Save changes' : 'Add occasion'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

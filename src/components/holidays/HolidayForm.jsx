import { useRef, useState } from 'react'
import Button from '../ui/Button'
import IconTile from '../ui/IconTile'
import Field, { focusFirstError } from '../ui/Field'
import { HOLIDAY_GLYPHS } from '../../lib/glyph'
import { describeDateLogic } from '../../data/helpers'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export default function HolidayForm({ holiday, onSave, onCancel }) {
  const formRef = useRef(null)
  const submitted = useRef(false)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  // Holidays like Mother's Day follow a rule, not a fixed day; editing keeps the rule
  const ruleBased = holiday?.date_logic && holiday.date_logic.type !== 'fixed'
  const [form, setForm] = useState({
    name: holiday?.name ?? '',
    icon: holiday?.icon ?? '🎉',
    month: holiday?.date_logic?.month ?? 1,
    day: holiday?.date_logic?.day ?? 1,
  })

  const set = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (submitted.current) return
    if (!form.name.trim()) {
      setErrors({ name: "Give this date a name, like “Dad's Birthday”." })
      focusFirstError(formRef.current)
      return
    }
    submitted.current = true
    setSaving(true)
    onSave({
      name: form.name.trim(),
      icon: form.icon || '🎉',
      date_logic: ruleBased
        ? holiday.date_logic
        : { type: 'fixed', month: Number(form.month), day: Number(form.day) },
    })
  }

  // Leap year so Feb 29 stays available
  const daysInMonth = new Date(2024, Number(form.month), 0).getDate()

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <Field label="Name" required error={errors.name}>
        <input
          type="text"
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder="e.g. Dad's Birthday"
          className="field"
          maxLength={60}
          autoComplete="off"
        />
      </Field>

      <fieldset>
        <legend className="field-label">Icon</legend>
        <div className="grid grid-cols-8 gap-1.5" role="radiogroup" aria-label="Icon">
          {HOLIDAY_GLYPHS.map((g) => {
            const selected = form.icon === g.value
            return (
              <button
                key={g.value}
                type="button"
                role="radio"
                aria-checked={selected}
                title={g.label}
                aria-label={g.label}
                onClick={() => set('icon', g.value)}
                className={`rounded-[14px] p-0.5 transition-shadow ${selected ? 'ring-2 ring-ink' : 'ring-1 ring-transparent hover:ring-line-strong'}`}
              >
                <IconTile icon={g.value} name={form.name || 'date'} size="sm" />
              </button>
            )
          })}
        </div>
      </fieldset>

      {ruleBased ? (
        <div>
          <p className="field-label">Date</p>
          <p className="text-ink">{describeDateLogic(holiday.date_logic)}</p>
          <p className="text-[13px] text-ink-faint mt-1.5">Worked out for you each year.</p>
        </div>
      ) : (
      <fieldset>
        <legend className="field-label">Date</legend>
        <div className="flex gap-2">
          <select
            aria-label="Month"
            value={form.month}
            onChange={(e) => {
              const m = e.target.value
              const max = new Date(2024, Number(m), 0).getDate()
              setForm((prev) => ({ ...prev, month: m, day: Math.min(Number(prev.day), max) }))
            }}
            className="field flex-1"
          >
            {MONTHS.map((m, i) => (
              <option key={m} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
          <select aria-label="Day" value={form.day} onChange={(e) => set('day', e.target.value)} className="field w-24">
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <p className="text-[13px] text-ink-faint mt-1.5">
          Repeats every year. {holiday ? '' : "We'll set up occasions for the next three years."}
        </p>
      </fieldset>
      )}

      <div className="flex gap-2 pt-4 mt-2 border-t border-line">
        <Button type="submit" className="flex-1" disabled={saving}>
          {saving ? 'Saving…' : holiday ? 'Save changes' : 'Add date'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

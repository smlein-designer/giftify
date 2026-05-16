import { useState } from 'react'
import Button from '../ui/Button'

const inputClass =
  'w-full h-10 px-3 border border-border rounded-md bg-white text-foreground text-sm placeholder:text-muted/60 focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/20'

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
  const [form, setForm] = useState({
    holiday_id: occasion?.holiday_id ?? '',
    name: occasion?.name ?? '',
    date: occasion?.date ?? '',
    start_shopping_date: occasion?.start_shopping_date ?? '',
    ship_date: occasion?.ship_date ?? '',
    notes: occasion?.notes ?? '',
  })

  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  const handleHolidayChange = (holidayId) => {
    const h = holidays.find((h) => h.id === holidayId)
    const newDate = h ? nextDateForHoliday(h) : ''
    const year = newDate ? new Date(newDate).getFullYear() : new Date().getFullYear()
    const autoName = h ? `${h.name} ${year}` : ''
    setForm((prev) => ({
      ...prev,
      holiday_id: holidayId,
      date: newDate || prev.date,
      name: autoName || prev.name,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.date) return
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Holiday (optional) */}
      <div>
        <label className="block text-xs text-muted mb-1.5">Holiday (optional)</label>
        <select
          value={form.holiday_id}
          onChange={(e) => handleHolidayChange(e.target.value)}
          className={inputClass}
        >
          <option value="">One-off / standalone</option>
          {holidays.map((h) => (
            <option key={h.id} value={h.id}>
              {h.icon} {h.name}
            </option>
          ))}
        </select>
      </div>

      {/* Name */}
      <div>
        <label className="block text-xs text-muted mb-1.5">
          Name <span className="text-accent">*</span>
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder="e.g. Christmas 2026"
          className={inputClass}
          required
        />
      </div>

      {/* Date */}
      <div>
        <label className="block text-xs text-muted mb-1.5">
          Date <span className="text-accent">*</span>
        </label>
        <input
          type="date"
          value={form.date}
          onChange={(e) => set('date', e.target.value)}
          className={inputClass}
          required
        />
      </div>

      {/* Planning dates */}
      <div>
        <p className="text-xs text-muted mb-2">Planning dates (optional)</p>
        <div className="flex flex-col gap-2">
          <div>
            <label className="block text-xs text-muted mb-1">Start shopping</label>
            <input
              type="date"
              value={form.start_shopping_date}
              onChange={(e) => set('start_shopping_date', e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">Ship by</label>
            <input
              type="date"
              value={form.ship_date}
              onChange={(e) => set('ship_date', e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs text-muted mb-1.5">Notes</label>
        <textarea
          value={form.notes}
          onChange={(e) => set('notes', e.target.value)}
          placeholder="Any reminders or context for this occasion"
          rows={3}
          className="w-full px-3 py-2.5 border border-border rounded-md bg-white text-foreground text-sm placeholder:text-muted/60 focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/20 resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <Button type="submit" variant="primary" className="flex-1">
          {occasion ? 'Save changes' : 'Add occasion'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

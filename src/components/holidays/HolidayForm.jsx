import { useState } from 'react'
import Button from '../ui/Button'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const inputClass =
  'w-full h-10 px-3 border border-border rounded-md bg-white text-foreground text-sm placeholder:text-muted/60 focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/20'

export default function HolidayForm({ holiday, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: holiday?.name ?? '',
    icon: holiday?.icon ?? '🎉',
    month: holiday?.date_logic?.month ?? 1,
    day: holiday?.date_logic?.day ?? 1,
  })

  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    onSave({
      name: form.name.trim(),
      icon: form.icon.trim() || '🎉',
      date_logic: { type: 'fixed', month: Number(form.month), day: Number(form.day) },
    })
  }

  const daysInMonth = new Date(2024, Number(form.month), 0).getDate()

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Icon + Name */}
      <div className="flex gap-3">
        <div>
          <label className="block text-xs text-muted mb-1.5">Icon</label>
          <input
            type="text"
            value={form.icon}
            onChange={(e) => set('icon', e.target.value)}
            maxLength={2}
            placeholder="🎉"
            className="w-14 h-10 px-2 text-center text-xl border border-border rounded-md bg-white focus:outline-none focus:border-accent/60"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs text-muted mb-1.5">
            Name <span className="text-accent">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="e.g. Dad's Birthday"
            className={inputClass}
            required
          />
        </div>
      </div>

      {/* Date */}
      <div>
        <label className="block text-xs text-muted mb-1.5">Date (repeats every year)</label>
        <div className="flex gap-2">
          <select
            value={form.month}
            onChange={(e) => {
              set('month', e.target.value)
              // clamp day if it exceeds new month's days
              const newMax = new Date(2024, Number(e.target.value), 0).getDate()
              if (Number(form.day) > newMax) set('day', newMax)
            }}
            className={`${inputClass} flex-1`}
          >
            {MONTHS.map((m, i) => (
              <option key={m} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
          <select
            value={form.day}
            onChange={(e) => set('day', e.target.value)}
            className="w-20 h-10 px-3 border border-border rounded-md bg-white text-foreground text-sm focus:outline-none focus:border-accent/60"
          >
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <Button type="submit" variant="primary" className="flex-1">
          {holiday ? 'Save changes' : 'Add holiday'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

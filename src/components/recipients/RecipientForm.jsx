import { useState } from 'react'
import Button from '../ui/Button'

const GROUPS = ['Family', 'Friends', 'Coworkers', 'Other']
const EMOJI_OPTIONS = ['👤', '👶', '🧒', '👦', '👧', '🧑', '👩', '👨', '🧓', '👴', '👵', '🐶', '🐱', '🐾', '🐰', '🐹']

const inputClass =
  'w-full h-10 px-3 border border-border rounded-md bg-white text-foreground text-sm placeholder:text-muted/60 focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/20'

export default function RecipientForm({ recipient, onSave, onCancel }) {
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

  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    onSave(form)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Emoji + Name */}
      <div className="flex gap-3">
        <div>
          <label className="block text-xs text-muted mb-1.5">Emoji</label>
          <select
            value={form.emoji}
            onChange={(e) => set('emoji', e.target.value)}
            className="h-10 px-2 border border-border rounded-md bg-white text-foreground text-base focus:outline-none focus:border-accent/60"
          >
            {EMOJI_OPTIONS.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs text-muted mb-1.5">
            Name <span className="text-accent">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="e.g. Mom, Lucky"
            className={inputClass}
            required
          />
        </div>
      </div>

      {/* Group + Budget */}
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-xs text-muted mb-1.5">Group</label>
          <select
            value={form.group_tag}
            onChange={(e) => set('group_tag', e.target.value)}
            className={inputClass}
          >
            {GROUPS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs text-muted mb-1.5">Budget</label>
          <input
            type="text"
            value={form.budget}
            onChange={(e) => set('budget', e.target.value)}
            placeholder="e.g. $50–75"
            className={inputClass}
          />
        </div>
      </div>

      {/* Gift prompt */}
      <div>
        <label className="block text-xs text-muted mb-1.5">Gift-giving notes</label>
        <textarea
          value={form.gift_prompt}
          onChange={(e) => set('gift_prompt', e.target.value)}
          placeholder="Personality, interests, things they love or hate — anything helpful for picking gifts"
          rows={4}
          className="w-full px-3 py-2.5 border border-border rounded-md bg-white text-foreground text-sm placeholder:text-muted/60 focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/20 resize-none"
        />
      </div>

      {/* Contact details */}
      <div>
        <p className="text-xs text-muted mb-2">Contact details (optional)</p>
        <div className="flex flex-col gap-2">
          <input
            type="text"
            value={form.shipping_address}
            onChange={(e) => set('shipping_address', e.target.value)}
            placeholder="Shipping address"
            className={inputClass}
          />
          <input
            type="email"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
            placeholder="Email"
            className={inputClass}
          />
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => set('phone', e.target.value)}
            placeholder="Phone"
            className={inputClass}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <Button type="submit" variant="primary" className="flex-1">
          {recipient ? 'Save changes' : 'Add recipient'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

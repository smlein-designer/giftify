import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Plus } from 'lucide-react'
import { useData } from '../data/DataContext'
import { formatDate, isUpcoming } from '../data/helpers'
import Tag from '../components/ui/Tag'
import Button from '../components/ui/Button'
import SlidePanel from '../components/ui/SlidePanel'
import HolidayForm from '../components/holidays/HolidayForm'

function HolidayRow({ holiday, defaultRecipients, next }) {
  return (
    <Link
      to={`/holidays/${holiday.id}`}
      className="flex items-center justify-between p-4 bg-surface border border-border rounded-md hover:border-accent/40 transition-colors group"
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{holiday.icon}</span>
        <div>
          <p className="font-bold text-foreground text-[16px]">{holiday.name}</p>
          <p className="text-sm text-muted mt-0.5">
            {defaultRecipients.length > 0
              ? defaultRecipients.map((r) => r.name).join(', ')
              : 'No default recipients'}
          </p>
          {next && <p className="text-xs text-muted mt-1">Next: {formatDate(next.date)}</p>}
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {!holiday.is_system && <Tag>Custom</Tag>}
        <ChevronRight size={16} className="text-border group-hover:text-muted transition-colors" />
      </div>
    </Link>
  )
}

export default function HolidaysPage() {
  const {
    holidays,
    occasions,
    getDefaultRecipientsForHoliday,
    getNextOccasionForHoliday,
    addHoliday,
    addOccasion,
  } = useData()
  const [panelOpen, setPanelOpen] = useState(false)

  const system = holidays.filter((h) => h.is_system)
  const custom = holidays.filter((h) => !h.is_system)

  const handleSave = (formData) => {
    const newHoliday = addHoliday(formData)
    // auto-create occasions for this year and next 2 years
    const { month, day } = newHoliday.date_logic
    const currentYear = new Date().getFullYear()
    ;[currentYear, currentYear + 1, currentYear + 2].forEach((year) => {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const alreadyExists = occasions.some(
        (o) => o.holiday_id === newHoliday.id && o.date === dateStr
      )
      if (!alreadyExists) {
        addOccasion({
          holiday_id: newHoliday.id,
          name: `${newHoliday.name} ${year}`,
          date: dateStr,
          notes: null,
        })
      }
    })
    setPanelOpen(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Holidays</h1>
        <Button variant="primary" onClick={() => setPanelOpen(true)}>
          <Plus size={16} />
          Add holiday
        </Button>
      </div>

      {custom.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-medium text-muted uppercase tracking-widest mb-3">Custom</h2>
          <div className="flex flex-col gap-2">
            {custom.map((h) => (
              <HolidayRow
                key={h.id}
                holiday={h}
                defaultRecipients={getDefaultRecipientsForHoliday(h.id)}
                next={getNextOccasionForHoliday(h.id)}
              />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-sm font-medium text-muted uppercase tracking-widest mb-3">System</h2>
        <div className="flex flex-col gap-2">
          {system.map((h) => (
            <HolidayRow
              key={h.id}
              holiday={h}
              defaultRecipients={getDefaultRecipientsForHoliday(h.id)}
              next={getNextOccasionForHoliday(h.id)}
            />
          ))}
        </div>
      </section>

      <SlidePanel isOpen={panelOpen} onClose={() => setPanelOpen(false)} title="New holiday">
        <HolidayForm onSave={handleSave} onCancel={() => setPanelOpen(false)} />
      </SlidePanel>
    </div>
  )
}

import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import {
  holidays,
  getDefaultRecipientsForHoliday,
  getNextOccasionForHoliday,
  formatDate,
} from '../data/helpers'
import Tag from '../components/ui/Tag'

function HolidayRow({ holiday }) {
  const defaultRecipients = getDefaultRecipientsForHoliday(holiday.id)
  const next = getNextOccasionForHoliday(holiday.id)

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
          {next && (
            <p className="text-xs text-muted mt-1">Next: {formatDate(next.date)}</p>
          )}
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
  const system = holidays.filter((h) => h.is_system)
  const custom = holidays.filter((h) => !h.is_system)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Holidays</h1>
      </div>

      {custom.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-medium text-muted uppercase tracking-widest mb-3">Custom</h2>
          <div className="flex flex-col gap-2">
            {custom.map((h) => (
              <HolidayRow key={h.id} holiday={h} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-sm font-medium text-muted uppercase tracking-widest mb-3">System</h2>
        <div className="flex flex-col gap-2">
          {system.map((h) => (
            <HolidayRow key={h.id} holiday={h} />
          ))}
        </div>
      </section>
    </div>
  )
}

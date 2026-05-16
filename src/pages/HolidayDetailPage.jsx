import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import {
  getHolidayById,
  getDefaultRecipientsForHoliday,
  getOccasionsForHoliday,
  getGiftProgress,
  formatDate,
  isUpcoming,
} from '../data/helpers'
import Tag from '../components/ui/Tag'

export default function HolidayDetailPage() {
  const { id } = useParams()
  const holiday = getHolidayById(id)
  if (!holiday) return <p className="text-muted">Holiday not found.</p>

  const defaultRecipients = getDefaultRecipientsForHoliday(id)
  const allOccasions = getOccasionsForHoliday(id)
  const upcomingOccasions = allOccasions.filter((o) => isUpcoming(o.date))
  const pastOccasions = allOccasions.filter((o) => !isUpcoming(o.date))

  return (
    <div>
      <Link to="/holidays" className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground mb-6">
        <ArrowLeft size={14} /> Holidays
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <span className="text-4xl">{holiday.icon}</span>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{holiday.name}</h1>
          {!holiday.is_system && <Tag className="mt-1">Custom</Tag>}
        </div>
      </div>

      {defaultRecipients.length > 0 && (
        <div className="mb-6 p-4 bg-surface border border-border rounded-md">
          <p className="text-xs text-muted uppercase tracking-wider mb-2">Default recipients</p>
          <div className="flex flex-wrap gap-2">
            {defaultRecipients.map((r) => (
              <Link
                key={r.id}
                to={`/recipients/${r.id}`}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-background border border-border rounded-md text-sm hover:border-accent/40 transition-colors"
              >
                <span>{r.emoji}</span>
                <span className="font-medium text-foreground">{r.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {upcomingOccasions.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-medium text-muted uppercase tracking-widest mb-3">Upcoming</h2>
          <div className="flex flex-col gap-2">
            {upcomingOccasions.map((o) => {
              const { total, purchased } = getGiftProgress(o.id)
              return (
                <Link
                  key={o.id}
                  to={`/occasions/${o.id}`}
                  className="flex items-center justify-between p-4 bg-surface border border-border rounded-md hover:border-accent/40 transition-colors"
                >
                  <div>
                    <p className="font-bold text-foreground">{o.name}</p>
                    <p className="text-sm text-muted mt-0.5">{formatDate(o.date)}</p>
                  </div>
                  <Tag variant={purchased === total && total > 0 ? 'success' : 'default'}>
                    {purchased}/{total} ready
                  </Tag>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {pastOccasions.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-muted uppercase tracking-widest mb-3">Past</h2>
          <div className="flex flex-col gap-2">
            {pastOccasions.map((o) => (
              <Link
                key={o.id}
                to={`/occasions/${o.id}`}
                className="flex items-center justify-between p-4 bg-surface border border-border rounded-md hover:border-accent/40 transition-colors"
              >
                <div>
                  <p className="font-bold text-foreground">{o.name}</p>
                  <p className="text-sm text-muted mt-0.5">{formatDate(o.date)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

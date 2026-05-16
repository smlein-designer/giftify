import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Gift, ChevronRight, Plus } from 'lucide-react'
import { useData } from '../data/DataContext'
import { daysUntil, formatDate } from '../data/helpers'
import Tag from '../components/ui/Tag'
import Button from '../components/ui/Button'
import SlidePanel from '../components/ui/SlidePanel'
import OccasionForm from '../components/occasions/OccasionForm'

function DaysAway({ days }) {
  if (days === 0) return <span className="text-sm font-semibold text-error">Today</span>
  if (days < 0) return <span className="text-sm text-muted">{Math.abs(days)}d ago</span>
  if (days <= 14) return <span className="text-sm font-semibold text-error">{days}d away</span>
  if (days <= 45) return <span className="text-sm font-semibold text-accent">{days}d away</span>
  return <span className="text-sm text-muted">{days}d away</span>
}

function OccasionCard({ occasion, holiday, progress }) {
  const { total, purchased } = progress
  const days = daysUntil(occasion.date)
  const shoppingOverdue =
    occasion.start_shopping_date && daysUntil(occasion.start_shopping_date) < 0

  return (
    <Link
      to={`/occasions/${occasion.id}`}
      className="flex items-center justify-between p-4 bg-surface border border-border rounded-md hover:border-accent/40 transition-colors group"
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl mt-0.5">{holiday?.icon ?? '📅'}</span>
        <div>
          <p className="font-bold text-foreground text-[16px] leading-snug">{occasion.name}</p>
          <p className="text-sm text-muted mt-0.5">{formatDate(occasion.date)}</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {total > 0 ? (
              <Tag variant={purchased === total ? 'success' : 'default'}>
                <Gift size={10} />
                {purchased}/{total} ready
              </Tag>
            ) : (
              <Tag>No gifts yet</Tag>
            )}
            {shoppingOverdue && <Tag variant="warning">Start shopping</Tag>}
            {occasion.start_shopping_date && !shoppingOverdue && (
              <Tag>Shop by {formatDate(occasion.start_shopping_date)}</Tag>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 ml-4 shrink-0">
        <DaysAway days={days} />
        <ChevronRight size={16} className="text-border group-hover:text-muted transition-colors" />
      </div>
    </Link>
  )
}

export default function OccasionsPage() {
  const { getUpcomingOccasions, getPastOccasions, getHolidayById, getGiftProgress, holidays, addOccasion } = useData()
  const [panelOpen, setPanelOpen] = useState(false)

  const upcoming = getUpcomingOccasions()
  const past = getPastOccasions()

  const handleSave = (formData) => {
    addOccasion(formData)
    setPanelOpen(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Occasions</h1>
        <Button variant="primary" onClick={() => setPanelOpen(true)}>
          <Plus size={16} />
          Add occasion
        </Button>
      </div>

      <section className="mb-10">
        <h2 className="text-sm font-medium text-muted uppercase tracking-widest mb-3">Upcoming</h2>
        {upcoming.length > 0 ? (
          <div className="flex flex-col gap-2">
            {upcoming.map((o) => (
              <OccasionCard
                key={o.id}
                occasion={o}
                holiday={getHolidayById(o.holiday_id)}
                progress={getGiftProgress(o.id)}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">No upcoming occasions.</p>
        )}
      </section>

      {past.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-muted uppercase tracking-widest mb-3">Past</h2>
          <div className="flex flex-col gap-2">
            {past.map((o) => (
              <OccasionCard
                key={o.id}
                occasion={o}
                holiday={getHolidayById(o.holiday_id)}
                progress={getGiftProgress(o.id)}
              />
            ))}
          </div>
        </section>
      )}

      <SlidePanel isOpen={panelOpen} onClose={() => setPanelOpen(false)} title="New occasion">
        <OccasionForm holidays={holidays} onSave={handleSave} onCancel={() => setPanelOpen(false)} />
      </SlidePanel>
    </div>
  )
}

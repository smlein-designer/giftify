import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import { useData } from '../data/DataContext'
import { formatDate, isUpcoming } from '../data/helpers'
import Tag from '../components/ui/Tag'
import Button from '../components/ui/Button'
import SlidePanel from '../components/ui/SlidePanel'
import HolidayForm from '../components/holidays/HolidayForm'

export default function HolidayDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const {
    getHolidayById,
    recipients,
    getDefaultRecipientsForHoliday,
    getOccasionsForHoliday,
    getGiftProgress,
    updateHoliday,
    deleteHoliday,
    setDefaultRecipientsForHoliday,
  } = useData()

  const holiday = getHolidayById(id)
  const [editOpen, setEditOpen] = useState(false)

  if (!holiday) return <p className="text-muted">Holiday not found.</p>

  const defaultRecipients = getDefaultRecipientsForHoliday(id)
  const defaultRecipientIds = new Set(defaultRecipients.map((r) => r.id))
  const allOccasions = getOccasionsForHoliday(id)
  const upcomingOccasions = allOccasions.filter((o) => isUpcoming(o.date))
  const pastOccasions = allOccasions.filter((o) => !isUpcoming(o.date))

  const toggleRecipient = (recipientId) => {
    const next = new Set(defaultRecipientIds)
    if (next.has(recipientId)) {
      next.delete(recipientId)
    } else {
      next.add(recipientId)
    }
    setDefaultRecipientsForHoliday(id, [...next])
  }

  const handleSave = (formData) => {
    updateHoliday(id, formData)
    setEditOpen(false)
  }

  const handleDelete = () => {
    if (!window.confirm(`Remove "${holiday.name}"? Its occasions won't be deleted.`)) return
    deleteHoliday(id)
    navigate('/holidays')
  }

  return (
    <div>
      <Link to="/holidays" className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground mb-6">
        <ArrowLeft size={14} /> Holidays
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{holiday.icon}</span>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{holiday.name}</h1>
            {!holiday.is_system && <Tag className="mt-1">Custom</Tag>}
          </div>
        </div>
        {!holiday.is_system && (
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => setEditOpen(true)}>
              <Pencil size={14} />
              Edit
            </Button>
            <Button variant="ghost" onClick={handleDelete}>
              <Trash2 size={14} />
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Default recipients */}
      <div className="mb-6 p-4 bg-surface border border-border rounded-md">
        <p className="text-xs text-muted uppercase tracking-wider mb-3">Default recipients</p>
        {recipients.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {recipients.map((r) => {
              const selected = defaultRecipientIds.has(r.id)
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => toggleRecipient(r.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm border transition-colors ${
                    selected
                      ? 'bg-accent/10 border-accent/40 text-foreground'
                      : 'bg-background border-border text-muted hover:border-accent/30'
                  }`}
                >
                  <span>{r.emoji}</span>
                  <span className={selected ? 'font-medium' : ''}>{r.name}</span>
                </button>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-muted">No recipients yet.</p>
        )}
      </div>

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

      {allOccasions.length === 0 && (
        <p className="text-sm text-muted">No occasions for this holiday yet.</p>
      )}

      {!holiday.is_system && (
        <SlidePanel isOpen={editOpen} onClose={() => setEditOpen(false)} title={`Edit holiday`}>
          <HolidayForm holiday={holiday} onSave={handleSave} onCancel={() => setEditOpen(false)} />
        </SlidePanel>
      )}
    </div>
  )
}

import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Pencil, Trash2, ChevronRight, Check } from 'lucide-react'
import { useData } from '../data/DataContext'
import { isUpcoming, dateParts, daysUntil, relativeDays, describeDateLogic } from '../data/helpers'
import Avatar from '../components/ui/Avatar'
import IconTile from '../components/ui/IconTile'
import Progress from '../components/ui/Progress'
import { BackLink, SectionHeader, NotFound } from '../components/ui/PageHeader'
import { useConfirm } from '../components/ui/ConfirmDialog'
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

  const confirm = useConfirm()
  const holiday = getHolidayById(id)
  const [editOpen, setEditOpen] = useState(false)

  if (!holiday) return <NotFound title="We couldn't find that date" backTo="/holidays" backLabel="Back to dates" />

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
    updateHoliday(id, formData, { success: 'Changes saved' })
    setEditOpen(false)
  }

  const handleDelete = async () => {
    const ok = await confirm({
      title: `Delete ${holiday.name}?`,
      body: "Its occasions and gifts stay on your calendar; they just won't repeat any more. This can't be undone.",
      confirmLabel: 'Delete date',
    })
    if (!ok) return
    deleteHoliday(id, { success: `${holiday.name} deleted` })
    navigate('/holidays')
  }

  const rule = describeDateLogic(holiday.date_logic)

  const OccasionLine = ({ o, past }) => {
    const { total, purchased } = getGiftProgress(o.id)
    const { month, day } = dateParts(o.date)
    const days = daysUntil(o.date)
    return (
      <Link
        to={`/occasions/${o.id}`}
        className="group flex items-center gap-4 px-5 py-4 hover:bg-sand/40 transition-colors"
      >
        <div className={`w-12 text-center shrink-0 ${past ? 'opacity-60' : ''}`}>
          <p className="text-[12px] font-semibold text-amber leading-none">{month}</p>
          <p className="font-display font-semibold text-[24px] leading-none mt-1 text-ink tracking-numeral">{day}</p>
        </div>
        <div className="min-w-0 flex-1">
          <p className={`font-display font-semibold text-[16px] ${past ? 'text-ink-soft' : 'text-ink'}`}>{o.name}</p>
          <p className="text-[13px] text-ink-faint mt-0.5">{relativeDays(days)}</p>
        </div>
        {!past && total > 0 && (
          <div className="hidden sm:block w-28">
            <p className="text-[12px] text-ink-soft text-right mb-1.5 tabular">{purchased}/{total} ready</p>
            <Progress value={purchased} total={total} />
          </div>
        )}
        <ChevronRight size={18} strokeWidth={1.75} className="text-ink-faint group-hover:text-ink shrink-0" />
      </Link>
    )
  }

  return (
    <div>
      <BackLink to="/holidays">Dates</BackLink>

      <header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between mb-10">
        <div className="flex items-center gap-4 min-w-0">
          <IconTile icon={holiday.icon} name={holiday.name} size="lg" />
          <div className="min-w-0">
            <h1 className="text-[30px] md:text-[36px] leading-[1.05] font-semibold text-ink">{holiday.name}</h1>
            <p className="text-ink-soft mt-2 flex items-center gap-2">
              {rule}
              {!holiday.is_system && <Tag>Your date</Tag>}
            </p>
          </div>
        </div>
        {!holiday.is_system && (
          <div className="flex items-center gap-1.5 shrink-0">
            <Button size="sm" variant="secondary" onClick={() => setEditOpen(true)}>
              <Pencil size={14} strokeWidth={1.75} />
              Edit
            </Button>
            <Button size="icon" variant="danger" onClick={handleDelete} aria-label="Delete date">
              <Trash2 size={17} strokeWidth={1.75} />
            </Button>
          </div>
        )}
      </header>

      {/* Default recipients */}
      <section className="mb-12">
        <SectionHeader title="Who you give to" />
        <p className="text-[14px] text-ink-soft -mt-2 mb-4">
          These people get a placeholder gift whenever you auto-create gifts for this date.
        </p>
        {recipients.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {recipients.map((r) => {
              const selected = defaultRecipientIds.has(r.id)
              return (
                <button
                  key={r.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleRecipient(r.id)}
                  className={`inline-flex items-center gap-2 h-11 pl-1.5 pr-4 rounded-full border text-[14px] font-medium transition-colors ${
                    selected
                      ? 'bg-ink border-ink text-paper'
                      : 'bg-card border-line-strong text-ink-soft hover:border-ink-faint hover:text-ink'
                  }`}
                >
                  <Avatar emoji={r.emoji} name={r.name} size="sm" className="!w-8 !h-8" />
                  {r.name}
                  {selected && <Check size={15} strokeWidth={2.25} className="text-marigold" />}
                </button>
              )
            })}
          </div>
        ) : (
          <p className="text-[14px] text-ink-faint">Add people first, then pick who you give to on this date.</p>
        )}
      </section>

      {upcomingOccasions.length > 0 && (
        <section className="mb-12">
          <SectionHeader title="Upcoming" count={upcomingOccasions.length} />
          <div className="card divide-y divide-line overflow-hidden">
            {upcomingOccasions.map((o) => (
              <OccasionLine key={o.id} o={o} />
            ))}
          </div>
        </section>
      )}

      {pastOccasions.length > 0 && (
        <section>
          <SectionHeader title="Past" count={pastOccasions.length} />
          <div className="rounded-xl border border-line divide-y divide-line overflow-hidden">
            {pastOccasions.map((o) => (
              <OccasionLine key={o.id} o={o} past />
            ))}
          </div>
        </section>
      )}

      {allOccasions.length === 0 && (
        <p className="text-[14px] text-ink-faint">No occasions for this date yet.</p>
      )}

      {!holiday.is_system && (
        <SlidePanel isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit date">
          <HolidayForm holiday={holiday} onSave={handleSave} onCancel={() => setEditOpen(false)} />
        </SlidePanel>
      )}
    </div>
  )
}

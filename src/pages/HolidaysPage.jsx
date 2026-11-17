import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Plus } from 'lucide-react'
import { useData } from '../data/DataContext'
import { daysUntil, formatShort, relativeDays } from '../data/helpers'
import IconTile from '../components/ui/IconTile'
import { AvatarStack } from '../components/ui/Avatar'
import PageHeader, { SectionHeader } from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import SlidePanel from '../components/ui/SlidePanel'
import HolidayForm from '../components/holidays/HolidayForm'

function HolidayRow({ holiday, defaultRecipients, next }) {
  const days = next ? daysUntil(next.date) : null
  return (
    <Link
      to={`/holidays/${holiday.id}`}
      className="group flex items-center gap-4 px-4 sm:px-5 py-4 hover:bg-sand/40 transition-colors"
    >
      <IconTile icon={holiday.icon} name={holiday.name} />
      <div className="min-w-0 flex-1">
        <p className="font-display font-semibold text-[16px] text-ink leading-snug truncate">{holiday.name}</p>
        <p className="text-[13px] text-ink-soft mt-1">
          {next ? (
            <>
              {formatShort(next.date)}
              <span className="text-ink-faint"> · {relativeDays(days).toLowerCase()}</span>
            </>
          ) : (
            <span className="text-ink-faint">No upcoming date</span>
          )}
        </p>
      </div>
      <div className="hidden sm:flex items-center gap-2 shrink-0">
        {defaultRecipients.length > 0 ? (
          <AvatarStack people={defaultRecipients} />
        ) : (
          <span className="text-[13px] text-ink-faint">No one by default</span>
        )}
      </div>
      <ChevronRight size={18} strokeWidth={1.75} className="text-ink-faint group-hover:text-ink transition-colors shrink-0" />
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
    const currentYearForMsg = new Date().getFullYear()
    const newHoliday = addHoliday(formData, {
      success: `${formData.name} added, with occasions through ${currentYearForMsg + 2}`,
    })
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

  const renderList = (list) => (
    <div className="card divide-y divide-line overflow-hidden">
      {list.map((h) => (
        <HolidayRow
          key={h.id}
          holiday={h}
          defaultRecipients={getDefaultRecipientsForHoliday(h.id)}
          next={getNextOccasionForHoliday(h.id)}
        />
      ))}
    </div>
  )

  return (
    <div>
      <PageHeader
        eyebrow="Dates"
        title="The dates that matter"
        description="Repeating dates become occasions automatically, three years ahead, with the right people already attached."
        actions={
          <Button onClick={() => setPanelOpen(true)}>
            <Plus size={17} strokeWidth={2} />
            Add a date
          </Button>
        }
      />

      {custom.length > 0 && (
        <section className="mb-12">
          <SectionHeader title="Your dates" count={custom.length} />
          {renderList(custom)}
        </section>
      )}

      <section>
        <SectionHeader title="Holidays" count={system.length} />
        {renderList(system)}
      </section>

      <SlidePanel isOpen={panelOpen} onClose={() => setPanelOpen(false)} title="New date">
        <HolidayForm onSave={handleSave} onCancel={() => setPanelOpen(false)} />
      </SlidePanel>
    </div>
  )
}

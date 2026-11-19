import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Plus } from 'lucide-react'
import { useData } from '../data/DataContext'
import { daysUntil, formatShort, relativeDays, upcomingHolidayDates, occasionsForHoliday } from '../data/helpers'
import { availableCatalogHolidays } from '../data/holidayCatalog'
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

// One row in the "add a holiday" list: what it is, when it next falls, and an Add button
function CatalogRow({ entry, onAdd }) {
  const next = upcomingHolidayDates(entry, 1)[0]
  return (
    <li className="flex items-center gap-3.5 py-3">
      <span className="w-10 shrink-0">
        <IconTile icon={entry.icon} name={entry.name} size="sm" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-ink leading-snug">{entry.name}</p>
        <p className="text-[13px] text-ink-faint mt-0.5">
          {entry.date_logic.label ?? (next ? 'Every year' : '')}
          {next && <> · next {formatShort(next.date)}</>}
        </p>
      </div>
      <Button size="sm" variant="secondary" type="button" onClick={() => onAdd(entry)} aria-label={`Add ${entry.name}`}>
        <Plus size={15} strokeWidth={2} />
        Add
      </Button>
    </li>
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

  const nextDate = (h) => upcomingHolidayDates(h, 1)[0]?.date ?? '9999'
  const available = availableCatalogHolidays(holidays)
    .filter((h) => upcomingHolidayDates(h, 1).length > 0)
    .sort((a, b) => nextDate(a).localeCompare(nextDate(b)))
  const FEATURED = ["Mother's Day", "Valentine's Day", "Father's Day", 'Thanksgiving']
  const teaser = [
    ...FEATURED.filter((n) => available.some((h) => h.name === n)),
    ...available.map((h) => h.name).filter((n) => !FEATURED.includes(n)),
  ].slice(0, 2)

  // Add a holiday plus occasions for its next three dates
  const createHoliday = (data) => {
    const dates = upcomingHolidayDates(data, 3)
    const through = dates.length ? dates[dates.length - 1].year : null
    const newHoliday = addHoliday(data, {
      success: through ? `${data.name} added, with occasions through ${through}` : `${data.name} added`,
    })
    occasionsForHoliday(newHoliday, occasions).forEach((o) => addOccasion(o))
    return newHoliday
  }

  const handleSave = (formData) => {
    createHoliday(formData)
    setPanelOpen(false)
  }

  // Panel stays open so several holidays can be added in a row
  const handleAddFromCatalog = (entry) => {
    createHoliday({ name: entry.name, icon: entry.icon, date_logic: entry.date_logic, is_system: true })
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
        {system.length > 0 ? (
          renderList(system)
        ) : (
          <p className="card px-5 py-6 text-ink-soft">No holidays yet.</p>
        )}
        {available.length > 0 && (
          <button
            type="button"
            onClick={() => setPanelOpen(true)}
            className="mt-3 inline-flex items-center gap-1.5 text-[14px] font-medium text-ink-soft hover:text-ink transition-colors"
          >
            <Plus size={15} strokeWidth={2} />
            {available.length > 2 ? `Add ${teaser.join(', ')} and more` : `Add ${teaser.join(' or ')}`}
          </button>
        )}
      </section>

      <SlidePanel isOpen={panelOpen} onClose={() => setPanelOpen(false)} title="Add a date">
        {available.length > 0 && (
          <section className="mb-8">
            <h3 className="field-label">Holidays</h3>
            <p className="text-[13px] text-ink-faint -mt-0.5 mb-1">
              Common gift-giving days. Dates that move, like Mother's Day, are worked out each year.
            </p>
            <ul className="divide-y divide-line">
              {available.map((entry) => (
                <CatalogRow key={entry.name} entry={entry} onAdd={handleAddFromCatalog} />
              ))}
            </ul>
          </section>
        )}
        <section>
          {available.length > 0 && (
            <>
              <h3 className="field-label">Your own date</h3>
              <p className="text-[13px] text-ink-faint -mt-0.5 mb-4">Birthdays, anniversaries, anything that repeats.</p>
            </>
          )}
          <HolidayForm onSave={handleSave} onCancel={() => setPanelOpen(false)} />
        </section>
      </SlidePanel>
    </div>
  )
}

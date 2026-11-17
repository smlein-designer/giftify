import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Plus, ShoppingBag, Truck, CalendarHeart, ArrowRight } from 'lucide-react'
import { useData } from '../data/DataContext'
import { daysUntil, formatDate, formatShort, dateParts, monthLabel, relativeDays } from '../data/helpers'
import Tag from '../components/ui/Tag'
import Glyph from '../lib/glyph'
import Button from '../components/ui/Button'
import Progress from '../components/ui/Progress'
import { AvatarStack } from '../components/ui/Avatar'
import PageHeader, { SectionHeader, EmptyState } from '../components/ui/PageHeader'
import SlidePanel from '../components/ui/SlidePanel'
import OccasionForm from '../components/occasions/OccasionForm'

function urgencyTone(days) {
  if (days <= 14) return 'text-amber'
  if (days <= 45) return 'text-ink'
  return 'text-ink-faint'
}

function DateBlock({ date, muted }) {
  const { month, day } = dateParts(date)
  return (
    <div className={`w-14 shrink-0 text-center ${muted ? 'opacity-60' : ''}`}>
      <p className="text-[12px] font-semibold text-amber leading-none">{month}</p>
      <p className="font-display font-semibold text-[28px] leading-none mt-1 text-ink tracking-numeral">{day}</p>
    </div>
  )
}

function useOccasionPeople(occasionId) {
  const { getGiftsForOccasion, getRecipientsForGift } = useData()
  const seen = new Map()
  getGiftsForOccasion(occasionId).forEach((g) =>
    getRecipientsForGift(g.id).forEach((r) => seen.set(r.id, r))
  )
  return [...seen.values()]
}

function NextUpHero({ occasion, holiday, progress }) {
  const days = daysUntil(occasion.date)
  const people = useOccasionPeople(occasion.id)
  const { total, purchased } = progress
  const shopDays = occasion.start_shopping_date ? daysUntil(occasion.start_shopping_date) : null

  return (
    <Link
      to={`/occasions/${occasion.id}`}
      className="group relative block overflow-hidden rounded-2xl bg-ink text-paper p-6 sm:p-8 mb-12 shadow-lift"
    >
      {/* soft decorative rings */}
      <span className="pointer-events-none absolute -right-24 -top-24 w-80 h-80 rounded-full border border-paper/10" />
      <span className="pointer-events-none absolute -right-10 -top-10 w-52 h-52 rounded-full border border-paper/10" />

      <div className="relative flex flex-col-reverse gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="inline-flex items-center gap-2 text-[13px] font-medium text-marigold">
            <span className="w-1.5 h-1.5 rounded-full bg-marigold" /> Next up
          </p>
          <h2 className="mt-3 text-[28px] sm:text-[34px] leading-[1.1] font-semibold flex items-start gap-3">
            <span className="mt-0.5 w-10 h-10 shrink-0 rounded-full border border-paper/20 text-marigold inline-flex items-center justify-center">
              <Glyph emoji={holiday?.icon ?? '📅'} name={holiday?.name ?? occasion.name} size={19} useName />
            </span>
            <span className="min-w-0 break-words">{occasion.name}</span>
          </h2>
          <p className="mt-2 text-paper/70">{formatDate(occasion.date)}</p>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            {occasion.start_shopping_date && (
              <span
                className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-[13px] font-medium ${
                  shopDays < 0 ? 'bg-marigold text-ink' : 'bg-paper/10 text-paper'
                }`}
              >
                <ShoppingBag size={14} strokeWidth={1.75} />
                {shopDays < 0 ? 'Time to shop' : `Shop by ${formatShort(occasion.start_shopping_date)}`}
              </span>
            )}
            {occasion.ship_date && (
              <span className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-[13px] font-medium bg-paper/10 text-paper">
                <Truck size={14} strokeWidth={1.75} />
                Ship by {formatShort(occasion.ship_date)}
              </span>
            )}
          </div>

          <div className="mt-6 flex items-center gap-4 max-w-md">
            {people.length > 0 && <AvatarStack people={people} />}
            <div className="flex-1">
              <div className="flex items-center justify-between text-[13px] text-paper/70 mb-1.5">
                <span>{total > 0 ? `${purchased} of ${total} gifts ready` : 'No gifts planned yet'}</span>
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
              </div>
              <Progress value={purchased} total={total} tone="light" />
            </div>
          </div>
        </div>

        <div className="sm:text-right shrink-0">
          <p className="font-display font-bold text-[72px] sm:text-[104px] leading-[0.85] tracking-numeral -ml-[0.04em]">
            {days}
          </p>
          <p className="text-[14px] text-paper/70 mt-2">{days === 1 ? 'day to go' : 'days to go'}</p>
        </div>
      </div>
    </Link>
  )
}

function OccasionRow({ occasion, holiday, progress, past }) {
  const { total, purchased } = progress
  const days = daysUntil(occasion.date)
  const shoppingDue =
    !past && occasion.start_shopping_date && daysUntil(occasion.start_shopping_date) < 0 && purchased < total

  return (
    <Link
      to={`/occasions/${occasion.id}`}
      className="group flex items-center gap-4 px-4 sm:px-5 py-4 hover:bg-sand/40 transition-colors"
    >
      <DateBlock date={occasion.date} muted={past} />
      <div className="w-px self-stretch bg-line" />
      <div className="min-w-0 flex-1">
        <p className={`flex items-center gap-2 font-display font-semibold text-[16px] leading-snug ${past ? 'text-ink-soft' : 'text-ink'}`}>
          <Glyph emoji={holiday?.icon ?? '📅'} name={holiday?.name ?? occasion.name} size={16} useName className="shrink-0 text-ink-faint" />
          <span className="truncate">{occasion.name}</span>
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[13px]">
          <span className={past ? 'text-ink-faint' : `font-medium ${urgencyTone(days)}`}>{relativeDays(days)}</span>
          {shoppingDue && <Tag variant="accent">Time to shop</Tag>}
          {!past && total === 0 && <span className="text-ink-faint">No gifts yet</span>}
        </div>
      </div>
      {!past && total > 0 && (
        <div className="hidden sm:block w-32 shrink-0">
          <p className="text-[12px] text-ink-soft text-right mb-1.5 tabular">
            {purchased}/{total} ready
          </p>
          <Progress value={purchased} total={total} />
        </div>
      )}
      {past && total > 0 && <Tag variant="success">{total} given</Tag>}
      <ChevronRight size={18} strokeWidth={1.75} className="text-ink-faint group-hover:text-ink transition-colors shrink-0" />
    </Link>
  )
}

function groupByMonth(list) {
  const groups = []
  list.forEach((o) => {
    const label = monthLabel(o.date)
    const last = groups[groups.length - 1]
    if (last && last.label === label) last.items.push(o)
    else groups.push({ label, items: [o] })
  })
  return groups
}

export default function OccasionsPage() {
  const { getUpcomingOccasions, getPastOccasions, getHolidayById, getGiftProgress, holidays, addOccasion } = useData()
  const [panelOpen, setPanelOpen] = useState(false)
  const [showAllPast, setShowAllPast] = useState(false)

  const upcoming = getUpcomingOccasions()
  const past = getPastOccasions()
  const [next, ...rest] = upcoming
  const openGifts = upcoming.reduce((n, o) => {
    const p = getGiftProgress(o.id)
    return n + (p.total - p.purchased)
  }, 0)

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  const handleSave = (formData) => {
    addOccasion(formData, { success: `${formData.name} added` })
    setPanelOpen(false)
  }

  const pastShown = showAllPast ? past : past.slice(0, 4)

  return (
    <div>
      <PageHeader
        eyebrow={today}
        title="Occasions"
        description={
          upcoming.length > 0
            ? `${upcoming.length} coming up${openGifts > 0 ? ` · ${openGifts} gift${openGifts === 1 ? '' : 's'} still to sort` : ''}`
            : undefined
        }
        actions={
          <Button onClick={() => setPanelOpen(true)}>
            <Plus size={17} strokeWidth={2} />
            Add occasion
          </Button>
        }
      />

      {next ? (
        <NextUpHero occasion={next} holiday={getHolidayById(next.holiday_id)} progress={getGiftProgress(next.id)} />
      ) : (
        <div className="mb-12">
          <EmptyState
            icon={CalendarHeart}
            title="Nothing on the calendar yet"
            action={
              <Link
                to="/holidays"
                className="inline-flex items-center gap-2 h-11 px-5 rounded-full border border-line-strong bg-card text-ink text-[14px] font-medium hover:border-ink-faint"
              >
                Add birthdays and anniversaries
                <ArrowRight size={16} strokeWidth={1.75} />
              </Link>
            }
          >
            Add the dates that repeat every year and Giftify will set up each occasion ahead of time.
          </EmptyState>
        </div>
      )}

      {rest.length > 0 && (
        <section className="mb-12">
          <SectionHeader title="Coming up" count={rest.length} />
          <div className="flex flex-col gap-6">
            {groupByMonth(rest).map((group) => (
              <div key={group.label}>
                <p className="text-[13px] font-medium text-ink-faint mb-2 ml-1">{group.label}</p>
                <div className="card divide-y divide-line overflow-hidden">
                  {group.items.map((o) => (
                    <OccasionRow
                      key={o.id}
                      occasion={o}
                      holiday={getHolidayById(o.holiday_id)}
                      progress={getGiftProgress(o.id)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section>
          <SectionHeader
            title="Past"
            count={past.length}
            action={
              past.length > 4 && (
                <button className="text-action" onClick={() => setShowAllPast((v) => !v)}>
                  {showAllPast ? 'Show less' : 'Show all'}
                </button>
              )
            }
          />
          <div className="rounded-xl border border-line divide-y divide-line overflow-hidden">
            {pastShown.map((o) => (
              <OccasionRow
                key={o.id}
                past
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

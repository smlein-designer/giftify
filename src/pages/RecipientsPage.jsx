import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Users } from 'lucide-react'
import { useData } from '../data/DataContext'
import { daysUntil, formatShort } from '../data/helpers'
import Button from '../components/ui/Button'
import Avatar from '../components/ui/Avatar'
import PageHeader, { SectionHeader, EmptyState } from '../components/ui/PageHeader'
import SlidePanel from '../components/ui/SlidePanel'
import RecipientForm from '../components/recipients/RecipientForm'

const isDone = (g) => g.physical_status === 'received' || g.experience_status === 'executed'

function PersonCard({ recipient }) {
  const { getGiftsForRecipient, getOccasionById } = useData()
  const gifts = getGiftsForRecipient(recipient.id)
  const given = gifts.filter(isDone).length

  // Soonest upcoming occasion this person has a gift planned for
  const nextOccasion = gifts
    .filter((g) => !isDone(g))
    .map((g) => getOccasionById(g.occasion_id))
    .filter((o) => o && daysUntil(o.date) >= 0)
    .sort((a, b) => daysUntil(a.date) - daysUntil(b.date))[0]

  return (
    <Link to={`/recipients/${recipient.id}`} className="card-link p-5 flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <Avatar emoji={recipient.emoji} name={recipient.name} size="lg" />
        {recipient.budget && (
          <span title={recipient.budget} className="max-w-[55%] truncate text-[13px] font-medium text-ink-soft tabular bg-sand rounded-full h-7 leading-7 px-3">
            {recipient.budget}
          </span>
        )}
      </div>
      <p className="font-display font-semibold text-[19px] text-ink mt-4 leading-tight">{recipient.name}</p>
      {recipient.gift_prompt && (
        <p className="text-[14px] text-ink-soft mt-1.5 line-clamp-2">{recipient.gift_prompt}</p>
      )}
      <div className="mt-auto pt-4">
        <div className="pt-3.5 border-t border-line flex items-center justify-between gap-2 text-[13px]">
          {nextOccasion ? (
            <span className="text-ink truncate">
              <span className="text-amber font-medium">Next:</span> {nextOccasion.name.replace(/ \d{4}$/, '')},{' '}
              {formatShort(nextOccasion.date)}
            </span>
          ) : (
            <span className="text-ink-faint">Nothing planned</span>
          )}
          <span className="text-ink-faint shrink-0 tabular">{given} given</span>
        </div>
      </div>
    </Link>
  )
}

export default function RecipientsPage() {
  const { recipients, addRecipient } = useData()
  const [panelOpen, setPanelOpen] = useState(false)

  const groups = [...new Set(recipients.map((r) => r.group_tag || 'Other'))]

  const handleSave = (formData) => {
    addRecipient(formData, { success: `${formData.name.trim()} added` })
    setPanelOpen(false)
  }

  return (
    <div>
      <PageHeader
        eyebrow="People"
        title="Who you give to"
        description={
          recipients.length > 0
            ? `${recipients.length} ${recipients.length === 1 ? 'person' : 'people'}, with their tastes, budgets and gift history.`
            : undefined
        }
        actions={
          <Button onClick={() => setPanelOpen(true)}>
            <Plus size={17} strokeWidth={2} />
            Add person
          </Button>
        }
      />

      {groups.map((group) => {
        const groupRecipients = recipients.filter((r) => (r.group_tag || 'Other') === group)
        return (
          <section key={group} className="mb-12">
            <SectionHeader title={group} count={groupRecipients.length} />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {groupRecipients.map((r) => (
                <PersonCard key={r.id} recipient={r} />
              ))}
            </div>
          </section>
        )
      })}

      {recipients.length === 0 && (
        <EmptyState icon={Users} title="Start with one person">
          Add the people (and pets) you shop for. A few notes about their tastes make gift ideas much better.
        </EmptyState>
      )}

      <SlidePanel isOpen={panelOpen} onClose={() => setPanelOpen(false)} title="New person">
        <RecipientForm onSave={handleSave} onCancel={() => setPanelOpen(false)} />
      </SlidePanel>
    </div>
  )
}

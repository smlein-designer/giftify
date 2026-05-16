import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Plus } from 'lucide-react'
import { useData } from '../data/DataContext'
import Tag from '../components/ui/Tag'
import Button from '../components/ui/Button'
import SlidePanel from '../components/ui/SlidePanel'
import RecipientForm from '../components/recipients/RecipientForm'

function RecipientRow({ recipient, giftCount }) {
  return (
    <Link
      to={`/recipients/${recipient.id}`}
      className="flex items-center justify-between p-4 bg-surface border border-border rounded-md hover:border-accent/40 transition-colors group"
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{recipient.emoji}</span>
        <div>
          <p className="font-bold text-foreground text-[16px]">{recipient.name}</p>
          <p className="text-sm text-muted mt-0.5">
            {recipient.budget || 'No budget set'} · {giftCount} gift{giftCount !== 1 ? 's' : ''} given
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <Tag>{recipient.group_tag}</Tag>
        <ChevronRight size={16} className="text-border group-hover:text-muted transition-colors" />
      </div>
    </Link>
  )
}

export default function RecipientsPage() {
  const { recipients, getGiftsForRecipient, addRecipient } = useData()
  const [panelOpen, setPanelOpen] = useState(false)

  const groups = [...new Set(recipients.map((r) => r.group_tag))]

  const handleSave = (formData) => {
    addRecipient(formData)
    setPanelOpen(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Recipients</h1>
        <Button variant="primary" onClick={() => setPanelOpen(true)}>
          <Plus size={16} />
          Add recipient
        </Button>
      </div>

      {groups.map((group) => {
        const groupRecipients = recipients.filter((r) => r.group_tag === group)
        return (
          <section key={group} className="mb-8">
            <h2 className="text-sm font-medium text-muted uppercase tracking-widest mb-3">{group}</h2>
            <div className="flex flex-col gap-2">
              {groupRecipients.map((r) => {
                const given = getGiftsForRecipient(r.id).filter(
                  (g) => g.physical_status === 'received' || g.experience_status === 'executed'
                ).length
                return <RecipientRow key={r.id} recipient={r} giftCount={given} />
              })}
            </div>
          </section>
        )
      })}

      {recipients.length === 0 && (
        <p className="text-muted text-sm">No recipients yet. Add someone to get started.</p>
      )}

      <SlidePanel isOpen={panelOpen} onClose={() => setPanelOpen(false)} title="New recipient">
        <RecipientForm onSave={handleSave} onCancel={() => setPanelOpen(false)} />
      </SlidePanel>
    </div>
  )
}

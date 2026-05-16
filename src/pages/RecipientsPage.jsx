import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { recipients, getGiftsForRecipient } from '../data/helpers'
import Tag from '../components/ui/Tag'

function RecipientRow({ recipient }) {
  const giftHistory = getGiftsForRecipient(recipient.id).filter(
    (g) => g.physical_status === 'received' || g.experience_status === 'executed'
  )

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
            {recipient.budget} · {giftHistory.length} gift{giftHistory.length !== 1 ? 's' : ''} given
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
  const groups = [...new Set(recipients.map((r) => r.group_tag))]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Recipients</h1>
      </div>

      {groups.map((group) => (
        <section key={group} className="mb-8">
          <h2 className="text-sm font-medium text-muted uppercase tracking-widest mb-3">{group}</h2>
          <div className="flex flex-col gap-2">
            {recipients
              .filter((r) => r.group_tag === group)
              .map((r) => (
                <RecipientRow key={r.id} recipient={r} />
              ))}
          </div>
        </section>
      ))}
    </div>
  )
}

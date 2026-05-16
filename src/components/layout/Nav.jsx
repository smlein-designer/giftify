import { NavLink } from 'react-router-dom'
import { CalendarDays, Users, ShoppingBag, Sparkles } from 'lucide-react'

const links = [
  { to: '/occasions', label: 'Occasions', icon: CalendarDays },
  { to: '/recipients', label: 'Recipients', icon: Users },
  { to: '/products', label: 'Products', icon: ShoppingBag },
  { to: '/holidays', label: 'Holidays', icon: Sparkles },
]

export default function Nav() {
  return (
    <header className="border-b border-border bg-background sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-6 flex items-center justify-between h-14">
        <span className="font-bold text-lg text-foreground tracking-tight">🎁 Giftify</span>
        <nav className="flex items-center gap-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-accent bg-accent/10'
                    : 'text-muted hover:text-foreground hover:bg-surface'
                }`
              }
            >
              <Icon size={15} />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}

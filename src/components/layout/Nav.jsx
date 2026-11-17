import { NavLink } from 'react-router-dom'
import { CalendarHeart, Users, Gift, CalendarDays, LogOut } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import Logo from '../ui/Logo'

export const links = [
  { to: '/occasions', label: 'Occasions', icon: CalendarHeart },
  { to: '/recipients', label: 'People', icon: Users },
  { to: '/products', label: 'Gift library', icon: Gift },
  { to: '/holidays', label: 'Dates', icon: CalendarDays },
]

// Desktop: fixed left rail
export function Sidebar() {
  return (
    <aside className="hidden md:flex fixed inset-y-0 left-0 w-64 flex-col px-5 py-7 border-r border-line bg-paper z-20">
      <Logo className="px-3 mb-10" />
      <nav className="flex flex-col gap-1" aria-label="Main">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `group flex items-center gap-3 h-11 px-3 rounded-full text-[15px] font-medium transition-colors ${
                isActive ? 'bg-ink text-paper' : 'text-ink-soft hover:text-ink hover:bg-sand/80'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={18} strokeWidth={1.75} className={isActive ? 'text-marigold' : ''} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto">
        <div className="rounded-xl bg-sand/70 px-4 py-4 mb-4">
          <p className="font-display font-semibold text-[14px] text-ink">Thoughtful, on time.</p>
          <p className="text-[13px] text-ink-soft mt-1">Every person, every occasion, in one place.</p>
        </div>
        <button
          onClick={() => supabase.auth.signOut()}
          className="flex items-center gap-3 h-10 px-3 w-full rounded-full text-[14px] font-medium text-ink-soft hover:text-ink hover:bg-sand/80 transition-colors"
        >
          <LogOut size={17} strokeWidth={1.75} />
          Sign out
        </button>
      </div>
    </aside>
  )
}

// Mobile: slim top bar + bottom tabs
export function MobileTopBar() {
  return (
    <header className="md:hidden sticky top-0 z-20 bg-paper/90 backdrop-blur border-b border-line">
      <div className="flex items-center justify-between h-14 px-5">
        <Logo size={26} />
        <button
          onClick={() => supabase.auth.signOut()}
          aria-label="Sign out"
          className="w-10 h-10 -mr-2 rounded-full inline-flex items-center justify-center text-ink-soft hover:text-ink hover:bg-sand"
        >
          <LogOut size={18} strokeWidth={1.75} />
        </button>
      </div>
    </header>
  )
}

export function MobileTabBar() {
  return (
    <nav
      aria-label="Main"
      className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-card/95 backdrop-blur border-t border-line pb-safe"
    >
      <div className="grid grid-cols-4 h-16">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors ${
                isActive ? 'text-ink' : 'text-ink-faint'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`h-8 w-14 rounded-full inline-flex items-center justify-center transition-colors ${
                    isActive ? 'bg-ink text-paper' : ''
                  }`}
                >
                  <Icon size={19} strokeWidth={1.75} />
                </span>
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export default function Nav() {
  return (
    <>
      <Sidebar />
      <MobileTopBar />
      <MobileTabBar />
    </>
  )
}

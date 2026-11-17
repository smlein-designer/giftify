import { Outlet, useLocation } from 'react-router-dom'
import Nav from './Nav'

export default function AppLayout() {
  const { pathname } = useLocation()
  return (
    <div className="min-h-screen bg-paper">
      <Nav />
      <main className="md:pl-64">
        <div key={pathname} className="max-w-[880px] mx-auto px-5 sm:px-8 pt-7 md:pt-14 pb-28 md:pb-20 animate-rise">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

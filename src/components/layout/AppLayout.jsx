import { Outlet } from 'react-router-dom'
import Nav from './Nav'

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="max-w-5xl mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}

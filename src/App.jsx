import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { DataProvider } from './data/DataContext'
import AppLayout from './components/layout/AppLayout'
import LoginPage from './pages/LoginPage'
import OccasionsPage from './pages/OccasionsPage'
import OccasionDetailPage from './pages/OccasionDetailPage'
import RecipientsPage from './pages/RecipientsPage'
import RecipientDetailPage from './pages/RecipientDetailPage'
import ProductsPage from './pages/ProductsPage'
import ProductDetailPage from './pages/ProductDetailPage'
import HolidaysPage from './pages/HolidaysPage'
import HolidayDetailPage from './pages/HolidayDetailPage'

export default function App() {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (session === undefined) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!session) {
    return <LoginPage />
  }

  return (
    <DataProvider userId={session.user.id}>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to="/occasions" replace />} />
            <Route path="/occasions" element={<OccasionsPage />} />
            <Route path="/occasions/:id" element={<OccasionDetailPage />} />
            <Route path="/recipients" element={<RecipientsPage />} />
            <Route path="/recipients/:id" element={<RecipientDetailPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/holidays" element={<HolidaysPage />} />
            <Route path="/holidays/:id" element={<HolidayDetailPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </DataProvider>
  )
}

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import OccasionsPage from './pages/OccasionsPage'
import OccasionDetailPage from './pages/OccasionDetailPage'
import RecipientsPage from './pages/RecipientsPage'
import RecipientDetailPage from './pages/RecipientDetailPage'
import ProductsPage from './pages/ProductsPage'
import ProductDetailPage from './pages/ProductDetailPage'
import HolidaysPage from './pages/HolidaysPage'
import HolidayDetailPage from './pages/HolidayDetailPage'

export default function App() {
  return (
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
  )
}

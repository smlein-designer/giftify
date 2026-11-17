import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/syne'
import '@fontsource-variable/hanken-grotesk'
import './index.css'
import App from './App'
import { ToastProvider } from './components/ui/Toast'
import { ConfirmProvider } from './components/ui/ConfirmDialog'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider>
      <ConfirmProvider>
        <App />
      </ConfirmProvider>
    </ToastProvider>
  </StrictMode>
)

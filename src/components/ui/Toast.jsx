import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, AlertCircle, X } from 'lucide-react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef({})

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current[id])
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const push = useCallback(
    (message, { tone = 'success', duration } = {}) => {
      const id = crypto.randomUUID()
      setToasts((prev) => {
        // don't stack identical messages
        if (prev.some((t) => t.message === message)) return prev
        return [...prev.slice(-2), { id, message, tone }]
      })
      timers.current[id] = setTimeout(() => dismiss(id), duration ?? (tone === 'error' ? 8000 : 3500))
      return id
    },
    [dismiss]
  )

  const api = useMemo(() => {
    const fn = (message, opts) => push(message, opts)
    fn.success = (message, opts) => push(message, { ...opts, tone: 'success' })
    fn.error = (message, opts) => push(message, { ...opts, tone: 'error' })
    fn.dismiss = dismiss
    return fn
  }, [push, dismiss])

  return (
    <ToastContext.Provider value={api}>
      {children}
      {createPortal(
        <div className="fixed inset-x-0 bottom-20 md:bottom-6 z-[70] flex flex-col items-center gap-2 px-4 pointer-events-none md:pl-64">
          {toasts.map((t) => (
            <div
              key={t.id}
              role={t.tone === 'error' ? 'alert' : 'status'}
              aria-live={t.tone === 'error' ? 'assertive' : 'polite'}
              className="pointer-events-auto flex items-start gap-3 max-w-md w-full sm:w-auto rounded-xl bg-ink text-paper pl-4 pr-2 py-3 shadow-lift animate-rise"
            >
              <span
                className={`mt-0.5 w-5 h-5 shrink-0 rounded-full inline-flex items-center justify-center ${
                  t.tone === 'error' ? 'bg-marigold text-ink' : 'bg-sage text-paper'
                }`}
              >
                {t.tone === 'error' ? <AlertCircle size={13} strokeWidth={2.25} /> : <Check size={12} strokeWidth={3} />}
              </span>
              <p className="text-[14px] leading-snug flex-1 py-px">{t.message}</p>
              <button
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss"
                className="w-7 h-7 -my-0.5 shrink-0 rounded-full inline-flex items-center justify-center text-paper/60 hover:text-paper hover:bg-paper/10"
              >
                <X size={15} strokeWidth={2} />
              </button>
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}

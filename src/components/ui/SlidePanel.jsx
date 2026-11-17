import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import useFocusTrap from '../../lib/useFocusTrap'

// On desktop, start in the first form field. On phones, start on the close
// button so the keyboard doesn't pop up over the sheet.
const firstField = (node) =>
  window.matchMedia('(min-width: 768px)').matches
    ? node.querySelector('[data-body] input:not([type="hidden"]):not([type="file"]), [data-body] textarea, [data-body] select')
    : null

export default function SlidePanel({ isOpen, onClose, title, subtitle, children }) {
  const ref = useRef(null)
  useFocusTrap(ref, isOpen, { onEscape: onClose, initialFocus: firstField })

  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [isOpen])

  if (!isOpen) return null

  return createPortal(
    <>
      <div className="fixed inset-0 bg-ink/30 backdrop-blur-[2px] z-40 animate-fade-in" onClick={onClose} />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
        className="fixed inset-y-0 right-0 w-full sm:max-w-[460px] sm:inset-y-2 sm:right-2 bg-paper sm:rounded-2xl shadow-sheet z-50 flex flex-col animate-sheet-in"
      >
        <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 shrink-0">
          <div>
            <h2 id="sheet-title" className="font-semibold text-ink text-[24px] leading-tight">
              {title}
            </h2>
            {subtitle && <p className="text-[14px] text-ink-soft mt-1">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="-mr-2 w-10 h-10 rounded-full inline-flex items-center justify-center text-ink-soft hover:text-ink hover:bg-sand transition-colors"
          >
            <X size={20} strokeWidth={1.75} />
          </button>
        </div>
        <div className="h-px bg-line mx-6" />
        <div data-body className="flex-1 overflow-y-auto px-6 py-6">
          {children}
        </div>
      </div>
    </>,
    document.body
  )
}

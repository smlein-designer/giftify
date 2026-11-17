import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AlertTriangle } from 'lucide-react'
import useFocusTrap from '../../lib/useFocusTrap'
import Button from './Button'

const ConfirmContext = createContext(null)

function Dialog({ title, body, confirmLabel = 'Delete', cancelLabel = 'Keep it', onResolve }) {
  const ref = useRef(null)
  const cancelRef = useRef(null)
  // Focus starts on the safe choice
  useFocusTrap(ref, true, { onEscape: () => onResolve(false), initialFocus: cancelRef })

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-[2px] animate-fade-in" onClick={() => onResolve(false)} />
      <div
        ref={ref}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-body"
        className="relative w-full max-w-[420px] rounded-2xl bg-paper shadow-sheet p-6 animate-rise"
      >
        <span className="w-11 h-11 rounded-full bg-amber-tint text-amber inline-flex items-center justify-center mb-4">
          <AlertTriangle size={20} strokeWidth={1.75} />
        </span>
        <h2 id="confirm-title" className="text-[22px] leading-tight font-semibold text-ink">
          {title}
        </h2>
        {body && (
          <p id="confirm-body" className="text-ink-soft mt-2">
            {body}
          </p>
        )}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-6">
          <Button ref={cancelRef} variant="secondary" onClick={() => onResolve(false)}>
            {cancelLabel}
          </Button>
          <Button variant="destructive" onClick={() => onResolve(true)}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null)

  const confirm = useCallback(
    (opts) =>
      new Promise((resolve) => {
        setState({
          ...opts,
          onResolve: (v) => {
            setState(null)
            resolve(v)
          },
        })
      }),
    []
  )

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state && <Dialog {...state} />}
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext)
  if (!ctx) throw new Error('useConfirm must be used inside ConfirmProvider')
  return ctx
}

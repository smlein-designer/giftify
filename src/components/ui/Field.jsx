import { cloneElement, useId } from 'react'
import { AlertCircle } from 'lucide-react'

// Label + control + hint/error, wired together for screen readers.
// Pass a single input/select/textarea as the child. If the control is wrapped
// (e.g. the $ price input), pass `controlId` and set id/aria props yourself.
export default function Field({ label, required, optional, error, hint, controlId, className = '', children }) {
  const autoId = useId()
  const id = controlId ?? autoId
  const errId = `${id}-error`
  const hintId = `${id}-hint`
  const describedBy = [error && errId, hint && hintId].filter(Boolean).join(' ') || undefined

  const control = controlId
    ? children
    : cloneElement(children, {
        id,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': describedBy,
        'aria-required': required || undefined,
      })

  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="field-label">
          {label}
          {required && <span className="text-amber"> *</span>}
          {optional && <span className="font-normal text-ink-faint"> (optional)</span>}
        </label>
      )}
      {control}
      {hint && !error && (
        <p id={hintId} className="text-[13px] text-ink-faint mt-1.5">
          {hint}
        </p>
      )}
      {error && (
        <p id={errId} className="flex items-start gap-1.5 text-[13px] text-danger mt-1.5">
          <AlertCircle size={14} strokeWidth={2} className="mt-[2px] shrink-0" />
          {error}
        </p>
      )}
    </div>
  )
}

// Helpers shared by the forms
export const isUrl = (v) => {
  try {
    const u = new URL(v)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}
export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

// Focus the first invalid control after errors render
export const focusFirstError = (formEl) =>
  requestAnimationFrame(() => formEl?.querySelector('[aria-invalid="true"]')?.focus())

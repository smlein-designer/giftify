import { useEffect } from 'react'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

// Keeps keyboard focus inside a dialog while it's open, closes on Escape,
// and returns focus to whatever opened it when it closes.
export default function useFocusTrap(ref, active, { onEscape, initialFocus } = {}) {
  useEffect(() => {
    if (!active || !ref.current) return
    const node = ref.current
    const opener = document.activeElement

    const items = () => [...node.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null)
    const preferred = typeof initialFocus === 'function' ? initialFocus(node) : initialFocus?.current
    const first = preferred || items()[0] || node
    // wait a frame so the dialog is painted before focusing
    const raf = requestAnimationFrame(() => first.focus({ preventScroll: true }))

    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onEscape?.()
        return
      }
      if (e.key !== 'Tab') return
      const list = items()
      if (list.length === 0) return e.preventDefault()
      const firstEl = list[0]
      const lastEl = list[list.length - 1]
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault()
        lastEl.focus()
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault()
        firstEl.focus()
      }
    }
    node.addEventListener('keydown', onKey)

    return () => {
      cancelAnimationFrame(raf)
      node.removeEventListener('keydown', onKey)
      if (opener && document.contains(opener)) opener.focus({ preventScroll: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])
}

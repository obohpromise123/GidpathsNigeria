import { X } from 'lucide-react'
import { useEffect, useId, useRef, type ReactNode } from 'react'
import { Button } from './Button'
import { cx } from './cx'

/** Accessible modal: traps Tab, closes on Escape, restores focus afterwards. */
export function Modal({
  open,
  title,
  onClose,
  children,
  wide = false,
}: {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  wide?: boolean
}) {
  const panel = useRef<HTMLDivElement>(null)
  const titleId = useId()
  // A ref, so a new onClose function each render does not re-run the effect (and steal focus).
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    if (!open) return
    const previous = document.activeElement as HTMLElement | null
    const focusables = () =>
      [...(panel.current?.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])') ?? [])].filter(
        (el) => !el.hasAttribute('disabled'),
      )
    // Focus the first form control if there is one, otherwise the first button.
    const first = focusables().find((el) => el.matches('input, select, textarea')) ?? focusables()[0]
    first?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current()
      if (e.key !== 'Tab') return
      const items = focusables()
      if (items.length === 0) return
      const [head, tail] = [items[0], items[items.length - 1]]
      if (e.shiftKey && document.activeElement === head) {
        e.preventDefault()
        tail.focus()
      } else if (!e.shiftKey && document.activeElement === tail) {
        e.preventDefault()
        head.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      previous?.focus()
    }
  }, [open])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-navy-950/50 p-0 sm:items-center sm:p-6">
      <div className="absolute inset-0" aria-hidden onClick={onClose} />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cx(
          'relative flex max-h-[92vh] w-full flex-col rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl',
          wide ? 'sm:max-w-3xl' : 'sm:max-w-md',
        )}
      >
        <div className="flex items-center justify-between gap-4 border-b border-sand-200 px-5 py-4 sm:px-6">
          <h2 id={titleId} className="text-lg">
            {title}
          </h2>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-slate-500 hover:bg-sand-100" aria-label="Close">
            <X aria-hidden className="size-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
      </div>
    </div>
  )
}

export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel = 'Confirm',
  danger = false,
  busy = false,
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  children: ReactNode
  confirmLabel?: string
  danger?: boolean
  busy?: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <Modal open={open} title={title} onClose={onCancel}>
      <div className="text-slate-700">{children}</div>
      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm} loading={busy}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}

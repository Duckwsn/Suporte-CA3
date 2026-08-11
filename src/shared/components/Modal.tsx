import type { ReactNode } from 'react'

export interface ModalProps {
  open: boolean
  title?: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  width?: string
}

export function Modal({ open, title, onClose, children, footer, width = 'max-w-lg' }: ModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div
        className={`relative w-full ${width} animate-scale-up rounded-xl bg-bg-modal shadow-xl`}
        style={{ boxShadow: 'var(--shadow-xl)' }}
      >
        <div className="flex items-center justify-between border-b border-color-border-light px-5 py-4">
          <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-soft hover:bg-bg-subtle hover:text-text-primary"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-color-border-light px-5 py-4">{footer}</div>}
      </div>
    </div>
  )
}

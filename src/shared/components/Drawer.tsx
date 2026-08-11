import type { ReactNode } from 'react'

export interface DrawerProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  width?: string
}

export function Drawer({ open, onClose, title, children, width = 'w-96' }: DrawerProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-modal" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div className={`absolute inset-y-0 right-0 ${width} animate-scale-up bg-bg-surface shadow-xl`} style={{ boxShadow: 'var(--shadow-xl)' }}>
        <div className="flex items-center justify-between border-b border-color-border-light px-5 py-4">
          <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
          <button onClick={onClose} className="rounded-md p-1 text-muted-soft hover:bg-bg-subtle hover:text-text-primary" aria-label="Fechar">
            ✕
          </button>
        </div>
        <div className="h-[calc(100%-4rem)] overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>
  )
}

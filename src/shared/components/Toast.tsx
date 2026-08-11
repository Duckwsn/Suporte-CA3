import { useUiStore } from '@/stores/uiStore'
import { CheckCircle2, Info, XCircle } from 'lucide-react'

const icons = {
  success: <CheckCircle2 className="size-5 text-success" />,
  error: <XCircle className="size-5 text-danger" />,
  info: <Info className="size-5 text-info" />,
}

export function ToastContainer() {
  const toasts = useUiStore((s) => s.toasts)
  const removeToast = useUiStore((s) => s.removeToast)

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-toast flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="flex items-center gap-3 rounded-lg bg-bg-surface border border-color-card-border px-4 py-3 shadow-lg animate-scale-up"
          style={{ boxShadow: 'var(--shadow-lg)' }}
        >
          {icons[toast.type]}
          <span className="text-sm text-text-primary">{toast.message}</span>
          <button onClick={() => removeToast(toast.id)} className="ml-2 text-muted-soft hover:text-text-primary" aria-label="Fechar">
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}

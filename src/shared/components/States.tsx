export function LoadingState({ label = 'Carregando...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-text-secondary">
      <span className="size-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      <span className="text-sm">{label}</span>
    </div>
  )
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 py-16 text-center">
      <p className="text-sm font-medium text-text-primary">{title}</p>
      {description && <p className="text-sm text-text-secondary">{description}</p>}
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <p className="text-sm text-danger">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="text-sm font-medium text-info hover:underline">
          Tentar novamente
        </button>
      )}
    </div>
  )
}

export function Skeleton({ className = 'h-4' }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-gray-200 ${className}`} />
}

export interface ProgressBarProps {
  value: number
  max?: number
  label?: string
}

export function ProgressBar({ value, max = 100, label }: ProgressBarProps) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div className="w-full">
      {label && <p className="mb-1 text-xs text-text-secondary">{label}</p>}
      <div className="h-2 w-full overflow-hidden rounded-full bg-progress-track">
        <div className="h-full rounded-full bg-progress-fill transition-all duration-300" style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}

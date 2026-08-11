import type { ReactNode } from 'react'

export interface KpiCardProps {
  label: string
  value: ReactNode
  hint?: string
  tone?: 'default' | 'success' | 'warning' | 'danger'
}

const toneColors: Record<string, string> = {
  default: 'text-text-primary',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
}

export function KpiCard({ label, value, hint, tone = 'default' }: KpiCardProps) {
  return (
    <div className="rounded-lg border border-color-card-border bg-bg-card p-5" style={{ boxShadow: 'var(--color-card-shadow)' }}>
      <p className="text-sm text-text-secondary">{label}</p>
      <p className={`mt-2 text-number ${toneColors[tone]}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-soft">{hint}</p>}
    </div>
  )
}

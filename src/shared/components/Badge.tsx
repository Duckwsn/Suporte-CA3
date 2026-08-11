import type { HTMLAttributes } from 'react'

export type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'brand'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone
}

const tones: Record<BadgeTone, string> = {
  neutral: 'bg-neutral-bg text-neutral',
  success: 'bg-success-bg text-success',
  warning: 'bg-warning-bg text-warning',
  danger: 'bg-danger-bg text-danger',
  info: 'bg-info-bg text-info',
  brand: 'bg-brand-soft text-brand-ink',
}

export function Badge({ tone = 'neutral', className = '', children, ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]} ${className}`}
      {...props}
    >
      {children}
    </span>
  )
}

export function priorityTone(priority: string): BadgeTone {
  switch (priority) {
    case 'URGENTE':
      return 'danger'
    case 'ALTA':
      return 'warning'
    case 'MEDIA':
      return 'info'
    default:
      return 'neutral'
  }
}

export function statusTone(status: string): BadgeTone {
  switch (status) {
    case 'RESOLVIDO':
    case 'FECHADO':
      return 'success'
    case 'EM_ATENDIMENTO':
      return 'info'
    case 'AGUARDANDO_CLIENTE':
      return 'warning'
    case 'ABERTO':
    case 'AGUARDANDO_ATENDENTE':
      return 'brand'
    default:
      return 'neutral'
  }
}

import type { HTMLAttributes } from 'react'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: boolean
}

export function Card({ padding = true, className = '', children, ...props }: CardProps) {
  return (
    <div
      className={`bg-bg-card border border-color-card-border rounded-lg ${padding ? 'p-5' : ''} ${className}`}
      style={{ boxShadow: 'var(--color-card-shadow)' }}
      {...props}
    >
      {children}
    </div>
  )
}

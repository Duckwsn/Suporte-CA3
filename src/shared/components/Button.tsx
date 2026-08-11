import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors duration-150 disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none'

const variants: Record<string, string> = {
  primary: 'bg-brand text-brand-ink hover:bg-brand-hover',
  secondary: 'bg-white border border-color-border-light text-text-primary hover:bg-bg-subtle',
  ghost: 'bg-transparent text-text-secondary hover:bg-bg-subtle hover:text-text-primary',
  danger: 'bg-danger text-white hover:bg-danger/80',
}

const sizes: Record<string, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, className = '', children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
      {children}
    </button>
  ),
)

Button.displayName = 'Button'

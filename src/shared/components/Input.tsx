import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, className = '', id, ...props }, ref) => {
  const inputId = id ?? `input-${label?.replace(/\s+/g, '-').toLowerCase()}`
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-text-primary">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={`h-10 w-full rounded-md border border-color-border-light bg-bg-input px-3 text-sm text-text-primary placeholder:text-muted-soft focus:border-focus-ring focus:outline-none ${error ? 'border-danger' : ''} ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  )
})

Input.displayName = 'Input'

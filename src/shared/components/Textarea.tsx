import { forwardRef } from 'react'
import type { TextareaHTMLAttributes } from 'react'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const inputId = id ?? `textarea-${label?.replace(/\s+/g, '-').toLowerCase()}`
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-text-primary">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={`w-full rounded-md border border-color-border-light bg-bg-input px-3 py-2 text-sm text-text-primary placeholder:text-muted-soft focus:border-focus-ring focus:outline-none ${error ? 'border-danger' : ''} ${className}`}
          {...props}
        />
        {error && <span className="text-xs text-danger">{error}</span>}
      </div>
    )
  },
)

Textarea.displayName = 'Textarea'

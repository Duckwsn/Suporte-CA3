import { forwardRef } from 'react'
import type { SelectHTMLAttributes } from 'react'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: SelectOption[]
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, className = '', id, ...props }, ref) => {
    const selectId = id ?? `select-${label?.replace(/\s+/g, '-').toLowerCase()}`
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-text-primary">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`h-10 w-full rounded-md border border-color-border-light bg-bg-input px-3 text-sm text-text-primary focus:border-focus-ring focus:outline-none ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    )
  },
)

Select.displayName = 'Select'

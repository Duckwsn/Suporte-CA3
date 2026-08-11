import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ checked, onChange, label, ...props }, ref) => {
    return (
      <label className="flex cursor-pointer items-center gap-2">
        <span className="relative inline-flex">
          <input
            ref={ref}
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className="peer sr-only"
            {...props}
          />
          <span className="h-6 w-11 rounded-full bg-gray-300 transition-colors peer-checked:bg-brand peer-focus-visible:outline-2 peer-focus-visible:outline-focus-ring" />
          <span className="absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
        </span>
        {label && <span className="text-sm text-text-primary">{label}</span>}
      </label>
    )
  },
)

Switch.displayName = 'Switch'

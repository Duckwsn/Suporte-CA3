import { initials } from '@/utils/labels'

export interface AvatarProps {
  name: string
  size?: 'sm' | 'md' | 'lg'
  colorIndex?: number
}

const sizes = {
  sm: 'size-6 text-[10px]',
  md: 'size-9 text-sm',
  lg: 'size-12 text-base',
}

const colors = ['#e07b39', '#2563eb', '#7c3aed', '#059669']

export function Avatar({ name, size = 'md', colorIndex = 0 }: AvatarProps) {
  const color = colors[colorIndex % colors.length]
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${sizes[size]}`}
      style={{ backgroundColor: color }}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  )
}

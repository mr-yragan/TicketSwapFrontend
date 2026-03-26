import * as React from 'react'
import { cn } from '@/lib/utils'

export function Switch({ checked, onChange, className }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'inline-flex items-center rounded-full p-1 transition-colors',
        checked ? 'bg-black' : 'bg-gray-200',
        className
      )}
    >
      <span className={cn('inline-block w-4 h-4 bg-white rounded-full transform transition-transform', checked ? 'translate-x-3' : 'translate-x-0')}></span>
    </button>
  )
}

export default Switch

import * as React from 'react'
import { cn } from '@/lib/utils'

export const Input = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn('w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent', className)}
      {...props}
    />
  )
})
Input.displayName = 'Input'

export default Input

import * as React from "react"
import { cn } from "@/lib/utils"

const Button = React.forwardRef(({ className, ...props }, ref) =>
  <button
    className={cn('inline-flex items-center justify-center whitespace-nowrap rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:opacity-50 px-6 py-2.5 h-11', className)}
    ref={ref}
    {...props}/>
)
Button.displayName = "Button"

export { Button }

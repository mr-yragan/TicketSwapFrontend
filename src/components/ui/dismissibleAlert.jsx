import { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function DismissibleAlert({ children, className, onDismiss, tone = 'info' }) {
  useEffect(() => {
    if (!onDismiss) return undefined

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onDismiss()
      }
    }

    document.addEventListener('keydown', handleEscape, true)
    return () => document.removeEventListener('keydown', handleEscape, true)
  }, [onDismiss])

  if (!children) {
    return null
  }

  const toneClassName = tone === 'error'
    ? 'border-red-300 bg-red-50 text-red-700'
    : tone === 'success'
      ? 'border-green-300 bg-green-50 text-green-800'
      : 'border-blue-300 bg-blue-50 text-blue-800'

  return (
    <div className={cn('mb-4 flex items-start justify-between gap-3 rounded-lg border p-3 text-sm', toneClassName, className)}>
      <div className="min-w-0 font-medium">{children}</div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Закрыть уведомление"
          className="shrink-0 rounded p-0.5 opacity-70 transition-opacity hover:opacity-100">
          <X size={16} />
        </button>
      )}
    </div>
  )
}

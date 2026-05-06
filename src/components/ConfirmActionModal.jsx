import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui'
import { useModal } from '@/context'

// Единое подтверждающие модальное окно для всех опасных или дорогих по смыслу действий в приложении.
// В основном изменить удалить купить и т.д.

export function ConfirmActionModal() {
  const { confirmation, resolveConfirmation } = useModal()

  useEffect(() => {
    if (!confirmation) {
      return undefined
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape' && !event.defaultPrevented) {
        resolveConfirmation(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [confirmation, resolveConfirmation])

  if (!confirmation) {
    return null
  }

  const confirmButtonClassName = confirmation.tone === 'success'
      ? 'bg-green-600 text-white hover:bg-green-700'
    : confirmation.tone === 'primary'
      ? 'bg-black text-white hover:bg-gray-800'
      : 'bg-red-600 text-white hover:bg-red-700'

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/55 p-4">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-action-title"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
            <AlertTriangle size={20} />
          </div>
          <div className="min-w-0">
            <h2 id="confirm-action-title" className="text-lg font-semibold text-gray-950">
              {confirmation.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              {confirmation.message}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            onClick={() => resolveConfirmation(false)}
            className="border border-gray-300 bg-white text-black hover:bg-gray-50"
          >
            {confirmation.cancelLabel}
          </Button>
          <Button
            type="button"
            onClick={() => resolveConfirmation(true)}
            className={confirmButtonClassName}
          >
            {confirmation.confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

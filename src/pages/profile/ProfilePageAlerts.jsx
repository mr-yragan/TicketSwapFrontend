import { DismissibleAlert } from '@/components/ui'

export function ProfilePageAlerts({ successMessage, onClearSuccess, error, onClearError }) {
  return (
    <>
      {successMessage && (
        <DismissibleAlert tone="success" className="mb-4 p-4" onDismiss={onClearSuccess}>
          {successMessage}
        </DismissibleAlert>
      )}

      {error && (
        <DismissibleAlert tone="error" className="mb-4 p-4" onDismiss={onClearError}>
          {error}
        </DismissibleAlert>
      )}
    </>
  )
}

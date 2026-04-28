import { DismissibleAlert } from '@/components/ui'

export function AdminStatusMessage({ status, onDismiss }) {
  if (!status || status.type === 'idle') {
    return null
  }

  return (
    <DismissibleAlert
      tone={status.type === 'success' ? 'success' : 'error'}
      className="mb-5 p-4"
      onDismiss={onDismiss}
    >
      {status.message}
    </DismissibleAlert>
  )
}

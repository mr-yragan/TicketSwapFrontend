import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui'

export function OrganizerPageHeader({ loading, organizerName, userEmail, onRefresh }) {
  return (
    <div className="mb-6 flex flex-col gap-3 border-b border-gray-200 pb-5 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-gray-950">Панель организатора</h1>
        <p className="mt-1 text-sm text-gray-600">{organizerName || userEmail}</p>
      </div>
      <Button
        type="button"
        onClick={onRefresh}
        disabled={loading}
        className="bg-white text-black border border-gray-300 gap-2">
        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        Обновить
      </Button>
    </div>
  )
}

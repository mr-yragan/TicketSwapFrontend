import { Loader2, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui'
import { formatDateTime } from '../utils'

export function OrganizerEventsList({ canMutate, eventAction, events, onDelete, onEdit }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-5 py-4">
        <h2 className="text-lg font-semibold text-gray-950">Мои мероприятия</h2>
        <p className="text-sm text-gray-500">Удаление запрещается бэком, если к событию уже привязаны билеты.</p>
      </div>

      <div className="divide-y divide-gray-100">
        {events.length === 0 && (
          <div className="px-5 py-10 text-center text-gray-500">Мероприятий пока нет</div>
        )}

        {events.map((eventItem) => (
          <EventRow
            canMutate={canMutate}
            eventAction={eventAction}
            eventItem={eventItem}
            key={eventItem.id}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        ))}
      </div>
    </div>
  )
}

function EventRow({ canMutate, eventAction, eventItem, onDelete, onEdit }) {
  return (
    <div className="flex flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-medium text-gray-950">{eventItem.name}</h3>
          <span className="rounded-full border border-gray-200 px-2 py-0.5 text-xs text-gray-600">{eventItem.eventId}</span>
        </div>
        <div className="mt-1 text-sm text-gray-600">{formatDateTime(eventItem.startsAt)}</div>
        <div className="mt-1 text-sm text-gray-500">
          {eventItem.venue?.name || '-'}{eventItem.venue?.address ? `, ${eventItem.venue.address}` : ''}
        </div>
      </div>

      <div className="flex shrink-0 gap-2">
        <Button
          type="button"
          title="Редактировать событие"
          onClick={() => onEdit(eventItem)}
          disabled={!canMutate || Boolean(eventAction)}
          className="h-10 bg-white text-black border border-gray-300 px-3 gap-2">
          <Pencil size={16} />
          Изменить
        </Button>
        <Button
          type="button"
          title="Удалить событие"
          onClick={() => onDelete(eventItem)}
          disabled={!canMutate || Boolean(eventAction)}
          className="h-10 bg-white text-black border border-gray-300 px-3 gap-2">
          {eventAction === `delete-${eventItem.id}` ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
          Удалить
        </Button>
      </div>
    </div>
  )
}

import { CalendarClock, Loader2, Pencil, Plus, X } from 'lucide-react'
import { Button, Input } from '@/components/ui'

export function OrganizerEventForm({
  canMutate,
  editingEventId,
  eventAction,
  form,
  onCancel,
  onChange,
  onSubmit,
}) {
  const saveActionId = editingEventId ? `update-${editingEventId}` : 'create'

  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit()
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="mb-4 flex items-center gap-2">
        <CalendarClock size={20} />
        <h2 className="text-lg font-semibold text-gray-950">{editingEventId ? 'Редактировать событие' : 'Новое событие'}</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <EventInput label="Код события" value={form.eventId} onChange={(value) => onChange('eventId', value)} disabled={!canMutate} required />
        <EventInput label="Название" value={form.name} onChange={(value) => onChange('name', value)} disabled={!canMutate} required />
        <EventInput label="Дата и время" type="datetime-local" value={form.startsAt} onChange={(value) => onChange('startsAt', value)} disabled={!canMutate} required />
        <EventInput label="Площадка" value={form.venueName} onChange={(value) => onChange('venueName', value)} disabled={!canMutate} required />
        <EventInput label="Адрес" value={form.venueAddress} onChange={(value) => onChange('venueAddress', value)} disabled={!canMutate} required />
        <EventInput label="Часовой пояс" value={form.timezone} onChange={(value) => onChange('timezone', value)} disabled={!canMutate} required />

        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={!canMutate || Boolean(eventAction)}
            className="bg-black text-white gap-2">
            {eventAction === saveActionId ? (
              <Loader2 size={18} className="animate-spin" />
            ) : editingEventId ? (
              <Pencil size={18} />
            ) : (
              <Plus size={18} />
            )}
            {editingEventId ? 'Сохранить' : 'Создать'}
          </Button>

          {editingEventId && (
            <Button
              type="button"
              onClick={onCancel}
              className="bg-white text-black border border-gray-300 gap-2">
              <X size={18} />
              Отмена
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}

function EventInput({ label, value, onChange, type = 'text', disabled, required }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>
      <Input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        required={required}
      />
    </label>
  )
}

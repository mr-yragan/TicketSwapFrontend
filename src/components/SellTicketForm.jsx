import { useEffect, useMemo, useState } from 'react'
import { organizerApi } from '@/api'
import { useAuth } from '@/context'
import { useTicketsRefresh } from '@/context'
import { DismissibleAlert } from '@/components/ui'
import { FormInput } from './FormInput'
import { useSellForm } from '@/hooks/useSellForm'
import { useOrganizerCatalog } from '@/features/organizer/hooks/useOrganizerCatalog'

const toDateTimeInput = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return localDate.toISOString().slice(0, 16)
}

const formatMode = (mode) => {
  if (mode === 'MANUAL') return 'ручная проверка'
  if (mode === 'EXTERNAL_API') return 'внешний API'
  return mode || 'тип не указан'
}

export default function SellTicketForm({ onSuccess } = {}) {
  const { token } = useAuth()
  const { triggerRefresh } = useTicketsRefresh()
  const { form, files, loading, error, success, handleFieldChange, handleFilesChange, handleSubmit, setError, setSuccess, constants } = useSellForm(onSuccess)
  const { clearError: clearCatalogError, error: catalogError, loading: organizersLoading, organizers } = useOrganizerCatalog()
  const [eventQuery, setEventQuery] = useState('')
  const [eventResults, setEventResults] = useState([])
  const [eventSearchLoading, setEventSearchLoading] = useState(false)

  const selectedOrganizer = useMemo(() => {
    return organizers.find((organizer) => String(organizer.id) === String(form.organizerId))
  }, [organizers, form.organizerId])

  useEffect(() => {
    const query = eventQuery.trim()

    if (query.length < 2) {
      setEventResults([])
      setEventSearchLoading(false)
      return
    }

    let cancelled = false
    const timer = setTimeout(async () => {
      setEventSearchLoading(true)
      try {
        const data = await organizerApi.searchEvents({
          query,
          organizerId: form.organizerId || undefined,
          limit: 8,
        })

        if (!cancelled) {
          setEventResults(Array.isArray(data) ? data : [])
        }
      } catch {
        if (!cancelled) {
          setEventResults([])
        }
      } finally {
        if (!cancelled) {
          setEventSearchLoading(false)
        }
      }
    }, 300)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [eventQuery, form.organizerId])

  const handleOrganizerChange = (value) => {
    const organizer = organizers.find((item) => String(item.id) === String(value))
    handleFieldChange('organizerId', value)
    handleFieldChange('organizerName', organizer?.name || '')
    handleFieldChange('selectedEventId', '')
    handleFieldChange('eventId', '')
    setEventResults([])
  }

  const handleManualEventChange = (field, value) => {
    if (form.selectedEventId) {
      handleFieldChange('selectedEventId', '')
      handleFieldChange('eventId', '')
    }
    handleFieldChange(field, value)
  }

  const handleSelectEvent = (eventItem) => {
    const defaults = eventItem.listingDefaults || {}
    handleFieldChange('selectedEventId', defaults.selectedEventId || eventItem.id || '')
    handleFieldChange('eventName', defaults.eventName || eventItem.name || '')
    handleFieldChange('eventDate', toDateTimeInput(defaults.startsAt || eventItem.startsAt))
    handleFieldChange('venue', defaults.venue || [eventItem.venue?.name, eventItem.venue?.address].filter(Boolean).join(', '))
    handleFieldChange('organizerId', defaults.organizerId || eventItem.organizer?.id || '')
    handleFieldChange('organizerName', defaults.organizerName || eventItem.organizer?.name || '')
    handleFieldChange('eventId', defaults.eventId || eventItem.eventId || '')
    setEventQuery(defaults.eventName || eventItem.name || '')
    setEventResults([])
  }

  return (
    <div className="max-w-xl w-full bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Продать билет</h3>
      {!token && (
        <div className="mb-4 text-sm text-yellow-700 bg-yellow-50 p-3 rounded">
          Чтобы создать заявку, войдите в аккаунт
        </div>
      )}
      {catalogError && (
        <DismissibleAlert tone="error" onDismiss={clearCatalogError}>{catalogError}</DismissibleAlert>
      )}
      {error && (
        <DismissibleAlert tone="error" onDismiss={() => setError(null)}>{error}</DismissibleAlert>
      )}
      {success && (
        <DismissibleAlert tone="success" onDismiss={() => setSuccess(null)}>{success}</DismissibleAlert>
      )}
      <form onSubmit={(event) => handleSubmit(event, token, triggerRefresh)} className="flex flex-col gap-3">
        <FormInput
          label="ID билета (необязательно)"
          value={form.uid}
          onChange={(event) => handleFieldChange('uid', event.target.value)}
          placeholder="Оставьте пустым для автогенерации"
        />

        <label className="text-sm text-gray-700 font-medium">Организатор *</label>
        <select
          value={form.organizerId}
          onChange={(event) => handleOrganizerChange(event.target.value)}
          required
          disabled={organizersLoading}
          className="border rounded px-3 py-2 text-sm w-full">
          <option value="">{organizersLoading ? 'Загрузка...' : 'Выберите организатора'}</option>
          {organizers.map((organizer) => (
            <option key={organizer.id} value={organizer.id}>
              {organizer.name} · {formatMode(organizer.verificationMode)}
            </option>
          ))}
        </select>

        {selectedOrganizer && (
          <div className="text-xs text-gray-500">
            Выбран организатор: {selectedOrganizer.name}, {formatMode(selectedOrganizer.verificationMode)}.
          </div>
        )}

        <div className="relative">
          <label className="text-sm text-gray-700 font-medium block mb-1">Поиск события</label>
          <input
            type="search"
            value={eventQuery}
            onChange={(event) => setEventQuery(event.target.value)}
            placeholder="Начните вводить название события"
            className="border rounded px-3 py-2 text-sm w-full"
          />
          {eventSearchLoading && (
            <div className="mt-1 text-xs text-gray-500">Ищем события...</div>
          )}
          {eventResults.length > 0 && (
            <div className="mt-2 max-h-56 overflow-y-auto rounded-lg border border-gray-200 bg-white">
              {eventResults.map((eventItem) => (
                <button
                  type="button"
                  key={eventItem.id}
                  onClick={() => handleSelectEvent(eventItem)}
                  className="block w-full border-b border-gray-100 px-3 py-2 text-left text-sm last:border-b-0 hover:bg-gray-50">
                  <span className="block font-medium text-gray-950">{eventItem.name}</span>
                  <span className="block text-xs text-gray-500">
                    {eventItem.organizer?.name || 'Организатор'} · {eventItem.venue?.name || 'Площадка'} · {eventItem.date || ''}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {form.selectedEventId && (
          <div className="text-xs text-green-700 bg-green-50 border border-green-100 rounded p-2">
            Событие выбрано из базы. Данные будут связаны с мероприятием организатора.
          </div>
        )}

        <FormInput
          label="Название события *"
          value={form.eventName}
          onChange={(event) => handleManualEventChange('eventName', event.target.value)}
          placeholder="Например: Концерт Imagine Dragons"
          required
        />
        <FormInput
          label="Место проведения *"
          value={form.venue}
          onChange={(event) => handleManualEventChange('venue', event.target.value)}
          placeholder="Например: Олимпийский стадион"
          required
        />
        <FormInput
          label="Дата и время события *"
          type="datetime-local"
          value={form.eventDate}
          onChange={(event) => handleManualEventChange('eventDate', event.target.value)}
        />
        <FormInput
          label="Цена билета (₽) *"
          type="number"
          value={form.price}
          onChange={(event) => handleFieldChange('price', event.target.value)}
          placeholder="5000"
          inputMode="decimal"
          required
        />
        <FormInput
          label="Дополнительная информация (необязательно)"
          value={form.additionalInfo}
          onChange={(event) => handleFieldChange('additionalInfo', event.target.value)}
          placeholder="Ряд, место, сектор и т.д."
          rows={3}
          maxLength={constants.MAX_TEXT_LENGTH}
        />
        <FormInput
          label="Комментарий продавца (необязательно)"
          value={form.sellerComment}
          onChange={(event) => handleFieldChange('sellerComment', event.target.value)}
          placeholder="Причина продажи, особенности и т.д."
          rows={2}
          maxLength={constants.MAX_TEXT_LENGTH}
        />

        <div className="border-t pt-3">
          <label className="text-sm text-gray-700 block mb-2">Загрузить файл билета *</label>
          <p className="text-xs text-gray-500 mb-2">Допустимые форматы: PDF, PNG, JPG (максимум 10 MB)</p>
          <input
            type="file"
            multiple
            accept=".pdf,.png,.jpg,.jpeg,image/png,image/jpeg,application/pdf"
            onChange={(event) => handleFilesChange(event.target.files)}
            className="w-full border rounded px-3 py-2 text-sm"
            disabled={loading}
          />
          {files.length > 0 && (
            <div className="mt-2 text-xs text-gray-600">
              <p className="font-medium">Выбрано файлов: {files.length}</p>
              <ul className="list-disc list-inside">
                {Array.from(files).map((file, index) => (
                  <li key={index}>{file.name} ({(file.size / 1024).toFixed(1)} KB)</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <button
          disabled={loading || !token || organizersLoading}
          className="mt-2 bg-black text-white py-2 rounded disabled:opacity-60">
          {loading ? 'Отправка...' : 'Отправить заявку'}
        </button>
      </form>
    </div>
  )
}

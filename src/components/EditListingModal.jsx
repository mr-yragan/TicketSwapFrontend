import { useEffect, useMemo, useState } from 'react'
import { Button, DismissibleAlert, Modal } from '@/components/ui'
import { FormInput } from '@/components/FormInput'
import { OrganizerSelect } from '@/components/OrganizerSelect'
import { useModal } from '@/context'
import { ticketsApi } from '@/api'
import { organizerApi } from '@/api/apis/organizerApi'
import { formatErrorMessage } from '@/api/formatters'
import { useOrganizerCatalog } from '@/features/organizer/hooks/useOrganizerCatalog'
import { getOrganizerHint, toDateTimeInput } from '@/features/organizer/utils'

const EMPTY_FORM = {
  uid: '',
  eventName: '',
  eventDate: '',
  venue: '',
  price: '',
  additionalInfo: '',
  sellerComment: '',
  organizerId: '',
  organizerName: '',
  selectedEventId: '',
  eventId: '',
}

const buildUpdatePayload = (form) => ({
  uid: form.uid.trim(),
  eventName: form.eventName.trim(),
  eventDate: form.eventDate,
  venue: form.venue.trim(),
  price: Number(form.price),
  additionalInfo: form.additionalInfo.trim() || undefined,
  organizerId: form.organizerId ? Number(form.organizerId) : undefined,
  organizerName: form.organizerName.trim() || undefined,
  selectedEventId: form.selectedEventId ? Number(form.selectedEventId) : undefined,
  eventId: form.eventId.trim() || undefined,
  sellerComment: form.sellerComment.trim() || undefined,
})

export function EditListingModal() {
  const { closeModal, confirmAction, modalData } = useModal()
  const listingId = modalData?.listingId
  const listingSnapshot = modalData?.listingSnapshot
  const onUpdated = modalData?.onUpdated
  const { organizers, loading: organizersLoading } = useOrganizerCatalog()

  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [eventQuery, setEventQuery] = useState('')
  const [eventResults, setEventResults] = useState([])
  const [eventSearchLoading, setEventSearchLoading] = useState(false)
  const listingSnapshotDefaults = useMemo(() => ({
    uid: listingSnapshot?.uid || '',
    eventName: listingSnapshot?.eventName || '',
    eventDate: listingSnapshot?.eventDate || '',
    venue: listingSnapshot?.venue || '',
    price: listingSnapshot?.price,
    additionalInfo: listingSnapshot?.additionalInfo || '',
    sellerComment: listingSnapshot?.sellerComment || '',
    organizerId: listingSnapshot?.organizerId || '',
    organizerName: listingSnapshot?.organizerName || '',
    selectedEventId: listingSnapshot?.selectedEventId || '',
    eventId: listingSnapshot?.eventId || '',
  }), [
    listingSnapshot?.additionalInfo,
    listingSnapshot?.eventDate,
    listingSnapshot?.eventId,
    listingSnapshot?.eventName,
    listingSnapshot?.organizerId,
    listingSnapshot?.organizerName,
    listingSnapshot?.price,
    listingSnapshot?.selectedEventId,
    listingSnapshot?.sellerComment,
    listingSnapshot?.uid,
    listingSnapshot?.venue,
  ])

  const selectedOrganizer = useMemo(() => {
    return organizers.find((organizer) => String(organizer.id) === String(form.organizerId))
  }, [form.organizerId, organizers])

  const isExternalOrganizer = Boolean(selectedOrganizer?.hasExternalApi)

  useEffect(() => {
    if (form.organizerId || !form.organizerName || organizers.length === 0) {
      return
    }

    const matchedOrganizer = organizers.find((organizer) => (
      String(organizer.name || '').trim().toLowerCase() === String(form.organizerName || '').trim().toLowerCase()
    ))

    if (!matchedOrganizer) {
      return
    }

    setForm((current) => ({
      ...current,
      organizerId: String(matchedOrganizer.id),
      organizerName: matchedOrganizer.name || current.organizerName,
    }))
  }, [form.organizerId, form.organizerName, organizers])

  useEffect(() => {
    let cancelled = false

    const loadListing = async () => {
      if (!listingId) {
        setError('Не удалось определить объявление для редактирования')
        setLoading(false)
        return
      }

      setLoading(true)
      setError('')

      try {
        const response = await ticketsApi.getById(listingId)
        const details = response?.details ?? response

        if (cancelled) {
          return
        }

        setForm({
          uid: details?.uid || listingSnapshotDefaults.uid,
          eventName: details?.eventName || listingSnapshotDefaults.eventName,
          eventDate: toDateTimeInput(details?.eventDate || listingSnapshotDefaults.eventDate),
          venue: details?.venue || listingSnapshotDefaults.venue,
          price: details?.price != null
            ? String(details.price)
            : listingSnapshotDefaults.price != null
              ? String(listingSnapshotDefaults.price)
              : '',
          additionalInfo: details?.additionalInfo || listingSnapshotDefaults.additionalInfo,
          sellerComment: details?.sellerComment || listingSnapshotDefaults.sellerComment,
          organizerId: details?.organizerId
            ? String(details.organizerId)
            : listingSnapshotDefaults.organizerId
              ? String(listingSnapshotDefaults.organizerId)
              : '',
          organizerName: details?.organizerName || listingSnapshotDefaults.organizerName,
          selectedEventId: details?.selectedEventId
            ? String(details.selectedEventId)
            : listingSnapshotDefaults.selectedEventId
              ? String(listingSnapshotDefaults.selectedEventId)
              : '',
          eventId: details?.eventId || listingSnapshotDefaults.eventId,
        })
        setEventQuery(details?.eventName || listingSnapshotDefaults.eventName)
      } catch (loadError) {
        if (!cancelled) {
          setError(formatErrorMessage(loadError, 'Не удалось загрузить объявление'))
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadListing()

    return () => {
      cancelled = true
    }
  }, [listingId, listingSnapshotDefaults])

  useEffect(() => {
    const query = eventQuery.trim()

    if (!form.organizerId || query.length < 2) {
      setEventResults([])
      setEventSearchLoading(false)
      return
    }

    let cancelled = false
    const timer = window.setTimeout(async () => {
      setEventSearchLoading(true)

      try {
        const data = await organizerApi.searchEvents({
          query,
          organizerId: form.organizerId,
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
      window.clearTimeout(timer)
    }
  }, [eventQuery, form.organizerId])

  const handleFieldChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleOrganizerChange = (value) => {
    const organizer = organizers.find((item) => String(item.id) === String(value))
    const hasExternalApi = Boolean(organizer?.hasExternalApi)

    setForm((current) => ({
      ...current,
      organizerId: value,
      organizerName: organizer?.name || '',
      selectedEventId: '',
      eventId: '',
      eventName: hasExternalApi ? '' : current.eventName,
      eventDate: hasExternalApi ? '' : current.eventDate,
      venue: hasExternalApi ? '' : current.venue,
    }))
    setEventQuery('')
    setEventResults([])
  }

  const handleManualFieldChange = (field, value) => {
    if (isExternalOrganizer) {
      return
    }

    setForm((current) => ({
      ...current,
      [field]: value,
      selectedEventId: '',
      eventId: field === 'eventName' || field === 'eventDate' || field === 'venue' ? '' : current.eventId,
    }))
  }

  const handleSelectEvent = (eventItem) => {
    const defaults = eventItem?.listingDefaults || {}

    setForm((current) => ({
      ...current,
      organizerId: defaults.organizerId ? String(defaults.organizerId) : current.organizerId,
      organizerName: defaults.organizerName || current.organizerName,
      selectedEventId: defaults.selectedEventId ? String(defaults.selectedEventId) : '',
      eventId: defaults.eventId || eventItem?.eventId || '',
      eventName: defaults.eventName || eventItem?.name || '',
      eventDate: toDateTimeInput(defaults.startsAt || eventItem?.startsAt),
      venue: defaults.venue || [eventItem?.venue?.name, eventItem?.venue?.address].filter(Boolean).join(', '),
    }))
    setEventQuery(defaults.eventName || eventItem?.name || '')
    setEventResults([])
  }

  const validateForm = () => {
    if (!form.uid.trim()) return 'UID билета обязателен'
    if (!form.organizerId) return 'Выберите организатора'
    if (isExternalOrganizer && !form.selectedEventId && !form.eventId.trim()) {
      return 'Для автоматической проверки нужно выбрать событие из списка'
    }
    if (!form.eventName.trim()) return 'Введите название события'
    if (!form.eventDate) return 'Выберите дату и время события'
    if (!form.venue.trim()) return 'Укажите место проведения'
    if (!form.price || Number.isNaN(Number(form.price)) || Number(form.price) <= 0) {
      return 'Введите корректную цену'
    }
    return ''
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    try {
      const confirmed = await confirmAction({
        title: 'Сохранить изменения объявления?',
        message: 'После сохранения билет может снова отправиться на проверку организатору.',
        confirmLabel: 'Сохранить изменения',
        tone: 'primary',
      })

      if (!confirmed) {
        return
      }

      setSaving(true)
      setError('')

      const payload = buildUpdatePayload(form)
      const updatedListing = await ticketsApi.update(listingId, payload)
      await onUpdated?.(updatedListing)
      closeModal()
    } catch (submitError) {
      setError(formatErrorMessage(submitError, 'Не удалось обновить объявление'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal onClose={closeModal}>
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-950">Редактировать объявление</h2>
          <p className="mt-1 text-sm text-gray-500">Изменения могут повторно отправить билет на проверку.</p>
        </div>
      </div>

      {error && (
        <DismissibleAlert tone="error" onDismiss={() => setError('')}>
          {error}
        </DismissibleAlert>
      )}

      {loading ? (
        <div className="py-10 text-center text-gray-500">Загрузка объявления...</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <FormInput
            label="UID билета *"
            value={form.uid}
            onChange={(event) => handleFieldChange('uid', event.target.value)}
            required
          />
          <p className="text-xs text-gray-500">
            Если UID не пришёл с backend, мы подставим его из вашего объявления. Вручную вводить его нужно только в крайнем случае.
          </p>

          <label className="text-sm font-medium text-gray-700">Организатор *</label>
          <OrganizerSelect
            value={form.organizerId}
            onChange={handleOrganizerChange}
            organizers={organizers}
            loading={organizersLoading}
            disabled={saving}
          />
          <input type="hidden" value={form.organizerId} required readOnly />

          {selectedOrganizer && (
            <div className="text-xs text-gray-500">
              Выбран организатор: {selectedOrganizer.name}. {getOrganizerHint(selectedOrganizer)}.
            </div>
          )}

          {isExternalOrganizer && (
            <div className="rounded border border-blue-200 bg-blue-50 p-3 text-xs text-blue-800">
              Для этого организатора событие нужно выбрать из списка ниже. Поля события заполнятся автоматически.
            </div>
          )}

          {isExternalOrganizer && !form.selectedEventId && !form.eventId && (
            <div className="rounded border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              Для автоматической проверки нужно заново выбрать событие организатора перед сохранением.
            </div>
          )}

          <div className="relative">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {isExternalOrganizer ? 'Событие *' : 'Поиск события'}
            </label>
            <input
              type="search"
              value={eventQuery}
              onChange={(event) => setEventQuery(event.target.value)}
              placeholder={isExternalOrganizer ? 'Найдите событие организатора' : 'Можно найти и выбрать событие'}
              className="w-full rounded border px-3 py-2 text-sm"
            />
            {eventSearchLoading && (
              <div className="mt-1 text-xs text-gray-500">Ищем события...</div>
            )}
            {eventResults.length > 0 && (
              <div className="mt-2 max-h-56 overflow-y-auto rounded-lg border border-gray-200 bg-white">
                {eventResults.map((eventItem) => (
                  <button
                    key={eventItem.id}
                    type="button"
                    onClick={() => handleSelectEvent(eventItem)}
                    className="block w-full border-b border-gray-100 px-3 py-2 text-left text-sm last:border-b-0 hover:bg-gray-50"
                  >
                    <span className="block font-medium text-gray-950">{eventItem.name}</span>
                    <span className="block text-xs text-gray-500">
                      {eventItem.organizer?.name || 'Организатор'} · {eventItem.venue?.name || 'Площадка'}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <FormInput
            label="Название события *"
            value={form.eventName}
            onChange={(event) => handleManualFieldChange('eventName', event.target.value)}
            disabled={isExternalOrganizer}
            required
          />
          <FormInput
            label="Дата и время события *"
            type="datetime-local"
            value={form.eventDate}
            onChange={(event) => handleManualFieldChange('eventDate', event.target.value)}
            disabled={isExternalOrganizer}
            required
          />
          <FormInput
            label="Место проведения *"
            value={form.venue}
            onChange={(event) => handleManualFieldChange('venue', event.target.value)}
            disabled={isExternalOrganizer}
            required
          />
          <FormInput
            label="Цена билета (₽) *"
            type="number"
            value={form.price}
            onChange={(event) => handleFieldChange('price', event.target.value)}
            required
          />
          <FormInput
            label="Дополнительная информация"
            value={form.additionalInfo}
            onChange={(event) => handleFieldChange('additionalInfo', event.target.value)}
            rows={3}
          />
          <FormInput
            label="Комментарий продавца"
            value={form.sellerComment}
            onChange={(event) => handleFieldChange('sellerComment', event.target.value)}
            rows={2}
          />

          <div className="flex flex-wrap gap-2 pt-2">
            <Button type="submit" disabled={saving} className="bg-black text-white">
              {saving ? 'Сохраняем...' : 'Сохранить изменения'}
            </Button>
            <Button
              type="button"
              onClick={closeModal}
              disabled={saving}
              className="border border-gray-300 bg-white text-black"
            >
              Отмена
            </Button>
          </div>
        </form>
      )}
    </Modal>
  )
}

export default EditListingModal

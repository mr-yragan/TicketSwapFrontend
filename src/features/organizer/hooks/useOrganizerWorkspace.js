import { useCallback, useEffect, useMemo, useState } from 'react'
import { organizerApi } from '@/api'
import { EMPTY_EVENT_FORM } from '../constants'
import {
  buildEventPayload,
  buildOrganizerMetrics,
  getOrganizerApiErrorMessage,
  mapEventToForm,
} from '../utils'

const setListingValue = (setter, listingId, value) => {
  setter((current) => ({ ...current, [listingId]: value }))
}

export function useOrganizerWorkspace(isOrganizer) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState({ type: 'idle', message: '' })
  const [profile, setProfile] = useState(null)
  const [dashboard, setDashboard] = useState(null)
  const [events, setEvents] = useState([])
  const [pendingValidation, setPendingValidation] = useState([])
  const [pendingReissue, setPendingReissue] = useState([])
  const [eventForm, setEventForm] = useState(EMPTY_EVENT_FORM)
  const [editingEventId, setEditingEventId] = useState(null)
  const [eventAction, setEventAction] = useState(null)
  const [listingAction, setListingAction] = useState(null)
  const [validationReasons, setValidationReasons] = useState({})
  const [reissueReasons, setReissueReasons] = useState({})
  const [reissueUids, setReissueUids] = useState({})
  const [reissueFiles, setReissueFiles] = useState({})

  const organizer = profile?.organizer
  const currentUser = profile?.user
  const isManual = organizer?.verificationMode === 'MANUAL'
  const isBanned = Boolean(organizer?.banned)
  const canMutateManualWorkflow = isManual && !isBanned

  const metrics = useMemo(() => buildOrganizerMetrics({
    dashboard,
    events,
    pendingValidation,
    pendingReissue,
  }), [dashboard, events, pendingReissue, pendingValidation])

  const clearStatus = useCallback(() => {
    setStatus({ type: 'idle', message: '' })
  }, [])

  const clearError = useCallback(() => {
    setError('')
  }, [])

  const loadOrganizerData = useCallback(async () => {
    if (!isOrganizer) return

    setLoading(true)
    setError('')

    try {
      const [profileData, dashboardData, eventData] = await Promise.all([
        organizerApi.getOrganizerMe(),
        organizerApi.getOrganizerDashboard(),
        organizerApi.listEvents(),
      ])

      const manualActive = profileData?.organizer?.verificationMode === 'MANUAL' && !profileData?.organizer?.banned
      const [validationData, reissueData] = manualActive
        ? await Promise.all([
          organizerApi.listPendingValidation(),
          organizerApi.listPendingReissue(),
        ])
        : [[], []]

      setProfile(profileData)
      setDashboard(dashboardData)
      setEvents(Array.isArray(eventData) ? eventData : [])
      setPendingValidation(Array.isArray(validationData) ? validationData : [])
      setPendingReissue(Array.isArray(reissueData) ? reissueData : [])
    } catch (fetchError) {
      setError(getOrganizerApiErrorMessage(fetchError, 'Не удалось загрузить панель организатора'))
    } finally {
      setLoading(false)
    }
  }, [isOrganizer])

  useEffect(() => {
    loadOrganizerData()
  }, [loadOrganizerData])

  const updateEventField = useCallback((field, value) => {
    setEventForm((current) => ({ ...current, [field]: value }))
  }, [])

  const resetEventForm = useCallback(() => {
    setEventForm(EMPTY_EVENT_FORM)
    setEditingEventId(null)
  }, [])

  const saveEvent = useCallback(async () => {
    clearStatus()

    if (!canMutateManualWorkflow) {
      setStatus({ type: 'error', message: 'Мероприятия могут менять только активные manual-организаторы.' })
      return
    }

    setEventAction(editingEventId ? `update-${editingEventId}` : 'create')
    try {
      const payload = buildEventPayload(eventForm)
      const saved = editingEventId
        ? await organizerApi.updateEvent(editingEventId, payload)
        : await organizerApi.createEvent(payload)

      setEvents((current) => {
        if (editingEventId) {
          return current.map((item) => item.id === saved.id ? saved : item)
        }

        return [...current, saved]
      })
      resetEventForm()
      setStatus({ type: 'success', message: editingEventId ? 'Мероприятие обновлено.' : 'Мероприятие создано.' })
      await loadOrganizerData()
    } catch (submitError) {
      setStatus({ type: 'error', message: getOrganizerApiErrorMessage(submitError, 'Не удалось сохранить мероприятие') })
    } finally {
      setEventAction(null)
    }
  }, [canMutateManualWorkflow, clearStatus, editingEventId, eventForm, loadOrganizerData, resetEventForm])

  const editEvent = useCallback((eventItem) => {
    setEditingEventId(eventItem.id)
    setEventForm(mapEventToForm(eventItem))
    clearStatus()
  }, [clearStatus])

  const deleteEvent = useCallback(async (eventItem) => {
    setEventAction(`delete-${eventItem.id}`)
    clearStatus()

    try {
      await organizerApi.deleteEvent(eventItem.id)
      setEvents((current) => current.filter((item) => item.id !== eventItem.id))
      setStatus({ type: 'success', message: 'Мероприятие удалено.' })
      await loadOrganizerData()
    } catch (deleteError) {
      setStatus({ type: 'error', message: getOrganizerApiErrorMessage(deleteError, 'Не удалось удалить мероприятие') })
    } finally {
      setEventAction(null)
    }
  }, [clearStatus, loadOrganizerData])

  const verifyListing = useCallback(async (listing, approved) => {
    setListingAction(`verify-${listing.id}-${approved}`)
    clearStatus()

    try {
      await organizerApi.verifyListing(listing.id, {
        approved,
        reason: validationReasons[listing.id] || '',
      })
      setStatus({ type: 'success', message: approved ? 'Билет подтвержден.' : 'Билет отклонен.' })
      setListingValue(setValidationReasons, listing.id, '')
      await loadOrganizerData()
    } catch (verifyError) {
      setStatus({ type: 'error', message: getOrganizerApiErrorMessage(verifyError, 'Не удалось обработать билет') })
    } finally {
      setListingAction(null)
    }
  }, [clearStatus, loadOrganizerData, validationReasons])

  const completeReissue = useCallback(async (listing) => {
    const newTicketUid = (reissueUids[listing.id] || '').trim()
    const ticketFile = reissueFiles[listing.id]

    if (!newTicketUid || !ticketFile) {
      setStatus({ type: 'error', message: 'Для перевыпуска нужны UID нового билета и файл.' })
      return
    }

    setListingAction(`reissue-${listing.id}`)
    clearStatus()

    try {
      await organizerApi.completeReissue(listing.id, { newTicketUid, ticketFile })
      setStatus({ type: 'success', message: 'Новый билет загружен, сделка завершена.' })
      setListingValue(setReissueUids, listing.id, '')
      setListingValue(setReissueFiles, listing.id, null)
      await loadOrganizerData()
    } catch (reissueError) {
      setStatus({ type: 'error', message: getOrganizerApiErrorMessage(reissueError, 'Не удалось завершить перевыпуск') })
    } finally {
      setListingAction(null)
    }
  }, [clearStatus, loadOrganizerData, reissueFiles, reissueUids])

  const rejectReissue = useCallback(async (listing) => {
    setListingAction(`reject-reissue-${listing.id}`)
    clearStatus()

    try {
      await organizerApi.rejectReissue(listing.id, {
        reason: reissueReasons[listing.id] || '',
      })
      setStatus({ type: 'success', message: 'Перевыпуск отклонен.' })
      setListingValue(setReissueReasons, listing.id, '')
      await loadOrganizerData()
    } catch (rejectError) {
      setStatus({ type: 'error', message: getOrganizerApiErrorMessage(rejectError, 'Не удалось отклонить перевыпуск') })
    } finally {
      setListingAction(null)
    }
  }, [clearStatus, loadOrganizerData, reissueReasons])

  return {
    canMutateManualWorkflow,
    clearError,
    clearStatus,
    completeReissue,
    currentUser,
    deleteEvent,
    editEvent,
    editingEventId,
    error,
    eventAction,
    eventForm,
    events,
    isBanned,
    isManual,
    listingAction,
    loadOrganizerData,
    loading,
    metrics,
    organizer,
    pendingReissue,
    pendingValidation,
    profile,
    rejectReissue,
    reissueReasons,
    reissueUids,
    resetEventForm,
    saveEvent,
    setReissueFile: (listingId, value) => setListingValue(setReissueFiles, listingId, value),
    setReissueReason: (listingId, value) => setListingValue(setReissueReasons, listingId, value),
    setReissueUid: (listingId, value) => setListingValue(setReissueUids, listingId, value),
    setValidationReason: (listingId, value) => setListingValue(setValidationReasons, listingId, value),
    status,
    updateEventField,
    validationReasons,
    verifyListing,
  }
}

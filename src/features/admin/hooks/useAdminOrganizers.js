import { useCallback, useEffect, useMemo, useState } from 'react'
import { adminApi } from '@/api'
import { EMPTY_ORGANIZER_FORM } from '../constants'
import {
  buildOrganizerPayload,
  getAdminApiErrorMessage,
  sortOrganizers,
  validateOrganizerPayload,
} from '../utils'

export function useAdminOrganizers(isAdmin) {
  const [organizers, setOrganizers] = useState([])
  const [loading, setLoading] = useState(false)
  const [actionId, setActionId] = useState(null)
  const [status, setStatus] = useState({ type: 'idle', message: '' })
  const [issuedCredentials, setIssuedCredentials] = useState(null)
  const [form, setForm] = useState(EMPTY_ORGANIZER_FORM)

  const sortedOrganizers = useMemo(() => sortOrganizers(organizers), [organizers])

  const clearStatus = useCallback(() => {
    setStatus({ type: 'idle', message: '' })
  }, [])

  const clearIssuedCredentials = useCallback(() => {
    setIssuedCredentials(null)
  }, [])

  const loadOrganizers = useCallback(async () => {
    if (!isAdmin) return

    setLoading(true)
    try {
      const data = await adminApi.listOrganizers()
      setOrganizers(Array.isArray(data) ? data : [])
    } catch (error) {
      setStatus({ type: 'error', message: getAdminApiErrorMessage(error, 'Не удалось загрузить организаторов') })
    } finally {
      setLoading(false)
    }
  }, [isAdmin])

  useEffect(() => {
    loadOrganizers()
  }, [loadOrganizers])

  const updateField = useCallback((field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }, [])

  const resetForm = useCallback(() => {
    setForm(EMPTY_ORGANIZER_FORM)
  }, [])

  const createOrganizer = useCallback(async () => {
    clearStatus()
    clearIssuedCredentials()

    if (!isAdmin) {
      setStatus({ type: 'error', message: 'Нет доступа: требуется роль ADMIN.' })
      return
    }

    const payload = buildOrganizerPayload(form)
    const validationError = validateOrganizerPayload(payload)
    if (validationError) {
      setStatus({ type: 'error', message: validationError })
      return
    }

    setActionId('create')
    try {
      const created = await adminApi.createOrganizer(payload)
      setOrganizers((current) => [created, ...current])
      setIssuedCredentials(
        created?.verificationMode === 'EXTERNAL_API'
          ? {
              organizerName: created.name,
              organizerCode: created.organizerCode,
              integrationSecret: created.generatedIntegrationSecret || payload.integrationSecret || '',
              generated: Boolean(created.generatedIntegrationSecret),
            }
          : null
      )
      resetForm()
      setStatus({
        type: 'success',
        message: created?.verificationMode === 'EXTERNAL_API'
          ? 'Организатор создан. Пользователь повышен до ORGANIZER, а параметры интеграции показаны ниже.'
          : 'Организатор создан, пользователь повышен до ORGANIZER. Ему нужно заново войти, чтобы токен получил новую роль.',
      })
    } catch (error) {
      setStatus({ type: 'error', message: getAdminApiErrorMessage(error, 'Не удалось создать организатора') })
    } finally {
      setActionId(null)
    }
  }, [clearIssuedCredentials, clearStatus, form, isAdmin, resetForm])

  const toggleOrganizerBan = useCallback(async (organizer) => {
    const nextBanned = !organizer.banned
    clearStatus()
    setActionId(organizer.id)

    try {
      const updated = nextBanned
        ? await adminApi.banOrganizer(organizer.id)
        : await adminApi.unbanOrganizer(organizer.id)

      setOrganizers((current) => current.map((item) => item.id === updated.id ? updated : item))
      setStatus({
        type: 'success',
        message: nextBanned ? 'Организатор заблокирован.' : 'Организатор снова активен.',
      })
    } catch (error) {
      setStatus({ type: 'error', message: getAdminApiErrorMessage(error, 'Не удалось изменить статус организатора') })
    } finally {
      setActionId(null)
    }
  }, [clearStatus])

  return {
    actionId,
    clearIssuedCredentials,
    clearStatus,
    createOrganizer,
    form,
    issuedCredentials,
    loadOrganizers,
    loading,
    resetForm,
    sortedOrganizers,
    status,
    toggleOrganizerBan,
    updateField,
  }
}

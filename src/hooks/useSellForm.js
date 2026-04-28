import { useState, useCallback } from 'react'
import { ticketsApi } from '@/api'

const initialFormState = {
  eventName: '',
  eventDate: '',
  venue: '',
  price: '',
  uid: '',
  additionalInfo: '',
  organizerId: '',
  organizerName: '',
  selectedEventId: '',
  eventId: '',
  sellerComment: '',
}

const MAX_TEXT_LENGTH = 2000
const MAX_FILE_SIZE = 10 * 1024 * 1024
const ALLOWED_FILE_TYPES = ['image/png', 'image/jpeg', 'application/pdf']

const getSubmitErrorMessage = (error) => {
  const data = error?.response?.data
  return data?.message || data?.error || (typeof data === 'string' ? data : '') || error.message || 'Не удалось отправить заявку'
}

export function useSellForm(onSuccess) {
  const [form, setForm] = useState(initialFormState)
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const handleFieldChange = useCallback((field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleFilesChange = useCallback((newFiles) => {
    setFiles(Array.from(newFiles))
  }, [])

  const validateFiles = useCallback(() => {
    if (!files || files.length === 0) {
      return 'Загрузьте хотя бы один файл (PDF, PNG или JPG)'
    }

    for (const file of files) {
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        return `Файл "${file.name}" имеет недопустимый тип. Допустимы: PDF, PNG, JPG`
      }

      if (file.size > MAX_FILE_SIZE) {
        return `Файл "${file.name}" больше 10 MB`
      }
    }

    return null
  }, [files])

  const validateForm = useCallback(() => {
    if (!form.organizerId) return 'Выберите зарегистрированного организатора'
    if (!form.eventName.trim()) return 'Введите название события или выберите его из поиска'
    if (!form.eventDate) return 'Выберите дату и время события'

    const selectedDate = new Date(form.eventDate)
    if (selectedDate <= new Date()) {
      return 'Дата события должна быть в будущем'
    }

    if (!form.venue.trim()) {
        return 'Введите место проведения'
    }
    if (!form.price || isNaN(Number(form.price))) {
        return 'Введите корректную цену'
    }
    if (Number(form.price) <= 0) {
        return 'Цена должна быть больше 0'
    }

    const filesError = validateFiles()
    if (filesError) {
      return filesError
    }

    return null
  }, [form, validateFiles])

  const handleSubmit = useCallback(async (e, token, triggerRefresh) => {
    e.preventDefault()
    setSuccess(null)

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    if (!token) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const ticketData = {
        uid: form.uid.trim() || `TICKET-${Date.now()}`,
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
      }

      const createdTicket = await ticketsApi.sell(ticketData)

      if (files && files.length > 0) {
        await ticketsApi.uploadFiles(createdTicket.id, files)
      }

      setSuccess('Заявка на продажу успешно отправлена')
      triggerRefresh()

      if (typeof onSuccess === 'function') {
        onSuccess(ticketData)
      }

      setForm(initialFormState)
      setFiles([])
    } catch (err) {
      console.error(err)
      setError(getSubmitErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [form, validateForm, files, onSuccess])

  return {
    form,
    files,
    loading,
    error,
    success,
    handleFieldChange,
    handleFilesChange,
    handleSubmit,
    setError,
    setSuccess,
    constants: { MAX_TEXT_LENGTH, MAX_FILE_SIZE, ALLOWED_FILE_TYPES },
  }
}

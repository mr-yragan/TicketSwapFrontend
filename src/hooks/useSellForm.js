import { useState, useCallback } from 'react'
import { ticketsApi } from '@/api'
import { useModal } from '@/context'
import Logger from '@/utils/logger'

/*
  Сценарий "выставить билет на продажу":
  - хранит форму и вложения;
  - валидирует ввод;
  - собирает payload под backend;
  - показывает confirm;
  - отправляет multipart-запрос.
*/
const initialFormState = {
  eventName: '',
  eventDate: '',
  venue: '',
  price: '',
  uid: '',
  additionalInfo: '',
  organizerId: '',
  organizerName: '',
  organizerVerificationMode: '',
  organizerHasExternalApi: false,
  selectedEventId: '',
  eventId: '',
  sellerComment: '',
}

const MAX_TEXT_LENGTH = 2000
const MAX_FILE_SIZE = 10 * 1024 * 1024
const MAX_FILES_COUNT = 5
const ALLOWED_FILE_TYPES = ['image/png', 'image/jpeg', 'application/pdf']

const getSubmitErrorMessage = (error) => {
  const data = error?.response?.data
  return data?.message || data?.error || (typeof data === 'string' ? data : '') || error.message || 'Не удалось отправить заявку'
}

const buildSellPayload = (form) => ({
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
})

const buildFileKey = (file) => (
  [file.name, file.size, file.lastModified, file.type].join(':')
)

const mergeFiles = (currentFiles, newFiles) => {
  const selectedFiles = Array.from(newFiles || [])

  if (selectedFiles.length === 0) {
    return currentFiles
  }

  const nextFiles = [...currentFiles]
  const existingKeys = new Set(currentFiles.map(buildFileKey))

  for (const file of selectedFiles) {
    const fileKey = buildFileKey(file)
    if (existingKeys.has(fileKey)) {
      continue
    }

    nextFiles.push(file)
    existingKeys.add(fileKey)
  }

  return nextFiles
}

export function useSellForm(onSuccess) {
  const { confirmAction } = useModal()
  const [form, setForm] = useState(initialFormState)
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const handleFieldChange = useCallback((field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleFilesChange = useCallback((newFiles) => {
    setFiles((currentFiles) => mergeFiles(currentFiles, newFiles))
  }, [])

  const removeFile = useCallback((fileIndex) => {
    setFiles((currentFiles) => currentFiles.filter((_, index) => index !== fileIndex))
  }, [])

  const clearFiles = useCallback(() => {
    setFiles([])
  }, [])

  const validateFiles = useCallback(() => {
    if (!files || files.length === 0) {
      return 'Загрузьте хотя бы один файл (PDF, PNG или JPG)'
    }

    if (files.length > MAX_FILES_COUNT) {
      return `Можно загрузить максимум ${MAX_FILES_COUNT} файлов`
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
    if (form.organizerHasExternalApi && !form.selectedEventId && !form.eventId.trim()) {
      return 'Для организатора с автоматической проверкой нужно выбрать событие из поиска'
    }
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

    const confirmed = await confirmAction({
      title: 'Отправить объявление на продажу?',
      message: `Объявление по билету «${form.eventName.trim() || 'Без названия'}» будет отправлено на проверку и появится в каталоге после одобрения.`,
      confirmLabel: 'Отправить заявку',
      tone: 'primary',
    })

    if (!confirmed) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      // На фронте держим одну понятную структуру формы, а к transport-форме приводим в момент отправки.
      const ticketData = buildSellPayload(form)

      await ticketsApi.sell(ticketData, files)

      setSuccess('Заявка на продажу отправлена. Она появится в каталоге после проверки билета.')
      triggerRefresh()

      if (typeof onSuccess === 'function') {
        onSuccess(ticketData)
      }

      setForm(initialFormState)
      setFiles([])
    } catch (err) {
      Logger.error('Ошибка отправки заявки на продажу', err)
      setError(getSubmitErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [confirmAction, files, form, onSuccess, validateForm])

  return {
    form,
    files,
    loading,
    error,
    success,
    handleFieldChange,
    handleFilesChange,
    handleSubmit,
    removeFile,
    clearFiles,
    setError,
    setSuccess,
    constants: { MAX_TEXT_LENGTH, MAX_FILE_SIZE, MAX_FILES_COUNT, ALLOWED_FILE_TYPES },
  }
}

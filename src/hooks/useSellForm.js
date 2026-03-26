import { useState, useCallback } from 'react'
import { ticketsApi } from '@/api'

const initialFormState = {
  eventName: '',
  eventDate: '',
  venue: '',
  price: '',
  uid: '',
  additionalInfo: '',
  organizerName: '',
  sellerComment: '',
}

const MAX_TEXT_LENGTH = 2000
const MIN_PRICE = 0

export function useSellForm(onSuccess) {
  const [form, setForm] = useState(initialFormState)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const handleFieldChange = useCallback((field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }, [])

  const validateForm = useCallback(() => {
    if (!form.eventName.trim()) return 'Введите название события'
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
    if (Number(form.price) <= MIN_PRICE) {
        return 'Цена должна быть больше 0'
    }

    return null
  }, [form])

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
      const body = {
        uid: form.uid.trim() || `TICKET-${Date.now()}`,
        eventName: form.eventName.trim(),
        eventDate: form.eventDate,
        venue: form.venue.trim(),
        price: Number(form.price),
        additionalInfo: form.additionalInfo.trim() || undefined,
        organizerName: form.organizerName.trim() || undefined,
        sellerComment: form.sellerComment.trim() || undefined,
      }

      await ticketsApi.sell(body)

      setSuccess('Заявка на продажу успешно отправлена')
      triggerRefresh()

      if (typeof onSuccess === 'function') {
        onSuccess(body)
      }

      setForm(initialFormState)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Не удалось отправить заявку')
    } finally {
      setLoading(false)
    }
  }, [form, validateForm, onSuccess])

  return {
    form,
    loading,
    error,
    success,
    handleFieldChange,
    handleSubmit,
    constants: { MAX_TEXT_LENGTH, MIN_PRICE },
  }
}

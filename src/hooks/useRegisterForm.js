import { useState, useCallback } from 'react'
import { AUTH_CONFIG } from '@/config/constants'

const initialFormState = {
  email: '',
  password: '',
  confirmPassword: '',
}

export function useRegisterForm(onSuccess) {
  const [form, setForm] = useState(initialFormState)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleFieldChange = useCallback((field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }, [])

  const validate = useCallback(() => {
    if (form.password !== form.confirmPassword) {
      return 'Пароли не совпадают'
    }
    if (form.password.length < AUTH_CONFIG.MIN_PASSWORD_LENGTH) {
      return `Пароль должен быть не менее ${AUTH_CONFIG.MIN_PASSWORD_LENGTH} символов`
    }
    return null
  }, [form])

  const handleSubmit = useCallback(async (e, register) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    const result = await register(form.email, form.password)
    setLoading(false)

    if (result.success) {
      setForm(initialFormState)
      setSuccess('Регистрация прошла успешно')
      if (onSuccess) {
        setTimeout(onSuccess, 1200)
      }
    } else {
      setForm(prev => ({ ...prev, password: '', confirmPassword: '' }))
      setError(result.error || 'Ошибка регистрации')
    }
  }, [form, validate, onSuccess])

  return {
    form,
    error,
    success,
    loading,
    handleFieldChange,
    handleSubmit,
    constants: {
      MIN: AUTH_CONFIG.MIN_PASSWORD_LENGTH,
      MAX: AUTH_CONFIG.MAX_PASSWORD_LENGTH,
    },
  }
}

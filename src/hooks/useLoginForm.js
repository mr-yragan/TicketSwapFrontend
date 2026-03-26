import { useState, useCallback } from 'react'

const initialFormState = {
  email: '',
  password: '',
}

export function useLoginForm(onSuccess) {
  const [form, setForm] = useState(initialFormState)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleFieldChange = useCallback((field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }, [])

  const validate = useCallback(() => {
    if (!form.email.trim() || !form.password.trim()) {
      return 'Заполните все поля'
    }
    return null
  }, [form])

  const handleSubmit = useCallback(async (e, login) => {
    e.preventDefault()
    setError('')

    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    const result = await login(form.email, form.password)
    setLoading(false)

    if (result.success) {
      setForm(initialFormState)
      if (onSuccess) onSuccess()
    } else {
      setForm(prev => ({ ...prev, password: '' }))
      setError(result.error || 'Ошибка входа')
    }
  }, [form, validate, onSuccess])

  return {
    form,
    error,
    loading,
    handleFieldChange,
    handleSubmit,
    setError,
  }
}

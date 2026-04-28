import { useState, useCallback } from 'react'

const initialFormState = {
  identifier: '',
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
    if (!form.identifier.trim() || !form.password.trim()) {
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
    const result = await login(form.identifier, form.password)
    setLoading(false)

    if (result.success) {
      setForm(initialFormState)
      if (onSuccess) onSuccess(result)
    } else {
      if (result.requiresTwoFactor) {
        setForm(prev => ({ ...prev, password: '' }))
        if (onSuccess) {
          onSuccess({ ...result, identifier: form.identifier })
        }
        return
      }

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

import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button, DismissibleAlert, FormField } from '@/components/ui'
import { authApi } from '@/api'
import { AUTH_CONFIG } from '@/config/constants'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const token = useMemo(() => searchParams.get('token') || '', [searchParams])

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!token) {
      setError('Токен сброса не найден в ссылке')
      return
    }

    if (password.length < AUTH_CONFIG.MIN_PASSWORD_LENGTH || password.length > AUTH_CONFIG.MAX_PASSWORD_LENGTH) {
      setError(`Пароль должен быть от ${AUTH_CONFIG.MIN_PASSWORD_LENGTH} до ${AUTH_CONFIG.MAX_PASSWORD_LENGTH} символов`)
      return
    }

    if (password !== confirmPassword) {
      setError('Пароли не совпадают')
      return
    }

    setLoading(true)
    const result = await authApi.resetPassword(token, password)
    setLoading(false)

    if (!result.success) {
      setError(result.error || 'Не удалось изменить пароль')
      return
    }

    setSuccess(result.data?.message || 'Пароль успешно изменен')
    setPassword('')
    setConfirmPassword('')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-md mx-auto bg-white rounded-2xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-center mb-6">Новый пароль</h1>

        {error && (
          <DismissibleAlert tone="error" onDismiss={() => setError('')}>
            {error}
          </DismissibleAlert>
        )}

        {success && (
          <DismissibleAlert tone="success" onDismiss={() => setSuccess('')}>
            {success}
          </DismissibleAlert>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <FormField
            label="Новый пароль"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            helperText={`${AUTH_CONFIG.MIN_PASSWORD_LENGTH}-${AUTH_CONFIG.MAX_PASSWORD_LENGTH} символов`}
            minLength={AUTH_CONFIG.MIN_PASSWORD_LENGTH}
            maxLength={AUTH_CONFIG.MAX_PASSWORD_LENGTH}
            required
          />

          <FormField
            label="Повторите пароль"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            minLength={AUTH_CONFIG.MIN_PASSWORD_LENGTH}
            maxLength={AUTH_CONFIG.MAX_PASSWORD_LENGTH}
            required
          />

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white">
            {loading ? 'Сохранение...' : 'Сменить пароль'}
          </Button>
        </form>

        <div className="text-center mt-6">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-blue-500 hover:text-blue-700 font-medium text-sm">
            На главную
          </button>
        </div>
      </div>
    </div>
  )
}

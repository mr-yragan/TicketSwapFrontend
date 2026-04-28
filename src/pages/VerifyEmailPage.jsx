import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { authApi } from '@/api'
import { Button, DismissibleAlert } from '@/components/ui'
import { useAuth } from '@/context'

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { authenticateWithToken } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const verifiedTokenRef = useRef('')

  useEffect(() => {
    const token = searchParams.get('token')

    if (!token) {
      queueMicrotask(() => {
        setError('Токен подтверждения не найден в ссылке')
        setLoading(false)
      })
      return
    }

    if (verifiedTokenRef.current === token) {
      return
    }

    verifiedTokenRef.current = token

    const verify = async () => {
      const result = await authApi.verifyEmail(token)
      if (!result.success) {
        setError(result.error || 'Не удалось подтвердить email')
      } else {
        setMessage(result.data?.message || 'Email успешно подтвержден')
        const verifyToken = result.data?.token
        if (verifyToken) {
          const authResult = await authenticateWithToken(verifyToken)
          if (authResult?.success) {
            navigate('/profile', { replace: true, state: { message: 'Email подтвержден, вход выполнен автоматически' } })
            return
          }
        }
      }
      setLoading(false)
    }

    verify()
  }, [searchParams, authenticateWithToken, navigate])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-sm text-center">
        <h1 className="text-2xl font-bold mb-4">Подтверждение email</h1>

        {loading && <p className="text-gray-600">Проверяем ссылку...</p>}

        {!loading && error && (
          <DismissibleAlert tone="error" className="text-left" onDismiss={() => setError('')}>
            {error}
          </DismissibleAlert>
        )}

        {!loading && message && (
          <DismissibleAlert tone="success" className="text-left" onDismiss={() => setMessage('')}>
            {message}
          </DismissibleAlert>
        )}

        {!loading && (
          <Button className="bg-black text-white w-full" onClick={() => navigate('/')}>
            {message ? 'Войти' : 'На главную'}
          </Button>
        )}
      </div>
    </div>
  )
}

import { useState } from 'react'
import { X } from 'lucide-react'
import { useModal } from '@/context'
import { authApi } from '@/api'
import { Button, DismissibleAlert, FormField, Modal } from '@/components/ui'

export function ForgotPasswordModal() {
  const { closeModal, openModalAfterClose } = useModal()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!email.trim()) {
      setError('Введите email')
      return
    }

    setLoading(true)
    const result = await authApi.forgotPassword(email.trim())
    setLoading(false)

    if (!result.success) {
      setError(result.error || 'Не удалось отправить письмо')
      return
    }

    setSuccess(result.data?.message || 'Если аккаунт существует, письмо со сбросом отправлено')
  }

  const handleBackToLogin = () => {
    openModalAfterClose('login')
  }

  return (
    <Modal onClose={closeModal}>
      <button
        onClick={closeModal}
        className="absolute top-6 right-6 text-gray-400 hover:text-gray-600">
        <X size={24} />
      </button>

      <h1 className="text-2xl font-bold text-center mb-6">Сброс пароля</h1>

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
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Введите ваш email"
          required
        />

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white mt-2">
          {loading ? 'Отправка...' : 'Отправить ссылку'}
        </Button>
      </form>

      <div className="text-center text-sm mt-6">
        <button
          type="button"
          onClick={handleBackToLogin}
          className="text-blue-500 hover:text-blue-700 font-medium">
          Назад ко входу
        </button>
      </div>
    </Modal>
  )
}

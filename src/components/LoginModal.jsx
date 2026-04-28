import { useModal } from '@/context'
import { useAuth } from '@/context'
import { Button, DismissibleAlert, FormField, Modal } from '@/components/ui'
import { X } from 'lucide-react'
import { useLoginForm } from '@/hooks/useLoginForm'
import { authApi } from '@/api'
import { useState } from 'react'

export function LoginModal() {
  const { closeModal, modalData, openModalAfterClose } = useModal()
  const { login } = useAuth()
  const [infoMessage, setInfoMessage] = useState(() => (
    typeof modalData?.message === 'string' ? modalData.message : ''
  ))
  const [resendLoading, setResendLoading] = useState(false)
  const [resendMessage, setResendMessage] = useState('')

  const handleLoginResult = (result) => {
    if (result?.requiresTwoFactor) {
      openModalAfterClose('twoFactor', {
        challengeId: result.challengeId,
        expiresAt: result.expiresAt,
        identifier: result.identifier,
        message: result.message,
      })
      return
    }

    closeModal()
  }

  const { form, error, loading, handleFieldChange, handleSubmit, setError } = useLoginForm(handleLoginResult)

  const handleSwitchToRegister = () => {
    openModalAfterClose('register')
  }

  const handleForgotPassword = () => {
    openModalAfterClose('forgotPassword')
  }

  const handleResendVerification = async () => {
    if (!form.identifier.includes('@')) {
      return
    }

    setResendLoading(true)
    setResendMessage('')
    const result = await authApi.resendVerification(form.identifier)
    setResendLoading(false)

    if (result.success) {
      setResendMessage(result.data?.message || 'Письмо подтверждения отправлено')
    } else {
      setResendMessage(result.error || 'Не удалось отправить письмо подтверждения')
    }
  }

  return (
    <Modal onClose={closeModal}>
      <button
        onClick={closeModal}
        className="absolute top-6 right-6 text-gray-400 hover:text-gray-600">
        <X size={24} />
      </button>

      <h1 className="text-2xl font-bold text-center mb-6">Авторизация</h1>

      {error && (
        <DismissibleAlert tone="error" onDismiss={() => setError('')}>
          {error}
        </DismissibleAlert>
      )}

      {infoMessage && (
        <DismissibleAlert tone="info" onDismiss={() => setInfoMessage('')}>
          {infoMessage}
        </DismissibleAlert>
      )}

      {resendMessage && (
        <DismissibleAlert tone="info" onDismiss={() => setResendMessage('')}>
          {resendMessage}
        </DismissibleAlert>
      )}

      <form className="space-y-4" onSubmit={(e) => handleSubmit(e, login)}>
        <FormField
          label="Почта или логин"
          type="text"
          value={form.identifier}
          onChange={(e) => handleFieldChange('identifier', e.target.value)}
          placeholder="Введите почту или логин"
          required
        />

        <FormField
          label="Пароль"
          type="password"
          value={form.password}
          onChange={(e) => handleFieldChange('password', e.target.value)}
          placeholder="Введите пароль"
          helperText="8-72 символов"
          required
          minLength={8}
          maxLength={72}
        />

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white mt-6">
          {loading ? 'Вход...' : 'Вход'}
        </Button>
      </form>

      <div className="text-center text-sm mt-4">
        <button
          type="button"
          onClick={handleForgotPassword}
          className="text-blue-500 hover:text-blue-700 font-medium">
          Забыли пароль?
        </button>
      </div>

      {error?.includes('Email is not verified') && form.identifier.includes('@') && (
        <div className="text-center text-sm mt-3">
          <button
            type="button"
            onClick={handleResendVerification}
            disabled={resendLoading}
            className="text-blue-500 hover:text-blue-700 font-medium disabled:opacity-50">
            {resendLoading ? 'Отправка...' : 'Отправить письмо подтверждения ещё раз'}
          </button>
        </div>
      )}

      <div className="text-center text-sm mt-6">
        <button
          type="button"
          onClick={handleSwitchToRegister}
          className="text-blue-500 hover:text-blue-700 font-medium">
          Нет аккаунта? Зарегистрироваться
        </button>
      </div>
    </Modal>
  )
}

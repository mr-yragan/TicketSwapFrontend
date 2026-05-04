import { useModal } from '@/context'
import { useAuth } from '@/context'
import { Button, DismissibleAlert, FormField, Modal } from '@/components/ui'
import { X } from 'lucide-react'
import { useLoginForm } from '@/hooks/useLoginForm'
import { authApi } from '@/api'
import { useEffect, useMemo, useState } from 'react'

const isUnverifiedEmailError = (message) => {
  if (typeof message !== 'string') {
    return false
  }

  const normalizedMessage = message.toLowerCase()
  return normalizedMessage.includes('почта не подтверждена')
    || normalizedMessage.includes('email is not verified')
}

export function LoginModal() {
  const {
    closeModal,
    modalData,
    openModalAfterClose,
    rememberModalState,
    clearRememberedModalState,
  } = useModal()
  const { login } = useAuth()
  const [infoMessage, setInfoMessage] = useState(() => (
    typeof modalData?.message === 'string' ? modalData.message : ''
  ))
  const [resendLoading, setResendLoading] = useState(false)
  const [resendMessage, setResendMessage] = useState('')

  const handleLoginResult = (result) => {
    if (result?.requiresTwoFactor) {
      clearRememberedModalState('login')
      openModalAfterClose('twoFactor', {
        challengeId: result.challengeId,
        expiresAt: result.expiresAt,
        identifier: result.identifier,
        message: result.message,
      })
      return
    }

    clearRememberedModalState('login')
    closeModal()
  }

  const initialForm = useMemo(() => ({
    identifier: modalData?.identifier || '',
  }), [modalData?.identifier])

  const { form, error, loading, handleFieldChange, handleSubmit, setError } = useLoginForm(handleLoginResult, initialForm)

  useEffect(() => {
    if (!isUnverifiedEmailError(error)) {
      clearRememberedModalState('login')
      return
    }

    rememberModalState('login', {
      identifier: form.identifier,
      message: infoMessage,
      resendMessage,
    })
  }, [clearRememberedModalState, error, form.identifier, infoMessage, rememberModalState, resendMessage])

  const handleCloseModal = () => {
    closeModal()
  }

  const handleSwitchToRegister = () => {
    clearRememberedModalState('login')
    openModalAfterClose('register')
  }

  const handleForgotPassword = () => {
    clearRememberedModalState('login')
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

  const canResendVerification = form.identifier.includes('@') && isUnverifiedEmailError(error)

  return (
    <Modal onClose={handleCloseModal}>
      <button
        onClick={handleCloseModal}
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

      {canResendVerification && (
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

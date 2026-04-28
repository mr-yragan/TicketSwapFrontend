import { useState } from 'react'
import { X } from 'lucide-react'
import { useModal } from '@/context'
import { useAuth } from '@/context'
import { Button, DismissibleAlert, FormField, Modal } from '@/components/ui'

export function TwoFactorModal() {
  const { closeModal, openModal, openModalAfterClose, modalData } = useModal()
  const { verifyTwoFactor, resendTwoFactor } = useAuth()

  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)

  let expiresAtLabel = ''
  if (modalData?.expiresAt) {
    const expiresDate = new Date(modalData.expiresAt)
    if (!Number.isNaN(expiresDate.getTime())) {
      expiresAtLabel = expiresDate.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setInfo('')

    const challengeId = typeof modalData?.challengeId === 'string' ? modalData.challengeId.trim() : ''
    if (!challengeId) {
      setError('Сессия подтверждения истекла. Войдите снова.')
      return
    }

    const normalizedCode = code.trim()
    if (!/^\d{6}$/.test(normalizedCode)) {
      setError('Код должен содержать 6 цифр')
      return
    }

    setLoading(true)
    const result = await verifyTwoFactor(
      challengeId,
      normalizedCode,
      modalData?.identifier
    )
    setLoading(false)

    if (result.success) {
      closeModal()
      return
    }

    setError(result.error || 'Неверный код подтверждения')
  }

  const handleBackToLogin = () => {
    openModalAfterClose('login')
  }

  const handleResendCode = async () => {
    setError('')
    setInfo('')

    const challengeId = typeof modalData?.challengeId === 'string' ? modalData.challengeId.trim() : ''
    if (!challengeId) {
      setError('Сессия подтверждения истекла. Войдите снова.')
      return
    }

    setResendLoading(true)
    const result = await resendTwoFactor(challengeId)
    setResendLoading(false)

    if (!result.success) {
      setError(result.error || 'Не удалось отправить код ещё раз')
      return
    }

    const payload = result.data || {}
    const nextChallengeId = payload.twoFactorChallengeId || payload.challengeId || challengeId
    const nextExpiresAt = payload.twoFactorExpiresAt || payload.expiresAt || modalData?.expiresAt || null
    const nextMessage = payload.message || modalData?.message || 'Новый код подтверждения отправлен'

    openModal('twoFactor', {
      ...modalData,
      challengeId: nextChallengeId,
      expiresAt: nextExpiresAt,
      message: nextMessage,
    })
    setCode('')
    setInfo('Новый код отправлен на почту')
  }

  return (
    <Modal onClose={closeModal}>
      <button
        onClick={closeModal}
        className="absolute top-6 right-6 text-gray-400 hover:text-gray-600">
        <X size={24} />
      </button>

      <h1 className="text-2xl font-bold text-center mb-3">Подтверждение входа</h1>
      <p className="text-sm text-gray-600 text-center mb-6">
        {modalData?.message || 'Введите код из письма, отправленного на вашу почту'}
        {expiresAtLabel ? ` Код действует до ${expiresAtLabel}.` : ''}
      </p>

      {error && (
        <DismissibleAlert tone="error" onDismiss={() => setError('')}>
          {error}
        </DismissibleAlert>
      )}

      {info && (
        <DismissibleAlert tone="info" onDismiss={() => setInfo('')}>
          {info}
        </DismissibleAlert>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <FormField
          label="Код подтверждения"
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          placeholder="123456"
          helperText="6 цифр"
          maxLength={6}
          required
        />

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white mt-2">
          {loading ? 'Подтверждение...' : 'Подтвердить'}
        </Button>
      </form>

      <div className="flex flex-col items-center gap-3 text-center text-sm mt-6">
        <button
          type="button"
          onClick={handleResendCode}
          disabled={resendLoading || loading}
          className="text-blue-500 hover:text-blue-700 font-medium disabled:opacity-50">
          {resendLoading ? 'Отправка...' : 'Отправить код ещё раз'}
        </button>

        <button
          type="button"
          onClick={handleBackToLogin}
          className="text-gray-500 hover:text-gray-700 font-medium">
          Назад ко входу
        </button>
      </div>
    </Modal>
  )
}

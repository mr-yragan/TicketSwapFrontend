import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context'
import { useModal } from '@/context'
import { Button, DismissibleAlert } from '@/components/ui'
import { usePurchaseLogic } from '@/hooks/usePurchaseLogic'

const getDisabledStatusLabel = (status) => {
  switch (status) {
    case 'CREATED':
    case 'PENDING_VALIDATION':
      return 'Билет ещё проверяется'
    case 'PROCESSING':
      return 'Покупка уже обрабатывается'
    case 'FAILED':
      return 'Продажа недоступна'
    default:
      return ''
  }
}

const PurchaseButton = ({ listingId, price, disabled, sellerId, sellerEmail, status }) => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { openModal } = useModal()
  const { clearError, loading, error, handlePurchase } = usePurchaseLogic()

  const role = (user?.role || '').toUpperCase()
  const isSold = status === 'COMPLETED'
  const isRestrictedBuyerRole = role === 'ADMIN' || role === 'ORGANIZER'
  const disabledStatusLabel = getDisabledStatusLabel(status)
  const isOwnTicket = (user?.id != null && sellerId != null && user.id === sellerId)
    || (user?.email && sellerEmail && user.email === sellerEmail)
  const isButtonDisabled = disabled || loading

  const onPurchaseClick = async () => {
    if (!user) {
      openModal('login')
      return
    }

    if (isButtonDisabled) {
      return
    }

    await handlePurchase(listingId, navigate)
  }

  if (isSold) {
    return (
      <div className="mt-4">
        <Button
          type="button"
          disabled
          className="w-full cursor-not-allowed border border-gray-300 bg-gray-100 text-gray-500 disabled:opacity-100"
        >
          Билет уже продан
        </Button>
      </div>
    )
  }

  if (isRestrictedBuyerRole) {
    return (
      <div className="mt-4">
        <Button
          type="button"
          disabled
          className="w-full cursor-not-allowed border border-gray-300 bg-gray-100 text-gray-500 disabled:opacity-100"
        >
          Покупка доступна только обычным пользователям
        </Button>
      </div>
    )
  }

  if (disabledStatusLabel) {
    return (
      <div className="mt-4">
        <Button
          type="button"
          disabled
          className="w-full cursor-not-allowed border border-gray-300 bg-gray-100 text-gray-500 disabled:opacity-100"
        >
          {disabledStatusLabel}
        </Button>
      </div>
    )
  }

  if (isOwnTicket) {
    return (
      <div className="mt-4 w-full py-3 px-6 rounded-xl bg-blue-50 border-2 border-blue-200 text-blue-700 text-center font-semibold">
        Ваш билет на продаже
      </div>
    )
  }

  return (
    <div className="mt-4">
      <Button
        onClick={onPurchaseClick}
        disabled={isButtonDisabled}
        className={`w-full ${
          isButtonDisabled 
            ? 'bg-gray-400 cursor-not-allowed opacity-60' 
            : 'bg-green-500 hover:bg-green-600 active:bg-green-700'
        } text-white font-semibold text-base`}>
        {loading ? 'Покупаем...' : `Купить за ${price} ₽`}
      </Button>

      {error && (
        <DismissibleAlert tone="error" className="mt-3 mb-0" onDismiss={clearError}>
          {error}
        </DismissibleAlert>
      )}
    </div>
  )
}

export default PurchaseButton

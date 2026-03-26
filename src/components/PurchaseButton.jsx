import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/useAuth'
import { useModal } from '@/context/ModalContext'
import { Button } from '@/components/ui'
import { usePurchaseLogic } from '@/hooks/usePurchaseLogic'

const PurchaseButton = ({ listingId, price, disabled, sellerId }) => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { openModal } = useModal()
  const { loading, error, handlePurchase } = usePurchaseLogic()

  const isOwnTicket = user?.id === sellerId
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

  if (isOwnTicket) {
    return (
      <div className="mt-4 w-full py-3 px-6 rounded-xl bg-blue-50 border-2 border-blue-200 text-blue-700 text-center font-semibold">
        Вы продаёте этот билет
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
        <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}
    </div>
  )
}

export default PurchaseButton

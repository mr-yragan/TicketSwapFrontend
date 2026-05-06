import { useState, useCallback } from 'react'
import { ticketsApi } from '@/api'
import { useAuth, useModal } from '@/context'

/*
  Покупка — короткий hook-оркестратор:
  - проверяет роль;
  - спрашивает подтверждение;
  - вызывает backend;
  - после успеха уводит пользователя в профиль, где он продолжает сценарий заказа.
*/
const getPurchaseMessage = (response) => {
  if (response?.reissuedTicketUid) {
    return `Билет успешно куплен. Новый билет перевыпущен: ${response.reissuedTicketUid}`
  }

  return 'Покупка оформлена. Если организатор перевыпускает билеты вручную, новый билет появится в личном кабинете после обработки.'
}

export function usePurchaseLogic() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { user } = useAuth()
  const { confirmAction } = useModal()
  const role = (user?.role || '').toUpperCase()

  const handlePurchase = useCallback(async (listingId, navigate) => {
    if (loading) {
      return
    }

    if (role === 'ADMIN' || role === 'ORGANIZER') {
      setError('Админы и организаторы не могут покупать билеты. Войдите в аккаунт обычного пользователя.')
      return null
    }

    const confirmed = await confirmAction({
      title: 'Подтвердить покупку?',
      message: 'После подтверждения начнётся оформление заказа. Если у организатора ручной перевыпуск, новый билет появится после обработки.',
      confirmLabel: 'Купить билет',
      tone: 'primary',
    })

    if (!confirmed) {
      return null
    }

    setLoading(true)
    setError(null)

    try {
      const response = await ticketsApi.buy(listingId)
      const reissuedTicketUid = response?.reissuedTicketUid || null

      navigate('/profile', {
        state: {
          message: getPurchaseMessage(response),
          tab: 'upcoming-purchases',
          refreshPurchases: true,
          reissuedTicketUid,
        }
      })

      return response
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Не удалось купить билет'
      setError(msg)
      return null
    } finally {
      setLoading(false)
    }
  }, [confirmAction, loading, role])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    clearError,
    loading,
    error,
    handlePurchase,
  }
}

/**
 * Hook с логикой покупки билета
 */
import { useState, useCallback } from 'react'
import { ticketsApi } from '@/api'

export function usePurchaseLogic() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handlePurchase = useCallback(async (listingId, navigate) => {
    if (loading) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await ticketsApi.buy(listingId)
      const reissuedTicketUid = response?.reissuedTicketUid || null

      navigate('/profile', {
        state: {
          message: reissuedTicketUid
            ? `Билет успешно приобретён! Новый билет перевыпущен: ${reissuedTicketUid}`
            : 'Билет успешно приобретён!',
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
  }, [loading])

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

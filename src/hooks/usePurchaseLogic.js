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
      await ticketsApi.buy(listingId)

      navigate('/profile', {
        state: {
          message: 'Билет успешно приобретён!',
          tab: 'upcoming-purchases',
          refreshPurchases: true
        }
      })
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Не удалось купить билет'
      setError(msg)
      setLoading(false)
    }
  }, [loading])

  return {
    loading,
    error,
    handlePurchase,
  }
}

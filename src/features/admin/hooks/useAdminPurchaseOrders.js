import { useCallback, useEffect, useState } from 'react'
import { adminApi } from '@/api'
import { getAdminApiErrorMessage } from '../utils'

export function useAdminPurchaseOrders(isAdmin) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadPurchaseOrders = useCallback(async () => {
    if (!isAdmin) return

    setLoading(true)
    setError('')

    try {
      const data = await adminApi.listPurchaseOrders()
      setOrders(Array.isArray(data) ? data : [])
    } catch (fetchError) {
      setError(getAdminApiErrorMessage(fetchError, 'Не удалось загрузить журнал заказов'))
    } finally {
      setLoading(false)
    }
  }, [isAdmin])

  useEffect(() => {
    loadPurchaseOrders()
  }, [loadPurchaseOrders])

  return {
    error,
    loadPurchaseOrders,
    loading,
    orders,
  }
}

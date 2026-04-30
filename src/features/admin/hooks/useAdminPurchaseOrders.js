import { useCallback, useEffect, useState } from 'react'
import { adminApi } from '@/api'
import { getAdminApiErrorMessage } from '../utils'

export function useAdminPurchaseOrders(isAdmin) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [actionId, setActionId] = useState(null)
  const [status, setStatus] = useState({ type: 'idle', message: '' })

  const clearStatus = useCallback(() => {
    setStatus({ type: 'idle', message: '' })
  }, [])

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

  const completeRefund = useCallback(async (order) => {
    if (!order?.id) return

    clearStatus()
    setActionId(`refund-${order.id}`)

    try {
      const updated = await adminApi.completePurchaseRefund(order.id)
      setOrders((current) => current.map((item) => item.id === updated.id ? updated : item))
      setStatus({ type: 'success', message: `Возврат по заказу #${order.id} подтверждён.` })
    } catch (refundError) {
      setStatus({ type: 'error', message: getAdminApiErrorMessage(refundError, 'Не удалось завершить возврат') })
    } finally {
      setActionId(null)
    }
  }, [clearStatus])

  return {
    actionId,
    clearStatus,
    completeRefund,
    error,
    loadPurchaseOrders,
    loading,
    orders,
    status,
  }
}

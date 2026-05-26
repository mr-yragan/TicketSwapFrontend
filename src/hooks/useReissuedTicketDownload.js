import { useCallback, useState } from 'react'
import { ticketsApi } from '@/api'

export function useReissuedTicketDownload() {
  const [loadingTicketId, setLoadingTicketId] = useState(null)
  const [errorByTicketId, setErrorByTicketId] = useState({})

  const downloadReissuedTicket = useCallback(async (ticketId) => {
    if (!ticketId || loadingTicketId === ticketId) {
      return false
    }

    setLoadingTicketId(ticketId)
    setErrorByTicketId((current) => ({ ...current, [ticketId]: '' }))

    try {
      const response = await ticketsApi.getReissuedFileDownloadUrl(ticketId)
      if (!response?.url) {
        setErrorByTicketId((current) => ({
          ...current,
          [ticketId]: 'Ссылка на новый билет не получена',
        }))
        return false
      }

      const link = document.createElement('a')
      link.href = response.url
      link.rel = 'noopener noreferrer'
      if (response.originalName) {
        link.download = response.originalName
      }
      document.body.appendChild(link)
      link.click()
      link.remove()
      return true
    } catch (downloadError) {
      const data = downloadError?.response?.data
      setErrorByTicketId((current) => ({
        ...current,
        [ticketId]: data?.message || data?.error || 'Не удалось получить новый билет',
      }))
      return false
    } finally {
      setLoadingTicketId(null)
    }
  }, [loadingTicketId])

  const clearReissuedTicketError = useCallback((ticketId) => {
    if (!ticketId) {
      setErrorByTicketId({})
      return
    }

    setErrorByTicketId((current) => ({ ...current, [ticketId]: '' }))
  }, [])

  return {
    clearReissuedTicketError,
    downloadReissuedTicket,
    errorByTicketId,
    loadingTicketId,
  }
}

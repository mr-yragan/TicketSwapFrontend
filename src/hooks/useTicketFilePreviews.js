import { useEffect, useState } from 'react'
import { ticketsApi } from '@/api'
import { normalizeTicketFilePreviews } from '@/api/formatters'
import Logger from '@/utils/logger'

/*
  Публичные blur-preview для карточек и детальной страницы.
  Это отдельный поток от оригинальных файлов: превью может быть доступно всем,
  даже если полный файл скрыт до покупки или без нужной роли.
*/
export function useTicketFilePreviews(ticketId) {
  const [previews, setPreviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    if (!ticketId) {
      setPreviews([])
      setError(null)
      setLoading(false)
      return
    }

    const fetchPreviews = async () => {
      try {
        if (!cancelled) {
          setLoading(true)
          setError(null)
        }

        const response = await ticketsApi.getFilePreviews(ticketId)
        const normalizedPreviews = normalizeTicketFilePreviews(response)

        if (!cancelled) {
          setPreviews(normalizedPreviews)
        }
      } catch (err) {
        if (cancelled) {
          return
        }

        if (err?.response?.status === 404) {
          // У старых билетов превью может просто не быть — это не повод считать экран сломанным.
          setPreviews([])
          setError(null)
        } else {
          Logger.error('Ошибка загрузки превью файлов билета:', err)
          setPreviews([])
          setError('loadError')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchPreviews()

    return () => {
      cancelled = true
    }
  }, [ticketId])

  return {
    previews,
    loading,
    error,
  }
}

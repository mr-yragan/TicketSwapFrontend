import { useCallback, useEffect, useRef, useState } from 'react'
import { normalizeDownloadUrl, normalizeTicketFiles } from '@/api/formatters'
import { ticketsApi } from '@/api'
import Logger from '@/utils/logger'

export function useTicketFiles(ticketId) {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [downloadUrls, setDownloadUrls] = useState({})
  const downloadUrlsRef = useRef({})
  const currentTicketIdRef = useRef(ticketId)

  useEffect(() => {
    currentTicketIdRef.current = ticketId
  }, [ticketId])

  useEffect(() => {
    let cancelled = false

    if (!ticketId) {
      setFiles([])
      setError(null)
      setDownloadUrls({})
      downloadUrlsRef.current = {}
      setLoading(false)
      return
    }

    const fetchFiles = async () => {
      try {
        if (!cancelled) {
          setLoading(true)
          setError(null)
        }

        const response = await ticketsApi.getFiles(ticketId)
        const imageFiles = normalizeTicketFiles(response).filter((file) =>
          file.contentType?.startsWith('image/')
        )

        if (!cancelled) {
          setFiles(imageFiles)
          setDownloadUrls({})
        }
        downloadUrlsRef.current = {}
      } catch (err) {
        if (cancelled) {
          return
        }

        if (err.response?.status === 401 || err.response?.status === 403) {
          Logger.warn(`Нет доступа к файлам билета ${ticketId}`)
          setError('noAccess')
        } else {
          Logger.error('Ошибка загрузки файлов:', err)
          setError('loadError')
        }
        setFiles([])
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchFiles()

    return () => {
      cancelled = true
    }
  }, [ticketId])

  const getDownloadUrl = useCallback(async (fileId) => {
    if (!ticketId || !fileId) {
      return null
    }

    const cachedUrl = downloadUrlsRef.current[fileId]
    if (cachedUrl) {
      return cachedUrl
    }

    try {
      const response = await ticketsApi.getFileDownloadUrl(ticketId, fileId)
      const url = normalizeDownloadUrl(response)
      if (!url || currentTicketIdRef.current !== ticketId) {
        return null
      }
      downloadUrlsRef.current = {
        ...downloadUrlsRef.current,
        [fileId]: url,
      }
      setDownloadUrls((prev) => ({
        ...prev,
        [fileId]: url,
      }))

      return url
    } catch (err) {
      Logger.error(`Ошибка получения ссылки для файла ${fileId}:`, err)
      return null
    }
  }, [ticketId])

  const preloadDownloadUrls = useCallback(async (fileIds) => {
    if (!Array.isArray(fileIds) || fileIds.length === 0) {
      return
    }

    await Promise.all(fileIds.map((fileId) => getDownloadUrl(fileId)))
  }, [getDownloadUrl])

  return {
    files,
    loading,
    error,
    downloadUrls,
    getDownloadUrl,
    preloadDownloadUrls,
  }
}

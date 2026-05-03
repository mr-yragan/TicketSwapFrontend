import axios from 'axios'
import { Logger } from '@/utils/logger'
import { API_CONFIG } from '@/config/constants'

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: API_CONFIG.TIMEOUT,
})

const isTicketFileAccessRequest = (url = '') => (
  /\/tickets\/[^/]+\/(file|files|reissued-file)(\/.*)?$/.test(url)
)

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }

    return config
  },
  (error) => {
    Logger.error('Request error', error)
    return Promise.reject(error)
  }
)

apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    const requestUrl = error.config?.url || ''
    const isExpectedTicketFileAccessError = (
      (error.response?.status === 401 || error.response?.status === 403)
      && isTicketFileAccessRequest(requestUrl)
    )

    if (isExpectedTicketFileAccessError) {
      return Promise.reject(error)
    }

    if (error.response?.status === 401) {
      Logger.warn('Unauthorized response received')
    }

    if (error.response) {
      Logger.error(`API Error ${error.response.status}`, error.response.data)
    } else if (error.request) {
      Logger.error('No response - network error', error.message)
    } else {
      Logger.error('Request error', error.message)
    }

    return Promise.reject(error)
  }
)

export default apiClient

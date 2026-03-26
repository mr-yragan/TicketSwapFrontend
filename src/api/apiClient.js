import axios from 'axios'
import { Logger } from '@/utils/logger'
import { API_CONFIG } from '@/config/constants'

const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: API_CONFIG.TIMEOUT,
})

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    Logger.debug(`→ ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    Logger.error('Request error', error)
    return Promise.reject(error)
  }
)

apiClient.interceptors.response.use(
  (response) => {
    Logger.debug(`← ${response.status} ${response.config.url}`)
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      Logger.warn('Unauthorized - очищаем данные')
      localStorage.removeItem('token')
      localStorage.removeItem('email')
      localStorage.removeItem('userId')
      window.location.href = '/'
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

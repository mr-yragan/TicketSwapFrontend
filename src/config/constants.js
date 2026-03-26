export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
}

export const AUTH_CONFIG = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 72,
  TOKEN_KEY: 'token',
  EMAIL_KEY: 'email',
  USER_ID_KEY: 'userId',
}

export const FORM_CONFIG = {
  MAX_TEXT_LENGTH: 2000,
  MIN_PRICE: 0,
}

export const TICKET_CONFIG = {
  DEFAULT_CITY: 'Все города',
  DEFAULT_SORT: 'date-asc',
  DEFAULT_MAX_PRICE: '',
}

export const UI_CONFIG = {
  MODAL_ANIMATION_DURATION: 200,
  SUCCESS_MESSAGE_DURATION: 5000,
  ERROR_MESSAGE_DURATION: 5000,
  TOAST_DURATION: 3000,
}

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500,
}

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Ошибка соединения. Проверьте интернет.',
  AUTH_FAILED: 'Ошибка аутентификации',
  PERMISSION_DENIED: 'Доступ запрещен',
  NOT_FOUND: 'Ресурс не найден',
  SERVER_ERROR: 'Ошибка сервера. Попробуйте позже.',
  VALIDATION_ERROR: 'Проверьте введенные данные',
}

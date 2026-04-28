import { formatErrorMessage } from './formatters'

export function createApiResultHandler(requestFn, defaultMessage) {
  return async (...args) => {
    try {
      const data = await requestFn(...args)

      return {
        success: true,
        data,
      }
    } catch (error) {
      return {
        success: false,
        error: formatErrorMessage(error, defaultMessage),
        status: error?.response?.status ?? null,
        data: error?.response?.data ?? null,
      }
    }
  }
}

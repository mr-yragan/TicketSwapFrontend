/*
  Обычный форматер для обработк корректной сообщений от сервера.
*/
export const formatErrorMessage = (error, defaultMessage) => {
  const fieldErrors = error.response?.data?.fieldErrors

  if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
    return fieldErrors.join('; ')
  }

  if (fieldErrors && typeof fieldErrors === 'object') {
    return Object.entries(fieldErrors)
      .map(([field, msg]) => `${field}: ${msg}`)
      .join('; ')
  }

  return error.response?.data?.message || error.message || defaultMessage
}

export const normalizeTicketFiles = (payload) => {
  if (Array.isArray(payload)) {
    return payload
  }

  if (Array.isArray(payload?.files)) {
    return payload.files
  }

  return []
}

export const normalizeTicketFilePreviews = (payload) => {
  if (Array.isArray(payload)) {
    return payload
  }

  if (Array.isArray(payload?.previews)) {
    return payload.previews
  }

  return []
}

export const normalizeDownloadUrl = (payload) => {
  if (typeof payload === 'string') {
    return payload
  }

  return payload?.url || null
}

export const formatErrorMessage = (error, defaultMessage) => {
  if (error.response?.data?.fieldErrors) {
    return Object.entries(error.response.data.fieldErrors)
      .map(([field, msg]) => `${field}: ${msg}`)
      .join('; ')
  }
  return error.response?.data?.message || error.message || defaultMessage
}

const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG',
}

const isDevelopment = import.meta.env.DEV

const log = (level, message, data = null) => {
  if (!isDevelopment && level === LOG_LEVELS.DEBUG) return

  const timestamp = new Date().toISOString()
  const logMessage = `[${timestamp}] [${level}] ${message}`

  switch (level) {
    case LOG_LEVELS.ERROR:
      console.error(logMessage, data)
      break
    case LOG_LEVELS.WARN:
      console.warn(logMessage, data)
      break
    case LOG_LEVELS.INFO:
      console.info(logMessage, data)
      break
    case LOG_LEVELS.DEBUG:
      console.debug(logMessage, data)
      break
    default:
      console.log(logMessage, data)
  }
}

export const Logger = {
  error: (message, data) => log(LOG_LEVELS.ERROR, message, data),
  warn: (message, data) => log(LOG_LEVELS.WARN, message, data),
  info: (message, data) => log(LOG_LEVELS.INFO, message, data),
  debug: (message, data) => log(LOG_LEVELS.DEBUG, message, data),
}

export default Logger

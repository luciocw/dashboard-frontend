/**
 * Conditional Logger
 * Only logs in development environment
 */

const isDev = process.env.NODE_ENV === 'development'

export const logger = {
  warn: (...args: unknown[]) => {
    if (isDev) {
      console.warn(...args)
    }
  },

  error: (...args: unknown[]) => {
    if (isDev) {
      console.error(...args)
    }
  },

  info: (...args: unknown[]) => {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.info(...args)
    }
  },

  debug: (...args: unknown[]) => {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.log(...args)
    }
  },
}

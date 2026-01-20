/**
 * Production-safe logger utility
 * Logs detailed errors only in development mode to prevent information disclosure
 */

const isDevelopment = import.meta.env.DEV;

export const logger = {
  /**
   * Log errors - only shows details in development
   */
  error: (message: string, error?: unknown): void => {
    if (isDevelopment) {
      console.error(message, error);
    }
    // In production, we could send to a monitoring service like Sentry
    // For now, just log a generic message without sensitive details
  },

  /**
   * Log warnings - only shows in development
   */
  warn: (message: string, data?: unknown): void => {
    if (isDevelopment) {
      console.warn(message, data);
    }
  },

  /**
   * Log info - only shows in development
   */
  info: (message: string, data?: unknown): void => {
    if (isDevelopment) {
      console.log(message, data);
    }
  },

  /**
   * Log debug info - only shows in development
   */
  debug: (message: string, data?: unknown): void => {
    if (isDevelopment) {
      console.log(`[DEBUG] ${message}`, data);
    }
  }
};

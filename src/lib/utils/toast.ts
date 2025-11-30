import { toast as sonnerToast } from 'sonner'

export const toast = {
  success: (message: string, options?: { description?: string }) => {
    sonnerToast.success(message, {
      duration: 3000,
      ...options,
    })
  },

  error: (message: string, options?: { description?: string }) => {
    sonnerToast.error(message, {
      duration: Infinity,
      ...options,
    })
  },

  info: (message: string, options?: { description?: string; duration?: number }) => {
    sonnerToast.info(message, {
      duration: options?.duration ?? 3000,
      ...options,
    })
  },

  warning: (message: string, options?: { description?: string; duration?: number }) => {
    sonnerToast.warning(message, {
      duration: options?.duration ?? 5000,
      ...options,
    })
  },

  dismiss: sonnerToast.dismiss,
}

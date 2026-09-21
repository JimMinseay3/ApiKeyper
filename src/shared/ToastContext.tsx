import React, { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle, XCircle, Info, AlertCircle } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: string
  type: ToastType
  message: string
  duration?: number
}

interface ToastContextType {
  showToast: (type: ToastType, message: string, duration?: number) => void
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
  warning: (message: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((type: ToastType, message: string, duration = 3000) => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, type, message, duration }])

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, duration)
  }, [])

  const success = useCallback((message: string) => showToast('success', message), [showToast])
  const error = useCallback((message: string) => showToast('error', message), [showToast])
  const info = useCallback((message: string) => showToast('info', message), [showToast])
  const warning = useCallback((message: string) => showToast('warning', message), [showToast])

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2 pointer-events-none">
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ toast }: { toast: Toast }) {
  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <XCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
    warning: <AlertCircle className="w-5 h-5" />
  }

  const styles = {
    success: 'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800',
    error: 'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800',
    info: 'bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800',
    warning: 'bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800'
  }

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg animate-slide-in pointer-events-auto ${styles[toast.type]}`}>
      {icons[toast.type]}
      <p className="text-sm font-medium">{toast.message}</p>
    </div>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    return {
      showToast: () => {},
      success: () => {},
      error: () => {},
      info: () => {},
      warning: () => {}
    }
  }
  return context
}

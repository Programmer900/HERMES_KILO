import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string
        initDataUnsafe: {
          user?: {
            id: number
            first_name: string
            last_name?: string
            username?: string
            language_code?: string
            is_premium?: boolean
          }
          query_id?: string
          auth_date?: string
          hash?: string
        }
        ready: () => void
        expand: () => void
        close: () => void
        MainButton: {
          text: string
          isVisible: boolean
          isActive: boolean
          show: () => void
          hide: () => void
          setText: (text: string) => void
          enable: () => void
          disable: () => void
          onClick: (callback: () => void) => void
          offClick: (callback: () => void) => void
        }
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy') => void
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void
        }
      }
    }
  }
}

interface WebAppContextType {
  tg: typeof window.Telegram.WebApp | null
  user: typeof window.Telegram.WebApp.initDataUnsafe.user | null
  isAuthenticated: boolean
  error: string | null
}

const WebAppContext = createContext<WebAppContextType>({
  tg: null,
  user: null,
  isAuthenticated: false,
  error: null
})

export const useWebApp = () => useContext(WebAppContext)

export function WebAppProvider({ children }: { children: ReactNode }) {
  const [tg, setTg] = useState<typeof window.Telegram.WebApp | null>(null)
  const [user, setUser] = useState<typeof window.Telegram.WebApp.initDataUnsafe.user | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      if (window.Telegram?.WebApp) {
        const webapp = window.Telegram.WebApp
        webapp.ready()
        webapp.expand()
        setTg(webapp)
        setUser(webapp.initDataUnsafe.user || null)
      } else {
        setError('Telegram WebApp SDK not available — open this app inside Telegram')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to initialise Telegram WebApp'
      console.error('WebApp init error:', err)
      setError(message)
    }
  }, [])

  return (
    <WebAppContext.Provider value={{ tg, user, isAuthenticated: !!user, error }}>
      {children}
    </WebAppContext.Provider>
  )
}

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

type WebAppType = NonNullable<typeof window.Telegram>['WebApp']
type UserType = WebAppType['initDataUnsafe']['user']

interface WebAppContextType {
  tg: WebAppType | null
  user: UserType | null
  isAuthenticated: boolean
}

const WebAppContext = createContext<WebAppContextType>({
  tg: null,
  user: null,
  isAuthenticated: false
})

export const useWebApp = () => useContext(WebAppContext)

export function WebAppProvider({ children }: { children: ReactNode }) {
  const [tg, setTg] = useState<WebAppType | null>(null)
  const [user, setUser] = useState<UserType | null>(null)

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const webapp = window.Telegram.WebApp
      webapp.ready()
      webapp.expand()
      setTg(webapp)
      setUser(webapp.initDataUnsafe.user || null)
    }
  }, [])

  return (
    <WebAppContext.Provider value={{ tg, user, isAuthenticated: !!user }}>
      {children}
    </WebAppContext.Provider>
  )
}

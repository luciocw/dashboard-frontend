import { useState, useEffect } from 'react'

/**
 * Hook para monitorar status de conexão do navegador
 * @returns true se online, false se offline
 * @example
 * const isOnline = useOnlineStatus()
 * if (!isOnline) showOfflineBanner()
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}

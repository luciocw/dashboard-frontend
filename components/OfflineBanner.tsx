import { memo } from 'react'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'

export const OfflineBanner = memo(function OfflineBanner() {
  const isOnline = useOnlineStatus()

  if (isOnline) return null

  return (
    <div 
      role="alert"
      className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white text-center py-2 text-sm font-medium"
    >
      ⚠️ Você está offline. Algumas funcionalidades podem não funcionar.
    </div>
  )
})

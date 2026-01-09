/**
 * Hook centralizado para autenticação e estado premium
 * Facilita o acesso aos dados do usuário em toda a aplicação
 */

import { useAppStore } from '@/store/useAppStore'

export function useAuth() {
  const currentUser = useAppStore((state) => state.currentUser)
  const isPremium = useAppStore((state) => state.isPremiumUser)
  const setIsPremiumUser = useAppStore((state) => state.setIsPremiumUser)
  const logout = useAppStore((state) => state.logout)

  return {
    // User data
    user: currentUser,
    isAuthenticated: !!currentUser,
    userId: currentUser?.user_id ?? null,
    username: currentUser?.username ?? null,
    displayName: currentUser?.display_name ?? currentUser?.username ?? null,
    avatarUrl: currentUser?.avatar
      ? `https://sleepercdn.com/avatars/thumbs/${currentUser.avatar}`
      : null,

    // Premium status
    isPremium,
    setIsPremium: setIsPremiumUser,

    // Actions
    logout,
  }
}

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SleeperUser } from '@/types/sleeper'

interface AppState {
  // User state
  currentUser: SleeperUser | null
  setCurrentUser: (user: SleeperUser | null) => void

  // Season state
  selectedSeason: string
  setSelectedSeason: (season: string) => void

  // UI state
  theme: 'dark' | 'light'
  toggleTheme: () => void

  // Premium features
  isPremiumUser: boolean
  setIsPremiumUser: (isPremium: boolean) => void

  // Hydration state (para evitar mismatch SSR)
  _hasHydrated: boolean

  // Actions
  logout: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial state
      currentUser: null,
      selectedSeason: '2025',
      theme: 'dark',
      isPremiumUser: false,
      _hasHydrated: false,

      // Actions
      setCurrentUser: (user) => set({ currentUser: user }),

      setSelectedSeason: (season) => set({ selectedSeason: season }),

      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'dark' ? 'light' : 'dark',
        })),

      setIsPremiumUser: (isPremium) => set({ isPremiumUser: isPremium }),

      logout: () =>
        set({
          currentUser: null,
        }),
    }),
    {
      name: 'fantasy-intel-storage',
      partialize: (state) => ({
        currentUser: state.currentUser,
        selectedSeason: state.selectedSeason,
        theme: state.theme,
        isPremiumUser: state.isPremiumUser,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state._hasHydrated = true
        }
      },
    }
  )
)

// Hook para verificar se o store já hidratou (evita mismatch SSR/client)
export const useHasHydrated = () => {
  return useAppStore((state) => state._hasHydrated)
}

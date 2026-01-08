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

  // Premium features (IDP Explorer bloqueado para não-premium)
  isPremiumUser: boolean
  setIsPremiumUser: (isPremium: boolean) => void

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

      // Actions
      setCurrentUser: (user) => set({ currentUser: user }),

      setSelectedSeason: (season) => set({ selectedSeason: season }),

      toggleTheme: () => set((state) => ({
        theme: state.theme === 'dark' ? 'light' : 'dark'
      })),

      setIsPremiumUser: (isPremium) => set({ isPremiumUser: isPremium }),

      logout: () => set({
        currentUser: null,
      }),
    }),
    {
      name: 'dynasty-dashboard-storage',
      partialize: (state) => ({
        currentUser: state.currentUser,
        selectedSeason: state.selectedSeason,
        theme: state.theme,
        isPremiumUser: state.isPremiumUser,
      }),
    }
  )
)

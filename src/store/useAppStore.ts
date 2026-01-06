import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  user_id: string
  username: string
  display_name?: string
  avatar?: string
}

interface AppState {
  // User state
  currentUser: User | null
  setCurrentUser: (user: User | null) => void
  
  // Season state
  selectedSeason: string
  setSelectedSeason: (season: string) => void

  // UI state
  theme: 'dark' | 'light'
  toggleTheme: () => void

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

      // Actions
      setCurrentUser: (user) => set({ currentUser: user }),

      setSelectedSeason: (season) => set({ selectedSeason: season }),

      toggleTheme: () => set((state) => ({
        theme: state.theme === 'dark' ? 'light' : 'dark'
      })),

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
      }),
    }
  )
)

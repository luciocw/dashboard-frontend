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
  
  // Filters
  searchQuery: string
  setSearchQuery: (query: string) => void
  
  // Actions
  logout: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial state
      currentUser: null,
      selectedSeason: '2026',
      theme: 'dark',
      searchQuery: '',
      
      // Actions
      setCurrentUser: (user) => set({ currentUser: user }),
      
      setSelectedSeason: (season) => set({ selectedSeason: season }),
      
      toggleTheme: () => set((state) => ({ 
        theme: state.theme === 'dark' ? 'light' : 'dark' 
      })),
      
      setSearchQuery: (query) => set({ searchQuery: query }),
      
      logout: () => set({ 
        currentUser: null,
        searchQuery: '',
      }),
    }),
    {
      name: 'dynasty-dashboard-storage',
      partialize: (state) => ({
        selectedSeason: state.selectedSeason,
        theme: state.theme,
      }),
    }
  )
)

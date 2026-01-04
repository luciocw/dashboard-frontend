import { useQuery } from '@tanstack/react-query'
import { sleeperAPI } from '@/core/api/sleeper'

export function useSleeperUser(username: string) {
  return useQuery({
    queryKey: ['user', username],
    queryFn: async () => {
      const user = await sleeperAPI.getUser(username)
      console.log('🔍 User found:', user)
      return user
    },
    enabled: username.length > 0,
    staleTime: 1000 * 60 * 60 * 4,
  })
}

export function useSleeperLeagues(userId: string | undefined, season: string = '2026') {
  return useQuery({
    queryKey: ['leagues', userId, season],
    queryFn: async () => {
      console.log(`🔍 Fetching leagues for user ${userId} in season ${season}...`)
      const leagues = await sleeperAPI.getUserLeagues(userId!, season)
      console.log(`✅ Found ${leagues?.length || 0} leagues:`, leagues)
      return leagues
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 60 * 4,
  })
}

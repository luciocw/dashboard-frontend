'use client'

import { useQuery } from '@tanstack/react-query'
import { API_URL } from '@/constants'

interface TrendingPlayer {
  player_id: string
  count: number
}

interface PlayerInfo {
  player_id: string
  full_name: string
  first_name: string
  last_name: string
  position: string
  team: string | null
  age: number | null
}

export interface TrendingPlayerWithInfo extends TrendingPlayer {
  info?: PlayerInfo
}

async function fetchTrendingPlayers(type: 'add' | 'drop', limit: number = 10): Promise<TrendingPlayer[]> {
  const response = await fetch(`${API_URL}/players/nfl/trending/${type}?limit=${limit}`)
  if (!response.ok) throw new Error(`Failed to fetch trending ${type}s`)
  return response.json()
}

async function fetchPlayersBatch(playerIds: string[]): Promise<Record<string, PlayerInfo>> {
  // Sleeper API returns all players, we'll filter client-side
  const response = await fetch(`${API_URL}/players/nfl`)
  if (!response.ok) throw new Error('Failed to fetch players')
  const allPlayers = await response.json()

  const result: Record<string, PlayerInfo> = {}
  playerIds.forEach(id => {
    if (allPlayers[id]) {
      result[id] = allPlayers[id]
    }
  })
  return result
}

export function useTrendingAdds(limit: number = 10) {
  return useQuery({
    queryKey: ['trending', 'add', limit],
    queryFn: () => fetchTrendingPlayers('add', limit),
    staleTime: 1000 * 60 * 30, // 30 minutes
  })
}

export function useTrendingDrops(limit: number = 10) {
  return useQuery({
    queryKey: ['trending', 'drop', limit],
    queryFn: () => fetchTrendingPlayers('drop', limit),
    staleTime: 1000 * 60 * 30, // 30 minutes
  })
}

export function useTrendingPlayersWithInfo(limit: number = 5) {
  const { data: adds, isLoading: loadingAdds } = useTrendingAdds(limit)
  const { data: drops, isLoading: loadingDrops } = useTrendingDrops(limit)

  const allPlayerIds = [
    ...(adds?.map(p => p.player_id) || []),
    ...(drops?.map(p => p.player_id) || []),
  ]

  const { data: playersInfo, isLoading: loadingPlayers } = useQuery({
    queryKey: ['players', 'batch', allPlayerIds.join(',')],
    queryFn: () => fetchPlayersBatch(allPlayerIds),
    enabled: allPlayerIds.length > 0,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  })

  const addsWithInfo: TrendingPlayerWithInfo[] = (adds || []).map(player => ({
    ...player,
    info: playersInfo?.[player.player_id],
  }))

  const dropsWithInfo: TrendingPlayerWithInfo[] = (drops || []).map(player => ({
    ...player,
    info: playersInfo?.[player.player_id],
  }))

  return {
    adds: addsWithInfo,
    drops: dropsWithInfo,
    isLoading: loadingAdds || loadingDrops || loadingPlayers,
  }
}

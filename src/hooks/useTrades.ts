import { useQuery } from '@tanstack/react-query'
import { API_URL, CACHE_TIMES } from '@/constants'

/**
 * Representa uma trade
 */
export interface Trade {
  transaction_id: string
  type: string
  status: string
  roster_ids: number[]
  adds: Record<string, number> | null  // player_id -> roster_id
  drops: Record<string, number> | null
  draft_picks: TradePick[]
  created: number // timestamp
  consenter_ids: number[]
}

export interface TradePick {
  season: string
  round: number
  roster_id: number
  previous_owner_id: number
  owner_id: number
}

/**
 * Busca transações de uma liga
 */
async function fetchTransactions(leagueId: string): Promise<Trade[]> {
  // Buscar das últimas semanas (1-18)
  const allTrades: Trade[] = []
  
  // Buscar de várias semanas em paralelo
  const weeks = Array.from({ length: 18 }, (_, i) => i + 1)
  
  const results = await Promise.all(
    weeks.map(async (week) => {
      try {
        const res = await fetch(`${API_URL}/league/${leagueId}/transactions/${week}`)
        if (!res.ok) return []
        const transactions: Trade[] = await res.json()
        // Filtrar apenas trades
        return transactions.filter(t => t.type === 'trade' && t.status === 'complete')
      } catch {
        return []
      }
    })
  )
  
  results.forEach(trades => allTrades.push(...trades))
  
  // Remover duplicatas e ordenar por data (mais recente primeiro)
  const uniqueTrades = new Map<string, Trade>()
  allTrades.forEach(t => uniqueTrades.set(t.transaction_id, t))
  
  return Array.from(uniqueTrades.values())
    .sort((a, b) => b.created - a.created)
}

/**
 * Hook para buscar trades da liga
 */
export function useTrades(leagueId: string | undefined) {
  return useQuery({
    queryKey: ['trades', leagueId],
    queryFn: () => fetchTransactions(leagueId!),
    enabled: !!leagueId,
    staleTime: CACHE_TIMES.LEAGUE_DATA,
  })
}

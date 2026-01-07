/**
 * useIDPLeaders Hook
 * Busca os líderes de stats defensivas da ESPN
 */

import { useQuery } from '@tanstack/react-query'
import { ESPN_API, IDP_CACHE_TIMES, LEADERS_LIMIT } from '../constants'
import type { ESPNLeaderCategory } from '../types'

interface LeaderEntry {
  athleteId: string
  value: number
  category: string
}

interface LeadersData {
  tackles: LeaderEntry[]
  sacks: LeaderEntry[]
  passesDefended: LeaderEntry[]
  interceptions: LeaderEntry[]
  allAthleteIds: string[]
}

async function fetchLeaders(season: string): Promise<LeadersData> {
  const url = ESPN_API.LEADERS.replace('{season}', season)

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Erro ao buscar leaders: ${response.status}`)
  }

  const data = await response.json()

  // A API retorna categories na raiz do objeto
  const categories = data?.categories || []

  const result: LeadersData = {
    tackles: [],
    sacks: [],
    passesDefended: [],
    interceptions: [],
    allAthleteIds: [],
  }

  const athleteIdSet = new Set<string>()

  for (const category of categories as ESPNLeaderCategory[]) {
    const categoryName = category.name?.toLowerCase() || ''

    // Mapeia categoria para nosso formato
    let targetArray: LeaderEntry[] | null = null
    let categoryKey = ''

    if (categoryName.includes('tackle') || categoryName === 'totaltackles') {
      targetArray = result.tackles
      categoryKey = 'tackles'
    } else if (categoryName.includes('sack')) {
      targetArray = result.sacks
      categoryKey = 'sacks'
    } else if (categoryName.includes('passesdefended') || categoryName.includes('passes defended')) {
      targetArray = result.passesDefended
      categoryKey = 'passesDefended'
    } else if (categoryName.includes('interception')) {
      targetArray = result.interceptions
      categoryKey = 'interceptions'
    }

    if (targetArray && category.leaders) {
      for (const leader of category.leaders.slice(0, LEADERS_LIMIT)) {
        // Extrai o ID do atleta da referência
        let athleteId = ''

        if (leader.athlete?.$ref) {
          // Extrai ID da URL: .../athletes/12345
          const match = leader.athlete.$ref.match(/athletes\/(\d+)/)
          if (match) {
            athleteId = match[1]
          }
        } else if (leader.athlete?.id) {
          athleteId = leader.athlete.id
        }

        if (athleteId) {
          targetArray.push({
            athleteId,
            value: leader.value,
            category: categoryKey,
          })
          athleteIdSet.add(athleteId)
        }
      }
    }
  }

  result.allAthleteIds = Array.from(athleteIdSet)

  return result
}

/**
 * Hook para buscar líderes defensivos da ESPN
 * @param season - Temporada (ex: '2024')
 * @returns Query result com dados dos líderes
 */
export function useIDPLeaders(season: string) {
  return useQuery({
    queryKey: ['idp-leaders', season],
    queryFn: () => fetchLeaders(season),
    staleTime: IDP_CACHE_TIMES.LEADERS,
    enabled: !!season,
  })
}

/**
 * Combina stats de múltiplas categorias para um atleta
 * NOTA: TFL e FF não estão disponíveis no endpoint de leaders da ESPN
 * Retornamos 0 para manter consistência com stats de temporada
 */
export function combineLeaderStats(
  athleteId: string,
  leadersData: LeadersData
): { tackles: number; sacks: number; pd: number; int: number; tfl: number; ff: number } {
  const tackles = leadersData.tackles.find(l => l.athleteId === athleteId)?.value || 0
  const sacks = leadersData.sacks.find(l => l.athleteId === athleteId)?.value || 0
  const pd = leadersData.passesDefended.find(l => l.athleteId === athleteId)?.value || 0
  const int = leadersData.interceptions.find(l => l.athleteId === athleteId)?.value || 0
  // TFL e FF não disponíveis no leaders - ESPN não fornece essas categorias
  const tfl = 0
  const ff = 0

  return { tackles, sacks, pd, int, tfl, ff }
}

/**
 * useIDPAthlete Hook
 * Busca detalhes de um atleta específico da ESPN
 */

import { useQuery, useQueries } from '@tanstack/react-query'
import { ESPN_API, IDP_CACHE_TIMES, POSITION_MAP } from '../constants'
import type { IDPPlayer, IDPStats, ESPNPosition, FantasyPosition } from '../types'

export interface AthleteBasicInfo {
  id: string
  name: string
  team: string
  teamAbbr: string
  photoUrl?: string
  espnPosition: string
  age?: number
  experience?: number
  jerseyNumber?: string
  // Stats detalhadas (preenchidas depois)
  detailedStats?: {
    tackles: number
    soloTackles: number
    sacks: number
    tfl: number
    forcedFumbles: number
    passesDefended: number
    interceptions: number
  }
}

async function fetchAthlete(athleteId: string, season: string = '2025'): Promise<AthleteBasicInfo | null> {
  const url = ESPN_API.ATHLETE.replace('{id}', athleteId)
  // Usa stats da TEMPORADA, não carreira!
  const statsUrl = ESPN_API.STATS_SEASON
    .replace('{season}', season)
    .replace('{id}', athleteId)

  try {
    // Busca info básica e stats da TEMPORADA em paralelo
    const [athleteResponse, statsResponse] = await Promise.all([
      fetch(url),
      fetch(statsUrl)
    ])

    if (!athleteResponse.ok) {
      console.warn(`Falha ao buscar atleta ${athleteId}: ${athleteResponse.status}`)
      return null
    }

    const data = await athleteResponse.json()

    // Extrai abreviação do time da referência
    let teamAbbr = ''
    if (data.team?.$ref) {
      teamAbbr = data.team?.abbreviation || ''
    }

    // Parse stats detalhadas
    let detailedStats = undefined
    if (statsResponse.ok) {
      try {
        const statsData = await statsResponse.json()
        detailedStats = parseDetailedStats(statsData)
      } catch {
        // Stats não disponíveis, continua sem elas
      }
    }

    return {
      id: data.id,
      name: data.displayName || `${data.firstName} ${data.lastName}`,
      team: data.team?.displayName || '',
      teamAbbr: teamAbbr,
      photoUrl: data.headshot?.href || ESPN_API.PHOTO.replace('{id}', athleteId),
      espnPosition: data.position?.abbreviation || 'LB',
      age: data.age,
      experience: data.experience?.years,
      jerseyNumber: data.jersey,
      detailedStats,
    }
  } catch (error) {
    console.error(`Erro ao buscar atleta ${athleteId}:`, error)
    return null
  }
}

/**
 * Parse das stats detalhadas do endpoint de statistics
 */
function parseDetailedStats(statsData: unknown): AthleteBasicInfo['detailedStats'] {
  const stats = {
    tackles: 0,
    soloTackles: 0,
    sacks: 0,
    tfl: 0,
    forcedFumbles: 0,
    passesDefended: 0,
    interceptions: 0,
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = statsData as any
    const splits = data?.splits?.categories || []

    for (const category of splits) {
      const categoryStats = category?.stats || []
      for (const stat of categoryStats) {
        const name = stat?.name?.toLowerCase() || ''
        const value = stat?.value || 0

        if (name === 'totaltackles' || name === 'combinedtackles') {
          stats.tackles = value
        } else if (name === 'solotackles') {
          stats.soloTackles = value
        } else if (name === 'sacks') {
          stats.sacks = value
        } else if (name === 'tacklesforloss' || name === 'stuffs') {
          stats.tfl = value
        } else if (name === 'forcedfumbles') {
          stats.forcedFumbles = value
        } else if (name === 'passesdefended') {
          stats.passesDefended = value
        } else if (name === 'interceptions') {
          stats.interceptions = value
        }
      }
    }
  } catch {
    // Falha no parse, retorna stats zeradas
  }

  return stats
}

/**
 * Função para buscar stats detalhadas de um atleta (carreira)
 * Reservada para uso futuro quando precisarmos de stats mais completas
 */
export async function fetchAthleteDetailedStats(athleteId: string): Promise<Partial<IDPStats> | null> {
  const url = ESPN_API.STATS_CAREER.replace('{id}', athleteId)

  try {
    const response = await fetch(url)

    if (!response.ok) {
      return null
    }

    const data = await response.json()

    const stats: Partial<IDPStats> = {
      tackles: 0,
      soloTackles: 0,
      assistTackles: 0,
      sacks: 0,
      tfl: 0,
      forcedFumbles: 0,
      passesDefended: 0,
      interceptions: 0,
    }

    // Navega pelas categorias de stats
    const categories = data?.splits?.categories || []

    for (const category of categories) {
      if (category.name === 'defensive' || category.name === 'general') {
        for (const stat of category.stats || []) {
          const name = stat.name?.toLowerCase() || ''
          const value = stat.value || 0

          if (name === 'totaltackles' || name === 'tackles') {
            stats.tackles = value
          } else if (name === 'solotackles') {
            stats.soloTackles = value
          } else if (name === 'assisttackles') {
            stats.assistTackles = value
          } else if (name === 'sacks') {
            stats.sacks = value
          } else if (name === 'stuffs' || name === 'tacklesforloss') {
            stats.tfl = value
          } else if (name === 'forcedfumbles') {
            stats.forcedFumbles = value
          } else if (name === 'passesdefended') {
            stats.passesDefended = value
          } else if (name === 'interceptions') {
            stats.interceptions = value
          }
        }
      }
    }

    return stats
  } catch (error) {
    console.error(`Erro ao buscar stats do atleta ${athleteId}:`, error)
    return null
  }
}

/**
 * Hook para buscar um atleta específico
 */
export function useIDPAthlete(athleteId: string | undefined) {
  return useQuery({
    queryKey: ['idp-athlete', athleteId],
    queryFn: () => fetchAthlete(athleteId!),
    staleTime: IDP_CACHE_TIMES.ATHLETE,
    enabled: !!athleteId,
  })
}

/**
 * Hook para buscar múltiplos atletas em paralelo
 */
export function useIDPAthletes(athleteIds: string[]) {
  return useQueries({
    queries: athleteIds.map((id) => ({
      queryKey: ['idp-athlete', id],
      queryFn: () => fetchAthlete(id),
      staleTime: IDP_CACHE_TIMES.ATHLETE,
      enabled: !!id,
    })),
  })
}

/**
 * Converte posição ESPN para posição Fantasy
 */
export function toFantasyPosition(espnPosition: string): FantasyPosition {
  const pos = espnPosition.toUpperCase() as ESPNPosition
  return POSITION_MAP[pos] || 'LB' // Default para LB se não encontrar
}

/**
 * Constrói um IDPPlayer completo a partir dos dados básicos e stats
 * Combina:
 * - leaderStats: tackles, sacks, pd, int (do endpoint de leaders - mais preciso)
 * - detailedStats: tfl, ff, soloTackles (do endpoint de stats da temporada)
 */
export function buildIDPPlayer(
  basicInfo: AthleteBasicInfo,
  leaderStats: { tackles: number; sacks: number; pd: number; int: number; tfl: number; ff: number }
): IDPPlayer {
  const fantasyPosition = toFantasyPosition(basicInfo.espnPosition)
  const detailed = basicInfo.detailedStats

  return {
    id: basicInfo.id,
    name: basicInfo.name,
    team: basicInfo.team,
    teamAbbr: basicInfo.teamAbbr,
    photoUrl: basicInfo.photoUrl,
    espnPosition: basicInfo.espnPosition as ESPNPosition,
    fantasyPosition,
    age: basicInfo.age,
    experience: basicInfo.experience,
    jerseyNumber: basicInfo.jerseyNumber,
    stats: {
      // Stats principais do leaders (mais preciso para a temporada)
      tackles: leaderStats.tackles || detailed?.tackles || 0,
      sacks: leaderStats.sacks || detailed?.sacks || 0,
      passesDefended: leaderStats.pd || detailed?.passesDefended || 0,
      interceptions: leaderStats.int || detailed?.interceptions || 0,
      // Stats complementares do endpoint de temporada
      soloTackles: detailed?.soloTackles || Math.round((leaderStats.tackles || 0) * 0.6),
      assistTackles: (leaderStats.tackles || 0) - (detailed?.soloTackles || Math.round((leaderStats.tackles || 0) * 0.6)),
      tfl: detailed?.tfl || 0,
      forcedFumbles: detailed?.forcedFumbles || 0,
    },
  }
}

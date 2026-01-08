/**
 * useAvailableSeasons Hook
 * Busca temporadas disponíveis do backend
 */

import { useQuery } from '@tanstack/react-query'
import { STATS_API } from '../constants'

interface SeasonsResponse {
  seasons: number[]
  latest: number
}

async function fetchAvailableSeasons(): Promise<SeasonsResponse> {
  const url = `${STATS_API.BASE_URL}/api/seasons`

  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Erro ao buscar temporadas: ${response.status}`)
    }
    return response.json()
  } catch {
    // Fallback se o backend não responder
    return {
      seasons: [2024, 2023, 2022, 2021, 2020],
      latest: 2024,
    }
  }
}

/**
 * Hook para buscar temporadas disponíveis
 */
export function useAvailableSeasons() {
  return useQuery({
    queryKey: ['available-seasons'],
    queryFn: fetchAvailableSeasons,
    staleTime: 1000 * 60 * 60 * 24, // 24 horas
  })
}

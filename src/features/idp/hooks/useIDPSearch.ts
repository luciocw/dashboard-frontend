/**
 * useIDPSearch Hook
 * Hook combinado que busca, filtra e enriquece jogadores IDP
 */

import { useMemo, useState } from 'react'
import { useIDPLeaders, combineLeaderStats } from './useIDPLeaders'
import { useIDPAthletes, buildIDPPlayer } from './useIDPAthlete'
import { usePlayers } from '@/hooks/usePlayers'
import { enrichPlayersWithSleeperData } from '../utils/matching'
import { applyFilters, sortPlayers, type SortColumn, type SortDirection } from '../utils/filters'
import { DEFAULT_FILTERS, POSITION_MAP } from '../constants'
import type { IDPPlayer, IDPFilters, FantasyPosition } from '../types'
import type { ScoringSettings } from '@/types/sleeper'

interface UseIDPSearchOptions {
  season?: string
  myRosterPlayerIds?: string[]
  initialFilters?: Partial<IDPFilters>
  scoringSettings?: ScoringSettings
}

interface UseIDPSearchResult {
  players: IDPPlayer[]
  filteredPlayers: IDPPlayer[]
  isLoading: boolean
  isError: boolean
  error: Error | null

  // Filtros
  filters: IDPFilters
  setFilters: (filters: IDPFilters) => void
  updateFilter: <K extends keyof IDPFilters>(key: K, value: IDPFilters[K]) => void
  resetFilters: () => void

  // Ordenação
  sortColumn: SortColumn
  sortDirection: SortDirection
  setSorting: (column: SortColumn, direction?: SortDirection) => void

  // Contadores
  totalCount: number
  filteredCount: number
}

/**
 * Hook principal para busca de IDPs
 * Combina dados da ESPN com dados do Sleeper e aplica filtros
 */
export function useIDPSearch(options: UseIDPSearchOptions = {}): UseIDPSearchResult {
  const {
    season = DEFAULT_FILTERS.season,
    myRosterPlayerIds = [],
    initialFilters = {},
    scoringSettings,
  } = options

  // Estado de filtros
  const [filters, setFilters] = useState<IDPFilters>({
    ...DEFAULT_FILTERS,
    ...initialFilters,
    season,
  })

  // Estado de ordenação
  const [sortColumn, setSortColumn] = useState<SortColumn>('tackles')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  // Busca leaders da ESPN
  const {
    data: leadersData,
    isLoading: isLoadingLeaders,
    isError: isErrorLeaders,
    error: errorLeaders,
  } = useIDPLeaders(filters.season)

  // Extrai IDs de atletas únicos
  const athleteIds = useMemo(() => {
    return leadersData?.allAthleteIds || []
  }, [leadersData])

  // Busca detalhes de cada atleta
  const athleteQueries = useIDPAthletes(athleteIds)

  // Busca jogadores do Sleeper para matching
  const { data: sleeperPlayers } = usePlayers()

  // Verifica se ainda está carregando atletas
  const isLoadingAthletes = athleteQueries.some((q) => q.isLoading)
  const isErrorAthletes = athleteQueries.some((q) => q.isError)

  // Constrói lista de jogadores
  const players = useMemo(() => {
    if (!leadersData || athleteQueries.length === 0) return []

    const result: IDPPlayer[] = []

    for (const query of athleteQueries) {
      if (!query.data) continue

      const athleteInfo = query.data
      const espnPos = athleteInfo.espnPosition?.toUpperCase()

      // Verifica se é uma posição defensiva
      if (!POSITION_MAP[espnPos as keyof typeof POSITION_MAP]) {
        continue
      }

      const leaderStats = combineLeaderStats(athleteInfo.id, leadersData)

      const player = buildIDPPlayer(athleteInfo, leaderStats)

      // Só adiciona se tiver alguma stat relevante
      if (leaderStats.tackles > 0 || leaderStats.sacks > 0 || leaderStats.pd > 0) {
        result.push(player)
      }
    }

    return result
  }, [leadersData, athleteQueries])

  // Enriquece com dados do Sleeper (badge "Já tenho")
  const enrichedPlayers = useMemo(() => {
    if (!sleeperPlayers || players.length === 0) return players

    return enrichPlayersWithSleeperData(
      players,
      sleeperPlayers,
      myRosterPlayerIds
    )
  }, [players, sleeperPlayers, myRosterPlayerIds])

  // Aplica filtros
  const filteredPlayers = useMemo(() => {
    const filtered = applyFilters(enrichedPlayers, filters)
    return sortPlayers(filtered, sortColumn, sortDirection, scoringSettings)
  }, [enrichedPlayers, filters, sortColumn, sortDirection, scoringSettings])

  // Funções de filtro
  const updateFilter = <K extends keyof IDPFilters>(
    key: K,
    value: IDPFilters[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const resetFilters = () => {
    setFilters({ ...DEFAULT_FILTERS, season: filters.season })
  }

  // Função de ordenação
  const setSorting = (column: SortColumn, direction?: SortDirection) => {
    if (column === sortColumn && !direction) {
      // Toggle direction se clicar na mesma coluna
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortColumn(column)
      setSortDirection(direction || 'desc')
    }
  }

  return {
    players: enrichedPlayers,
    filteredPlayers,
    isLoading: isLoadingLeaders || isLoadingAthletes,
    isError: isErrorLeaders || isErrorAthletes,
    error: errorLeaders || null,

    filters,
    setFilters,
    updateFilter,
    resetFilters,

    sortColumn,
    sortDirection,
    setSorting,

    totalCount: enrichedPlayers.length,
    filteredCount: filteredPlayers.length,
  }
}

/**
 * Hook simplificado para buscar apenas uma posição
 */
export function useIDPByPosition(
  position: FantasyPosition,
  options: Omit<UseIDPSearchOptions, 'initialFilters'> = {}
): UseIDPSearchResult {
  return useIDPSearch({
    ...options,
    initialFilters: {
      positions: [position],
    },
  })
}

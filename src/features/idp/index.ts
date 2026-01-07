/**
 * IDP Explorer Feature
 * Busca e seleção de Individual Defensive Players
 */

// Types
export * from './types'

// Constants
export * from './constants'

// Hooks
export { useIDPLeaders, combineLeaderStats } from './hooks/useIDPLeaders'
export { useIDPAthlete, useIDPAthletes, toFantasyPosition, buildIDPPlayer } from './hooks/useIDPAthlete'
export { useIDPSearch, useIDPByPosition } from './hooks/useIDPSearch'

// Utils
export * from './utils/matching'
export * from './utils/filters'

// Components
export { IDPExplorerView } from './components/IDPExplorerView'
export { IDPFilters } from './components/IDPFilters'
export { IDPTable } from './components/IDPTable'
export { IDPPlayerCard } from './components/IDPPlayerCard'

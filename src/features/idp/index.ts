/**
 * IDP Explorer Feature
 * Busca e seleção de Individual Defensive Players
 */

// Types
export * from './types'

// Constants
export * from './constants'

// Hooks
export { useIDPLeaders } from './hooks/useIDPLeaders'
export { useIDPSearch, useIDPByPosition } from './hooks/useIDPSearch'
export { useAvailableSeasons } from './hooks/useAvailableSeasons'

// Utils
export * from './utils/matching'
export * from './utils/filters'

// Components
export { IDPExplorerView } from './components/IDPExplorerView'
export { IDPFilters } from './components/IDPFilters'
export { IDPTable } from './components/IDPTable'
export { IDPPlayerCard } from './components/IDPPlayerCard'

/**
 * Trade Calculator Constants
 * Valores seed para jogadores e picks (0-100)
 */

import type { FilterPosition } from './types'

/**
 * Ícones por categoria
 */
export const CATEGORY_ICONS: Record<string, string> = {
  offense: '🏈',
  defense: '🛡️',
  picks: '📋',
}

/**
 * Ícones por posição
 */
export const POSITION_ICONS: Record<string, string> = {
  QB: '🎯',
  RB: '🏃',
  WR: '🙌',
  TE: '🤲',
  K: '🦵',
  DL: '🛡️',
  LB: '💪',
  DB: '🔒',
  PICKS: '📋',
}

/**
 * Cores por posição (reutilizando do design system)
 */
export const POSITION_COLORS: Record<string, string> = {
  QB: 'text-red-400',
  RB: 'text-green-400',
  WR: 'text-blue-400',
  TE: 'text-yellow-400',
  K: 'text-purple-400',
  DL: 'text-orange-400',
  LB: 'text-orange-400',
  DB: 'text-orange-400',
}

export const POSITION_BG: Record<string, string> = {
  QB: 'bg-red-500/20',
  RB: 'bg-green-500/20',
  WR: 'bg-blue-500/20',
  TE: 'bg-yellow-500/20',
  K: 'bg-purple-500/20',
  DL: 'bg-orange-500/20',
  LB: 'bg-orange-500/20',
  DB: 'bg-orange-500/20',
}

/**
 * Filtros de posição disponíveis
 */
export const POSITION_FILTERS: FilterPosition[] = [
  'ALL',
  'QB',
  'RB',
  'WR',
  'TE',
  'K',
  'DL',
  'LB',
  'DB',
  'PICKS',
]

/**
 * Valores de jogadores por Sleeper player_id
 * Escala 0-100 (100 = melhor do fantasy)
 *
 * Valores baseados em rankings dynasty (Janeiro 2026)
 * Fonte: KeepTradeCut, FantasyPros, Dynasty Nerds
 */
export const PLAYER_VALUES: Record<string, number> = {
  // === WIDE RECEIVERS (Top Tier) ===
  '9509': 100,  // Ja'Marr Chase
  '6794': 95,   // Justin Jefferson
  '9493': 88,   // Garrett Wilson
  '8150': 86,   // CeeDee Lamb
  '7564': 84,   // Amon-Ra St. Brown
  '9221': 82,   // Drake London
  '9225': 80,   // Chris Olave
  '8136': 78,   // Jaylen Waddle
  '7553': 76,   // Devonta Smith
  '9757': 74,   // Marvin Harrison Jr
  '11596': 73,  // Malik Nabers
  '5859': 65,   // DK Metcalf
  '5857': 63,   // AJ Brown
  '6786': 60,   // Tee Higgins
  '6801': 58,   // Brandon Aiyuk

  // === RUNNING BACKS ===
  '10229': 94,  // Bijan Robinson
  '8155': 91,   // Jahmyr Gibbs
  '7525': 85,   // Breece Hall
  '6813': 78,   // Kenneth Walker III
  '9758': 75,   // Jonathon Brooks
  '4866': 72,   // Josh Jacobs
  '6790': 70,   // Travis Etienne
  '5892': 65,   // Jonathan Taylor
  '4034': 60,   // Derrick Henry
  '6806': 58,   // Isiah Pacheco
  '7543': 55,   // Rachaad White
  '4035': 45,   // Saquon Barkley
  '7561': 50,   // Dameon Pierce

  // === QUARTERBACKS ===
  '6904': 92,   // Caleb Williams (assuming 2024 draft)
  '7523': 88,   // Anthony Richardson
  '9226': 85,   // CJ Stroud
  '6770': 82,   // Joe Burrow
  '6797': 80,   // Justin Herbert
  '4881': 78,   // Lamar Jackson
  '6768': 75,   // Jalen Hurts
  '4046': 70,   // Patrick Mahomes
  '4017': 65,   // Dak Prescott
  '7594': 60,   // Trevor Lawrence
  '6083': 55,   // Kyler Murray

  // === TIGHT ENDS ===
  '7526': 75,   // Brock Bowers (2024 draft pick)
  '5844': 68,   // Mark Andrews
  '6803': 65,   // Kyle Pitts
  '4033': 60,   // Travis Kelce
  '7610': 55,   // Dalton Kincaid
  '6798': 50,   // Trey McBride
  '5549': 45,   // George Kittle
  '8148': 42,   // Sam LaPorta

  // === IDP - LINEBACKERS ===
  '7547': 68,   // Micah Parsons
  '4988': 55,   // Fred Warner
  '7569': 52,   // Roquan Smith
  '8158': 48,   // Devin Lloyd
  '9234': 45,   // Jack Campbell

  // === IDP - DEFENSIVE LINE ===
  '4029': 58,   // Myles Garrett
  '7090': 55,   // Nick Bosa
  '5022': 50,   // Maxx Crosby
  '9240': 48,   // Will Anderson Jr
  '8164': 45,   // Aidan Hutchinson

  // === IDP - DEFENSIVE BACKS ===
  '9228': 45,   // Sauce Gardner
  '7563': 42,   // Derek Stingley Jr
  '4602': 40,   // Derwin James
  '6955': 38,   // Antoine Winfield Jr
  '8159': 36,   // Kyle Hamilton
}

/**
 * Valores de picks
 * Formato: {year}-{round}-{range}
 * Range: early (1-4), mid (5-8), late (9-12) para 1st round
 * Rounds 2+ não têm range
 */
export const PICK_VALUES: Record<string, number> = {
  // 2025 Picks (próximo draft - mais valiosos)
  '2025-1-early': 85,
  '2025-1-mid': 70,
  '2025-1-late': 55,
  '2025-2-early': 35,
  '2025-2-mid': 28,
  '2025-2-late': 22,
  '2025-3': 12,
  '2025-4': 5,

  // 2026 Picks
  '2026-1-early': 75,
  '2026-1-mid': 60,
  '2026-1-late': 45,
  '2026-2-early': 28,
  '2026-2-mid': 23,
  '2026-2-late': 18,
  '2026-3': 10,
  '2026-4': 4,

  // 2027 Picks (mais distantes - menos valiosos)
  '2027-1-early': 65,
  '2027-1-mid': 50,
  '2027-1-late': 38,
  '2027-2-early': 22,
  '2027-2-mid': 18,
  '2027-2-late': 14,
  '2027-3': 8,
  '2027-4': 3,

  // 2028 Picks
  '2028-1-early': 55,
  '2028-1-mid': 42,
  '2028-1-late': 32,
  '2028-2-early': 18,
  '2028-2-mid': 14,
  '2028-2-late': 10,
  '2028-3': 6,
  '2028-4': 2,
}

/**
 * Anos disponíveis para picks
 */
export const PICK_YEARS = [2025, 2026, 2027, 2028]

/**
 * Rounds disponíveis
 */
export const PICK_ROUNDS = [1, 2, 3, 4]

/**
 * Ranges para 1st e 2nd round picks
 */
export const PICK_RANGES: Array<{ value: 'early' | 'mid' | 'late'; label: string }> = [
  { value: 'early', label: 'Early (1-4)' },
  { value: 'mid', label: 'Mid (5-8)' },
  { value: 'late', label: 'Late (9-12)' },
]

/**
 * Gera o ID de um pick
 */
export function getPickId(year: number, round: number, range?: 'early' | 'mid' | 'late'): string {
  if (round <= 2 && range) {
    return `${year}-${round}-${range}`
  }
  return `${year}-${round}`
}

/**
 * Gera o label de um pick
 */
export function getPickLabel(year: number, round: number, range?: 'early' | 'mid' | 'late'): string {
  const roundSuffix = round === 1 ? 'st' : round === 2 ? 'nd' : round === 3 ? 'rd' : 'th'
  const roundLabel = `${round}${roundSuffix}`

  if (round <= 2 && range) {
    const rangeLabel = range.charAt(0).toUpperCase() + range.slice(1)
    return `${year} ${roundLabel} (${rangeLabel})`
  }
  return `${year} ${roundLabel}`
}

/**
 * Obtém o valor de um pick
 */
export function getPickValue(year: number, round: number, range?: 'early' | 'mid' | 'late'): number {
  const id = getPickId(year, round, range)
  return PICK_VALUES[id] || 0
}

/**
 * Obtém o valor de um jogador pelo ID
 * Retorna 0 se não encontrado (jogador sem valor definido)
 */
export function getPlayerValue(playerId: string): number {
  return PLAYER_VALUES[playerId] || 0
}

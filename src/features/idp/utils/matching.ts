/**
 * Matching Utils
 * Utilitários para fazer match entre jogadores ESPN e Sleeper
 */

import type { PlayersMap, NFLPlayer } from '@/hooks/usePlayers'
import type { IDPPlayer } from '../types'
import { ESPN_TO_SLEEPER_TEAM } from '../constants'

/**
 * Normaliza um nome para comparação
 * Remove acentos, sufixos (Jr., III, etc.), e converte para lowercase
 */
export function normalizeNameForMatch(name: string): string {
  if (!name) return ''

  return name
    .toLowerCase()
    // Remove acentos
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Remove sufixos comuns
    .replace(/\s+(jr\.?|sr\.?|ii|iii|iv|v)$/i, '')
    // Remove pontuação
    .replace(/[.',-]/g, '')
    // Remove espaços extras
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Converte abreviação de time ESPN para Sleeper
 */
export function espnTeamToSleeper(espnTeam: string): string {
  if (!espnTeam) return ''
  const upper = espnTeam.toUpperCase()
  return ESPN_TO_SLEEPER_TEAM[upper] || upper
}

/**
 * Encontra um jogador Sleeper correspondente a um jogador ESPN
 */
export function findSleeperMatch(
  espnPlayer: IDPPlayer,
  sleeperPlayers: PlayersMap
): NFLPlayer | null {
  if (!espnPlayer || !sleeperPlayers) return null

  const normalizedEspnName = normalizeNameForMatch(espnPlayer.name)
  const espnTeamSleeper = espnTeamToSleeper(espnPlayer.teamAbbr)

  // Busca por nome + time (mais preciso)
  for (const player of Object.values(sleeperPlayers)) {
    const normalizedSleeperName = normalizeNameForMatch(player.full_name || `${player.first_name} ${player.last_name}`)

    // Match exato de nome + time
    if (
      normalizedSleeperName === normalizedEspnName &&
      player.team === espnTeamSleeper
    ) {
      return player
    }
  }

  // Fallback: busca só por nome (menos preciso, pode dar falso positivo)
  for (const player of Object.values(sleeperPlayers)) {
    const normalizedSleeperName = normalizeNameForMatch(player.full_name || `${player.first_name} ${player.last_name}`)

    if (normalizedSleeperName === normalizedEspnName) {
      return player
    }
  }

  return null
}

/**
 * Verifica se um jogador está no roster do usuário
 */
export function isPlayerInRoster(
  espnPlayer: IDPPlayer,
  sleeperPlayers: PlayersMap,
  myRosterPlayerIds: string[]
): boolean {
  if (!myRosterPlayerIds || myRosterPlayerIds.length === 0) return false

  const sleeperMatch = findSleeperMatch(espnPlayer, sleeperPlayers)

  if (!sleeperMatch) return false

  return myRosterPlayerIds.includes(sleeperMatch.player_id)
}

/**
 * Enriquece um jogador ESPN com dados do Sleeper
 */
export function enrichWithSleeperData(
  espnPlayer: IDPPlayer,
  sleeperPlayers: PlayersMap,
  myRosterPlayerIds: string[]
): IDPPlayer {
  const sleeperMatch = findSleeperMatch(espnPlayer, sleeperPlayers)

  return {
    ...espnPlayer,
    sleeperPlayerId: sleeperMatch?.player_id,
    isInMyRoster: sleeperMatch
      ? myRosterPlayerIds.includes(sleeperMatch.player_id)
      : false,
  }
}

/**
 * Enriquece múltiplos jogadores com dados do Sleeper
 */
export function enrichPlayersWithSleeperData(
  espnPlayers: IDPPlayer[],
  sleeperPlayers: PlayersMap,
  myRosterPlayerIds: string[]
): IDPPlayer[] {
  return espnPlayers.map((player) =>
    enrichWithSleeperData(player, sleeperPlayers, myRosterPlayerIds)
  )
}

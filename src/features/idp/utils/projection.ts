/**
 * Projection Utils
 * Calcula projeção de pontos baseado nas scoring_settings da liga
 */

import type { ScoringSettings } from '@/types/sleeper'
import type { IDPPlayer } from '../types'

/**
 * Resultado do cálculo de projeção
 */
export interface ProjectionResult {
  totalPoints: number
  breakdown: ProjectionBreakdown[]
}

export interface ProjectionBreakdown {
  stat: string
  label: string
  value: number
  pointsPer: number
  points: number
}

/**
 * Valores padrão de scoring IDP (caso a liga não tenha configurado)
 */
export const DEFAULT_IDP_SCORING: Partial<ScoringSettings> = {
  tkl_solo: 1,
  tkl_ast: 0.5,
  tkl_loss: 1,
  sack: 2,
  int: 3,
  pass_def: 1,
  ff: 2,
  fum_rec: 2,
}

/**
 * Calcula a projeção de pontos IDP para um jogador
 * @param player - Jogador IDP com stats
 * @param scoring - Configurações de pontuação da liga
 * @returns Resultado com total e breakdown por stat
 */
export function calculateIDPProjection(
  player: IDPPlayer,
  scoring: ScoringSettings | undefined
): ProjectionResult {
  // Usa scoring da liga ou valores padrão
  const s = scoring || DEFAULT_IDP_SCORING

  const breakdown: ProjectionBreakdown[] = []
  let totalPoints = 0

  // Solo Tackles
  if (player.stats.soloTackles > 0) {
    const pts = player.stats.soloTackles * (s.tkl_solo || 0)
    breakdown.push({
      stat: 'tkl_solo',
      label: 'Solo Tackles',
      value: player.stats.soloTackles,
      pointsPer: s.tkl_solo || 0,
      points: pts,
    })
    totalPoints += pts
  }

  // Assisted Tackles (tackles - soloTackles = assisted)
  const assistedTackles = player.stats.tackles - player.stats.soloTackles
  if (assistedTackles > 0) {
    const pts = assistedTackles * (s.tkl_ast || 0)
    breakdown.push({
      stat: 'tkl_ast',
      label: 'Assisted Tackles',
      value: assistedTackles,
      pointsPer: s.tkl_ast || 0,
      points: pts,
    })
    totalPoints += pts
  }

  // Tackle for Loss (TFL)
  if (player.stats.tfl > 0) {
    const pts = player.stats.tfl * (s.tkl_loss || 0)
    breakdown.push({
      stat: 'tkl_loss',
      label: 'Tackles for Loss',
      value: player.stats.tfl,
      pointsPer: s.tkl_loss || 0,
      points: pts,
    })
    totalPoints += pts
  }

  // Sacks
  if (player.stats.sacks > 0) {
    const pts = player.stats.sacks * (s.sack || 0)
    breakdown.push({
      stat: 'sack',
      label: 'Sacks',
      value: player.stats.sacks,
      pointsPer: s.sack || 0,
      points: pts,
    })
    totalPoints += pts
  }

  // Interceptions
  if (player.stats.interceptions > 0) {
    const pts = player.stats.interceptions * (s.int || 0)
    breakdown.push({
      stat: 'int',
      label: 'Interceptions',
      value: player.stats.interceptions,
      pointsPer: s.int || 0,
      points: pts,
    })
    totalPoints += pts
  }

  // Passes Defended
  if (player.stats.passesDefended > 0) {
    const pts = player.stats.passesDefended * (s.pass_def || 0)
    breakdown.push({
      stat: 'pass_def',
      label: 'Passes Defended',
      value: player.stats.passesDefended,
      pointsPer: s.pass_def || 0,
      points: pts,
    })
    totalPoints += pts
  }

  // Forced Fumbles
  if (player.stats.forcedFumbles > 0) {
    const pts = player.stats.forcedFumbles * (s.ff || 0)
    breakdown.push({
      stat: 'ff',
      label: 'Forced Fumbles',
      value: player.stats.forcedFumbles,
      pointsPer: s.ff || 0,
      points: pts,
    })
    totalPoints += pts
  }

  // Tackle geral (bonus que stacka) - só se configurado
  if (s.tkl && s.tkl > 0) {
    const pts = player.stats.tackles * s.tkl
    breakdown.push({
      stat: 'tkl',
      label: 'Tackles (Bonus)',
      value: player.stats.tackles,
      pointsPer: s.tkl,
      points: pts,
    })
    totalPoints += pts
  }

  return {
    totalPoints: Math.round(totalPoints * 10) / 10, // 1 casa decimal
    breakdown: breakdown.filter(b => b.points > 0), // Remove zeros
  }
}

/**
 * Formata pontos para exibição
 */
export function formatPoints(points: number): string {
  if (points === 0) return '0'
  if (Number.isInteger(points)) return points.toString()
  return points.toFixed(1)
}

/**
 * Verifica se a liga tem scoring IDP configurado
 */
export function hasIDPScoring(scoring: ScoringSettings | undefined): boolean {
  if (!scoring) return false
  return !!(
    scoring.tkl_solo ||
    scoring.tkl_ast ||
    scoring.sack ||
    scoring.int ||
    scoring.pass_def ||
    scoring.ff
  )
}

/**
 * Retorna um resumo do scoring IDP da liga
 */
export function getIDPScoringDescription(scoring: ScoringSettings | undefined): string {
  if (!scoring || !hasIDPScoring(scoring)) {
    return 'Scoring padrão'
  }

  const parts: string[] = []

  if (scoring.tkl_solo) parts.push(`Solo ${scoring.tkl_solo}pt`)
  if (scoring.tkl_ast) parts.push(`Ast ${scoring.tkl_ast}pt`)
  if (scoring.sack) parts.push(`Sack ${scoring.sack}pt`)
  if (scoring.int) parts.push(`INT ${scoring.int}pt`)

  return parts.join(' | ') || 'Scoring padrão'
}

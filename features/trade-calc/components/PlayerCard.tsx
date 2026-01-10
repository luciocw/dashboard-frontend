/**
 * PlayerCard Component
 * Card de jogador no trade com Dynasty Pulse info
 */

import { memo } from 'react'
import { X, TrendingUp, TrendingDown, Minus, Zap } from 'lucide-react'
import type { TradePlayer } from '../types'
import { POSITION_COLORS, POSITION_BG } from '../constants'
import {
  useDynastyPulse,
  getDynastyPulseBreakdown,
  formatScoringAdjustments,
  type LeagueAdjustedBreakdown,
} from '@/hooks/useDynastyPulse'

interface PlayerCardProps {
  player: TradePlayer
  onRemove?: () => void
  compact?: boolean
  showDynastyInfo?: boolean
  // Premium: league-adjusted data
  leagueAdjustedData?: LeagueAdjustedBreakdown | null
}

// Tier colors
const TIER_COLORS: Record<string, string> = {
  elite: 'text-yellow-400',
  star: 'text-purple-400',
  starter: 'text-blue-400',
  depth: 'text-slate-400',
  replacement: 'text-slate-500',
}

// Recommendation icons and colors
const RECOMMENDATION_CONFIG: Record<string, { icon: typeof TrendingUp; color: string; label: string }> = {
  buy: { icon: TrendingUp, color: 'text-green-400', label: 'BUY' },
  hold: { icon: Minus, color: 'text-yellow-400', label: 'HOLD' },
  sell: { icon: TrendingDown, color: 'text-red-400', label: 'SELL' },
}

export const PlayerCard = memo(function PlayerCard({
  player,
  onRemove,
  compact = false,
  showDynastyInfo = true,
  leagueAdjustedData,
}: PlayerCardProps) {
  const { data: dynastyPulseValues } = useDynastyPulse()
  const breakdown = leagueAdjustedData || getDynastyPulseBreakdown(dynastyPulseValues, player.playerId)

  const posColor = POSITION_COLORS[player.position] || 'text-slate-400'
  const posBg = POSITION_BG[player.position] || 'bg-slate-700/50'

  // Dynasty Pulse info
  const vorpTier = breakdown?.vorp_tier
  const recommendation = breakdown?.dynasty_window?.recommendation
  const peakYearsLeft = breakdown?.dynasty_window?.peak_years_left

  // Premium: scoring adjustments
  const isLeagueAdjusted = !!leagueAdjustedData
  const scoringAdjustments = isLeagueAdjusted
    ? formatScoringAdjustments(leagueAdjustedData.scoring_adjustments)
    : ''

  if (compact) {
    return (
      <div className="flex items-center gap-2 px-2 py-1.5 bg-slate-800/50 rounded-lg border border-slate-700/50 group">
        <span className={`text-xs font-bold ${posColor}`}>{player.position}</span>
        <span className="text-sm text-slate-200 truncate flex-1">{player.name}</span>
        <span className="text-xs text-slate-500">{player.team}</span>
        {showDynastyInfo && vorpTier && (
          <span className={`text-[10px] font-medium uppercase ${TIER_COLORS[vorpTier] || 'text-slate-400'}`}>
            {vorpTier}
          </span>
        )}
        {isLeagueAdjusted && <Zap className="w-3 h-3 text-amber-400" />}
        <span className="text-sm font-bold text-cyan-400">{player.value}</span>
        {onRemove && (
          <button
            onClick={onRemove}
            className="p-0.5 text-slate-500 hover:text-red-400 transition opacity-0 group-hover:opacity-100"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
    )
  }

  const RecommendationIcon = recommendation ? RECOMMENDATION_CONFIG[recommendation]?.icon : null

  return (
    <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:border-slate-600 transition group">
      {/* Position */}
      <div className={`px-2 py-1 rounded text-xs font-bold ${posBg} ${posColor}`}>
        {player.position}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-slate-200 truncate">{player.name}</div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>{player.team || 'FA'}</span>
          {player.age && <span>• {player.age} yrs</span>}
          {showDynastyInfo && vorpTier && (
            <span className={`font-medium uppercase ${TIER_COLORS[vorpTier] || 'text-slate-400'}`}>
              • {vorpTier}
            </span>
          )}
        </div>
      </div>

      {/* Dynasty Pulse Recommendation */}
      {showDynastyInfo && recommendation && RecommendationIcon && (
        <div className="flex flex-col items-center">
          <div className={`flex items-center gap-1 ${RECOMMENDATION_CONFIG[recommendation].color}`}>
            <RecommendationIcon className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold">{RECOMMENDATION_CONFIG[recommendation].label}</span>
          </div>
          {peakYearsLeft !== undefined && peakYearsLeft > 0 && (
            <span className="text-[9px] text-slate-500">{peakYearsLeft}yr peak</span>
          )}
        </div>
      )}

      {/* Value */}
      <div className="text-right">
        <div className="flex items-center gap-1 justify-end">
          {isLeagueAdjusted && (
            <span title="League-adjusted value">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
            </span>
          )}
          <span className="text-lg font-bold text-cyan-400">{player.value}</span>
        </div>
        {isLeagueAdjusted && scoringAdjustments ? (
          <div className="text-[9px] text-amber-400/80 truncate max-w-[80px]" title={scoringAdjustments}>
            {scoringAdjustments}
          </div>
        ) : (
          <div className="text-[10px] text-slate-500 uppercase">value</div>
        )}
      </div>

      {/* Remove button */}
      {onRemove && (
        <button
          onClick={onRemove}
          className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded transition opacity-0 group-hover:opacity-100"
          title="Remove"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
})

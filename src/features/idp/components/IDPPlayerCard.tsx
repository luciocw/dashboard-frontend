/**
 * IDPPlayerCard Component
 * Card expandido com detalhes do jogador IDP
 */

import { memo } from 'react'
import { X, Star, Shield, Trophy, Zap } from 'lucide-react'
import type { IDPPlayer, PlayerTier } from '../types'
import type { ScoringSettings } from '@/types/sleeper'
import { getPlayerTier, isPotentialMike } from '../utils/filters'
import { calculateIDPProjection, formatPoints } from '../utils/projection'
import { IDP_POSITION_COLORS, IDP_POSITION_BG, TIER_COLORS, IDP_THRESHOLDS } from '../constants'

interface IDPPlayerCardProps {
  player: IDPPlayer
  onClose: () => void
  scoringSettings?: ScoringSettings
}

export const IDPPlayerCard = memo(function IDPPlayerCard({
  player,
  onClose,
  scoringSettings,
}: IDPPlayerCardProps) {
  const tier = getPlayerTier(player)
  const isMike = isPotentialMike(player)
  const thresholds = IDP_THRESHOLDS[player.fantasyPosition]
  const projection = calculateIDPProjection(player, scoringSettings)

  const StatBar = ({ value, max, label }: { value: number; max: number; label: string }) => {
    const percentage = Math.min((value / max) * 100, 100)
    return (
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-slate-400">{label}</span>
          <span className="text-slate-200 font-medium">{value}</span>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    )
  }

  // Obter valores de threshold de forma segura
  const getThresholdValue = (key: string): number => {
    const posThresholds = thresholds as Record<string, { tackles?: number; sacks?: number; tfl?: number; pd?: number; interceptions?: number }>
    return posThresholds.elite?.[key as keyof typeof posThresholds.elite] || 100
  }

  const TierBadge = ({ tier }: { tier: PlayerTier }) => {
    const icons = {
      elite: <Trophy className="w-3 h-3" />,
      good: <Star className="w-3 h-3" />,
      average: <Shield className="w-3 h-3" />,
    }
    const labels = {
      elite: 'Elite',
      good: 'Bom',
      average: 'Regular',
    }
    return (
      <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${TIER_COLORS[tier]}`}>
        {icons[tier]}
        {labels[tier]}
      </span>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
        {/* Header com foto */}
        <div className="relative h-32 bg-gradient-to-br from-slate-800 to-slate-900">
          {/* Foto do jogador */}
          <div className="absolute bottom-0 left-4 transform translate-y-1/2">
            <div className="w-24 h-24 rounded-full border-4 border-slate-900 overflow-hidden bg-slate-800">
              {player.photoUrl ? (
                <img
                  src={player.photoUrl}
                  alt={player.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=1e293b&color=94a3b8&size=96`
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-slate-500">
                  {player.name.charAt(0)}
                </div>
              )}
            </div>
          </div>

          {/* Badges no canto */}
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <TierBadge tier={tier} />
            {isMike && (
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-yellow-500/20 text-yellow-400">
                Mike LB
              </span>
            )}
            {player.isInMyRoster && (
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-500/20 text-green-400">
                Meu Roster
              </span>
            )}
          </div>

          {/* Botão fechar */}
          <button
            onClick={onClose}
            className="absolute top-3 left-3 p-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Info do jogador */}
        <div className="pt-14 px-4 pb-4 space-y-4">
          <div>
            <h3 className="text-xl font-bold text-white">{player.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${IDP_POSITION_BG[player.fantasyPosition]} ${IDP_POSITION_COLORS[player.fantasyPosition]}`}>
                {player.fantasyPosition}
              </span>
              <span className="text-sm text-slate-400">
                {player.teamAbbr || player.team}
              </span>
              {player.jerseyNumber && (
                <span className="text-sm text-slate-500">#{player.jerseyNumber}</span>
              )}
            </div>
          </div>

          {/* Info adicional */}
          {(player.age || player.experience) && (
            <div className="flex gap-4 text-sm">
              {player.age && (
                <div>
                  <span className="text-slate-500">Idade:</span>{' '}
                  <span className="text-slate-300">{player.age}</span>
                </div>
              )}
              {player.experience && (
                <div>
                  <span className="text-slate-500">Exp:</span>{' '}
                  <span className="text-slate-300">{player.experience} anos</span>
                </div>
              )}
            </div>
          )}

          {/* Stats principais */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider">
              Stats {player.fantasyPosition}
            </h4>

            {player.fantasyPosition === 'LB' && (
              <>
                <StatBar value={player.stats.tackles} max={getThresholdValue('tackles')} label="Tackles" />
                <StatBar value={player.stats.tfl} max={getThresholdValue('tfl')} label="TFL" />
                <StatBar value={player.stats.sacks} max={getThresholdValue('sacks')} label="Sacks" />
              </>
            )}

            {player.fantasyPosition === 'DL' && (
              <>
                <StatBar value={player.stats.sacks} max={getThresholdValue('sacks')} label="Sacks" />
                <StatBar value={player.stats.tackles} max={getThresholdValue('tackles')} label="Tackles" />
                <StatBar value={player.stats.tfl} max={getThresholdValue('tfl')} label="TFL" />
              </>
            )}

            {player.fantasyPosition === 'DB' && (
              <>
                <StatBar value={player.stats.tackles} max={getThresholdValue('tackles')} label="Tackles" />
                <StatBar value={player.stats.passesDefended} max={getThresholdValue('pd')} label="Passes Defended" />
                <StatBar value={player.stats.interceptions} max={getThresholdValue('interceptions')} label="Interceptions" />
              </>
            )}
          </div>

          {/* Stats secundárias */}
          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800">
            <div className="text-center">
              <div className="text-lg font-bold text-slate-200">{player.stats.tackles}</div>
              <div className="text-xs text-slate-500">TKL</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-slate-200">{player.stats.sacks}</div>
              <div className="text-xs text-slate-500">SCK</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-slate-200">{player.stats.passesDefended}</div>
              <div className="text-xs text-slate-500">PD</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-slate-200">{player.stats.forcedFumbles}</div>
              <div className="text-xs text-slate-500">FF</div>
            </div>
          </div>

          {/* Projeção de Pontos */}
          <div className="space-y-2 pt-3 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Zap className="w-3 h-3 text-cyan-400" />
                Projeção de Pontos
              </h4>
              <span className="text-xl font-bold text-cyan-400">
                {formatPoints(projection.totalPoints)} pts
              </span>
            </div>

            {projection.breakdown.length > 0 && (
              <div className="space-y-1 text-xs">
                {projection.breakdown.map((item) => (
                  <div key={item.stat} className="flex justify-between text-slate-400">
                    <span>
                      {item.label}: {item.value} × {item.pointsPer}
                    </span>
                    <span className="text-slate-300">{formatPoints(item.points)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
})

import { memo } from 'react'
import { useLeagueHistory } from '@/hooks/useLeagueHistory'

interface ChampionsHistoryProps {
  leagueId: string
}

export const ChampionsHistory = memo(function ChampionsHistory({ leagueId }: ChampionsHistoryProps) {
  const { data: champions, isLoading, error } = useLeagueHistory(leagueId)

  if (isLoading) {
    return (
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
        <div className="h-6 w-48 bg-slate-700 rounded animate-pulse mb-4" />
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-4 py-3">
            <div className="h-8 w-16 bg-slate-700 rounded animate-pulse" />
            <div className="h-10 w-10 bg-slate-700 rounded-full animate-pulse" />
            <div className="h-5 w-32 bg-slate-700 rounded animate-pulse" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-slate-900 rounded-xl border border-red-900/50 p-6 text-center">
        <div className="text-2xl mb-2">⚠️</div>
        <p className="text-red-400">Erro ao carregar histórico</p>
      </div>
    )
  }

  if (!champions || champions.length === 0) {
    return (
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-8 text-center">
        <div className="text-4xl mb-2">🏆</div>
        <p className="text-slate-400">Nenhum campeão registrado ainda</p>
      </div>
    )
  }

  const currentSeason = champions[0]?.season

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
      <div className="p-4 border-b border-slate-800">
        <h3 className="font-semibold flex items-center gap-2">
          🏆 Hall da Fama
          <span className="text-sm text-slate-400 font-normal">
            ({champions.length} temporada{champions.length > 1 ? 's' : ''})
          </span>
        </h3>
      </div>

      <div className="divide-y divide-slate-800">
        {champions.map((champion) => {
          const isCurrentChamp = champion.season === currentSeason

          return (
            <div
              key={champion.season}
              className={`p-4 flex items-center gap-4 ${
                isCurrentChamp ? 'bg-yellow-900/20' : ''
              }`}
            >
              {/* Ano */}
              <div className="text-center min-w-[60px]">
                <div className={`text-xl font-bold ${isCurrentChamp ? 'text-yellow-400' : 'text-slate-400'}`}>
                  {champion.season}
                </div>
                {isCurrentChamp && (
                  <div className="text-xs text-yellow-500">Atual</div>
                )}
              </div>

              {/* Avatar */}
              {champion.ownerAvatar ? (
                <img
                  src={`https://sleepercdn.com/avatars/thumbs/${champion.ownerAvatar}`}
                  alt=""
                  className={`w-12 h-12 rounded-full ${isCurrentChamp ? 'ring-2 ring-yellow-500' : ''}`}
                  loading="lazy"
                />
              ) : (
                <div className={`w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center ${
                  isCurrentChamp ? 'ring-2 ring-yellow-500' : ''
                }`}>
                  {champion.ownerName?.charAt(0) || '?'}
                </div>
              )}

              {/* Nome */}
              <div className="flex-1">
                <div className={`font-medium ${isCurrentChamp ? 'text-yellow-400' : 'text-white'}`}>
                  {champion.ownerName || 'Desconhecido'}
                </div>
                {isCurrentChamp && (
                  <div className="text-xs text-yellow-500">🏆 Campeão Reinante</div>
                )}
              </div>

              {/* Troféu - SEMPRE 🥇 para campeões */}
              <div className="text-2xl">🥇</div>
            </div>
          )
        })}
      </div>
    </div>
  )
})

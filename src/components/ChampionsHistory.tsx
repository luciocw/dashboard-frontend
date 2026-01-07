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
        <div className="animate-pulse">
          <div className="h-6 bg-slate-700 rounded w-48 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-700 rounded-full"></div>
                <div className="h-5 bg-slate-700 rounded w-32"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !champions) {
    return (
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 text-center">
        <div className="text-2xl mb-2">⚠️</div>
        <p className="text-slate-400 text-sm">Erro ao carregar histórico</p>
      </div>
    )
  }

  if (champions.length === 0) {
    return (
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 text-center">
        <div className="text-4xl mb-2">🏆</div>
        <p className="text-slate-400">Nenhum campeão registrado ainda</p>
        <p className="text-slate-500 text-sm mt-1">O histórico aparecerá após a primeira temporada completa</p>
      </div>
    )
  }

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
      <div className="p-4 border-b border-slate-800">
        <h3 className="font-semibold flex items-center gap-2">
          🏆 Hall da Fama
          <span className="text-xs text-slate-400 font-normal">({champions.length} temporadas)</span>
        </h3>
      </div>
      
      <div className="divide-y divide-slate-800">
        {champions.map((champion, index) => (
          <div 
            key={champion.season}
            className={`p-4 flex items-center gap-4 ${index === 0 ? 'bg-yellow-900/10' : ''}`}
          >
            {/* Posição/Ano */}
            <div className="text-center min-w-[60px]">
              <div className={`text-2xl font-bold ${index === 0 ? 'text-yellow-400' : 'text-slate-500'}`}>
                {champion.season}
              </div>
              {index === 0 && (
                <div className="text-xs text-yellow-500">Atual</div>
              )}
            </div>
            
            {/* Avatar */}
            {champion.ownerAvatar ? (
              <img 
                src={`https://sleepercdn.com/avatars/thumbs/${champion.ownerAvatar}`}
                alt={champion.ownerName}
                className={`w-12 h-12 rounded-full ${index === 0 ? 'ring-2 ring-yellow-500' : ''}`}
                loading="lazy"
              />
            ) : (
              <div className={`w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-lg ${index === 0 ? 'ring-2 ring-yellow-500' : ''}`}>
                {champion.ownerName.charAt(0)}
              </div>
            )}
            
            {/* Nome */}
            <div className="flex-1">
              <div className={`font-medium ${index === 0 ? 'text-yellow-400' : 'text-white'}`}>
                {champion.ownerName}
              </div>
              {index === 0 && (
                <div className="text-xs text-yellow-500/70">🏆 Campeão Reinante</div>
              )}
            </div>
            
            {/* Troféu */}
            <div className="text-2xl">
              {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏆'}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
})

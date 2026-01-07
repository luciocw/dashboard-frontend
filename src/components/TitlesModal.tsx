import { memo } from 'react'
import { useNavigate } from 'react-router-dom'
import type { UserTitle } from '@/hooks/useUserTitles'

interface TitlesModalProps {
  titles: UserTitle[]
  isOpen: boolean
  onClose: () => void
}

export const TitlesModal = memo(function TitlesModal({ 
  titles, 
  isOpen, 
  onClose 
}: TitlesModalProps) {
  const navigate = useNavigate()

  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  const handleLeagueClick = (leagueId: string) => {
    onClose()
    navigate(`/league/${leagueId}`)
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-slate-900 border border-yellow-800/50 rounded-xl w-full max-w-md max-h-[80vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-900/30 to-amber-900/30 p-4 border-b border-yellow-800/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏆</span>
            <div>
              <h2 className="font-bold text-yellow-400 text-lg">Hall da Fama</h2>
              <p className="text-xs text-yellow-600">{titles.length} título{titles.length !== 1 ? 's' : ''} conquistado{titles.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition text-slate-400 hover:text-white"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[60vh]">
          {titles.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-4xl mb-3">🎯</div>
              <p className="text-slate-400">Nenhum título ainda</p>
              <p className="text-slate-500 text-sm mt-1">Continue competindo!</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {titles.map((title, index) => (
                <button
                  key={`${title.leagueId}-${title.season}`}
                  onClick={() => handleLeagueClick(title.leagueId)}
                  className="w-full p-4 flex items-center gap-4 hover:bg-slate-800/50 transition text-left group"
                >
                  {/* Posição */}
                  <div className="text-2xl">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏆'}
                  </div>

                  {/* Avatar da Liga */}
                  {title.leagueAvatar ? (
                    <img 
                      src={`https://sleepercdn.com/avatars/thumbs/${title.leagueAvatar}`}
                      alt=""
                      className="w-10 h-10 rounded-lg"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center">
                      🏈
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white truncate group-hover:text-yellow-400 transition">
                      {title.leagueName}
                    </div>
                    <div className="text-sm text-slate-400">
                      Campeão {title.season}
                    </div>
                  </div>

                  {/* Seta */}
                  <div className="text-slate-500 group-hover:text-yellow-400 transition">
                    →
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
})

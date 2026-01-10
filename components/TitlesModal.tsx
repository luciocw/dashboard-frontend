'use client'

import { memo } from 'react'
import { useRouter } from 'next/navigation'
import { Trophy, X, ChevronRight } from 'lucide-react'

interface Title {
  season: string
  leagueId: string
  leagueName: string
  leagueAvatar?: string
}

interface TitlesModalProps {
  titles: Title[]
  isOpen: boolean
  onClose: () => void
}

export const TitlesModal = memo(function TitlesModal({
  titles,
  isOpen,
  onClose
}: TitlesModalProps) {
  const router = useRouter()

  if (!isOpen) return null

  const handleTitleClick = (leagueId: string) => {
    onClose()
    router.push(`/league/${leagueId}`)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-xl w-full max-w-md overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-gradient-to-r from-yellow-900/20 to-transparent">
          <div className="flex items-center gap-3">
            <Trophy className="h-6 w-6 text-yellow-400" />
            <div>
              <h3 className="font-bold">Hall da Fama</h3>
              <p className="text-xs text-yellow-400/80">{titles.length} título{titles.length !== 1 ? 's' : ''} conquistado{titles.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-muted-foreground hover:text-foreground transition rounded-lg hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Titles List */}
        <div className="max-h-80 overflow-y-auto">
          {titles.length === 0 ? (
            <div className="p-8 text-center">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Nenhum título ainda</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Continue competindo!</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {titles.map((title) => (
                <button
                  key={`${title.leagueId}-${title.season}`}
                  onClick={() => handleTitleClick(title.leagueId)}
                  className="w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition text-left group"
                >
                  {/* Troféu - SEMPRE 🥇 */}
                  <div className="text-2xl">🥇</div>

                  {/* League Avatar */}
                  {title.leagueAvatar ? (
                    <img
                      src={`https://sleepercdn.com/avatars/thumbs/${title.leagueAvatar}`}
                      alt={title.leagueName}
                      className="w-10 h-10 rounded-lg"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <Trophy className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate group-hover:text-primary transition">
                      {title.leagueName}
                    </div>
                    <div className="text-sm text-yellow-400">
                      Campeão {title.season}
                    </div>
                  </div>

                  {/* Arrow */}
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
})

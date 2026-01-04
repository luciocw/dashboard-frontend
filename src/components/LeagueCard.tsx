import { Card } from './ui/Card'
import { SleeperLeague } from '@/types/sleeper'

interface LeagueCardProps {
  league: SleeperLeague
  onClick?: () => void
}

export function LeagueCard({ league, onClick }: LeagueCardProps) {
  return (
    <Card hoverable onClick={onClick}>
      <div className="flex items-start gap-3 mb-4">
        {league.avatar ? (
          <img
            src={`https://sleepercdn.com/avatars/thumbs/${league.avatar}`}
            alt={league.name}
            className="w-12 h-12 rounded-lg"
          />
        ) : (
          <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center text-2xl">
            🏈
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg truncate">{league.name}</h3>
          <p className="text-slate-400 text-sm">
            {league.total_rosters} times • {league.season}
          </p>
        </div>
      </div>

      {league.settings && (
        <div className="flex gap-4 text-sm">
          <div>
            <span className="text-slate-400">Record: </span>
            <span className="font-medium">
              {league.settings.wins || 0}-{league.settings.losses || 0}
            </span>
          </div>
        </div>
      )}
    </Card>
  )
}

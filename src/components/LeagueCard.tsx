import { Badge } from './ui/Badge'
import { Avatar } from './ui/Avatar'
import type { SleeperLeague } from '@/types/sleeper'

interface LeagueCardProps {
  league: SleeperLeague
  onClick?: () => void
}

// Helpers para determinar tipo de liga
function getLeagueType(settings: SleeperLeague['settings']): string {
  switch (settings?.type) {
    case 0: return 'Redraft'
    case 1: return 'Keeper'
    case 2: return 'Dynasty'
    default: return 'Redraft'
  }
}

function getLeagueTags(league: SleeperLeague): string[] {
  const tags: string[] = []
  const positions = league.roster_positions || []
  
  // Tipo de liga
  tags.push(getLeagueType(league.settings))
  
  // Superflex?
  if (positions.filter(p => p === 'SUPER_FLEX').length > 0) {
    tags.push('SF')
  }
  
  // Quantos times
  tags.push(`${league.total_rosters}T`)
  
  // TEP (TE Premium) - verificar se existe scoring settings
  // PPR é padrão, então não adicionamos tag
  
  return tags
}

function getTagVariant(tag: string): 'default' | 'success' | 'warning' | 'info' | 'error' {
  if (tag === 'Dynasty') return 'success'
  if (tag === 'Keeper') return 'warning'
  if (tag === 'SF') return 'info'
  if (tag === 'Redraft') return 'default'
  return 'default'
}

export function LeagueCard({ league, onClick }: LeagueCardProps) {
  const tags = getLeagueTags(league)
  const avatarUrl = league.avatar 
    ? `https://sleepercdn.com/avatars/thumbs/${league.avatar}`
    : undefined

  return (
    <div
      onClick={onClick}
      className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-blue-500/50 hover:bg-slate-800/50 transition-all cursor-pointer group"
    >
      {/* Header: Avatar + Nome */}
      <div className="flex items-start gap-4 mb-4">
        <Avatar 
          src={avatarUrl} 
          fallback={league.name} 
          size="lg" 
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg text-white truncate group-hover:text-blue-400 transition-colors">
            {league.name}
          </h3>
          <p className="text-slate-400 text-sm">
            Temporada {league.season}
          </p>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {tags.map((tag, i) => (
          <Badge key={i} variant={getTagVariant(tag)}>
            {tag}
          </Badge>
        ))}
      </div>

      {/* Stats rápidas */}
      <div className="flex items-center justify-between text-sm border-t border-slate-800 pt-3">
        <div className="text-slate-400">
          <span className="text-white font-semibold">{league.total_rosters}</span> times
        </div>
        <div className="text-slate-500 text-xs">
          {league.status === 'in_season' && (
            <span className="text-green-400">● Em andamento</span>
          )}
          {league.status === 'complete' && (
            <span className="text-slate-400">✓ Finalizada</span>
          )}
          {league.status === 'pre_draft' && (
            <span className="text-yellow-400">◐ Pré-draft</span>
          )}
          {league.status === 'drafting' && (
            <span className="text-blue-400">◉ Draftando</span>
          )}
        </div>
      </div>
    </div>
  )
}

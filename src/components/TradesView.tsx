import { memo } from 'react'
import { useTrades, type Trade } from '@/hooks/useTrades'
import { usePlayers, type PlayersMap } from '@/hooks/usePlayers'
import { DraftPickBadge } from './DraftPickBadge'
import type { SleeperRoster, SleeperUser } from '@/types/sleeper'

interface TradesViewProps {
  leagueId: string
  rosters: SleeperRoster[]
  users: SleeperUser[]
  currentUserId?: string
}

interface TradeCardProps {
  trade: Trade
  rosters: SleeperRoster[]
  users: SleeperUser[]
  players: PlayersMap | undefined
  currentUserId?: string
}

function getOwnerName(rosterId: number, rosters: SleeperRoster[], users: SleeperUser[]): string {
  const roster = rosters.find(r => r.roster_id === rosterId)
  const user = users.find(u => u.user_id === roster?.owner_id)
  return user?.display_name || user?.username || `Time ${rosterId}`
}

function getOwnerAvatar(rosterId: number, rosters: SleeperRoster[], users: SleeperUser[]): string | undefined {
  const roster = rosters.find(r => r.roster_id === rosterId)
  const user = users.find(u => u.user_id === roster?.owner_id)
  return user?.avatar
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleDateString('pt-BR', { 
    day: '2-digit', 
    month: '2-digit',
    year: '2-digit'
  })
}

const TradeCard = memo(function TradeCard({ 
  trade, 
  rosters, 
  users, 
  players,
  currentUserId 
}: TradeCardProps) {
  const [roster1Id, roster2Id] = trade.roster_ids
  
  const roster1 = rosters.find(r => r.roster_id === roster1Id)
  const roster2 = rosters.find(r => r.roster_id === roster2Id)
  
  const isMyTrade = roster1?.owner_id === currentUserId || roster2?.owner_id === currentUserId

  // Separar assets por time
  const team1Gets: { players: string[], picks: typeof trade.draft_picks } = { players: [], picks: [] }
  const team2Gets: { players: string[], picks: typeof trade.draft_picks } = { players: [], picks: [] }

  // Players
  if (trade.adds) {
    Object.entries(trade.adds).forEach(([playerId, toRosterId]) => {
      if (toRosterId === roster1Id) {
        team1Gets.players.push(playerId)
      } else if (toRosterId === roster2Id) {
        team2Gets.players.push(playerId)
      }
    })
  }

  // Picks
  trade.draft_picks?.forEach(pick => {
    if (pick.owner_id === roster1Id) {
      team1Gets.picks.push(pick)
    } else if (pick.owner_id === roster2Id) {
      team2Gets.picks.push(pick)
    }
  })

  const renderAssets = (assets: typeof team1Gets) => (
    <div className="space-y-1">
      {assets.players.map(playerId => {
        const player = players?.[playerId]
        return (
          <div key={playerId} className="flex items-center gap-2 text-sm">
            <span className={`font-bold text-xs w-6 ${
              player?.position === 'QB' ? 'text-red-400' :
              player?.position === 'RB' ? 'text-green-400' :
              player?.position === 'WR' ? 'text-blue-400' :
              player?.position === 'TE' ? 'text-yellow-400' :
              'text-slate-400'
            }`}>
              {player?.position || '?'}
            </span>
            <span className="text-white">
              {player?.full_name || player?.first_name + ' ' + player?.last_name || 'Jogador'}
            </span>
          </div>
        )
      })}
      {assets.picks.map((pick, i) => (
        <div key={i} className="flex items-center gap-2">
          <DraftPickBadge season={pick.season} round={pick.round} />
        </div>
      ))}
      {assets.players.length === 0 && assets.picks.length === 0 && (
        <span className="text-slate-500 text-sm">Nada</span>
      )}
    </div>
  )

  return (
    <div className={`bg-slate-900 rounded-xl border overflow-hidden ${
      isMyTrade ? 'border-blue-500/50' : 'border-slate-800'
    }`}>
      {/* Header */}
      <div className="px-4 py-2 bg-slate-800/50 flex items-center justify-between">
        <span className="text-xs text-slate-400">🔄 Trade</span>
        <span className="text-xs text-slate-500">{formatDate(trade.created)}</span>
      </div>

      <div className="p-4 grid grid-cols-2 gap-4">
        {/* Team 1 */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            {getOwnerAvatar(roster1Id, rosters, users) ? (
              <img 
                src={`https://sleepercdn.com/avatars/thumbs/${getOwnerAvatar(roster1Id, rosters, users)}`}
                alt=""
                className="w-6 h-6 rounded-full"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs">
                {getOwnerName(roster1Id, rosters, users).charAt(0)}
              </div>
            )}
            <span className="font-medium text-sm truncate">
              {getOwnerName(roster1Id, rosters, users)}
            </span>
          </div>
          <div className="text-xs text-green-500 mb-1">Recebeu:</div>
          {renderAssets(team1Gets)}
        </div>

        {/* Team 2 */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            {getOwnerAvatar(roster2Id, rosters, users) ? (
              <img 
                src={`https://sleepercdn.com/avatars/thumbs/${getOwnerAvatar(roster2Id, rosters, users)}`}
                alt=""
                className="w-6 h-6 rounded-full"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs">
                {getOwnerName(roster2Id, rosters, users).charAt(0)}
              </div>
            )}
            <span className="font-medium text-sm truncate">
              {getOwnerName(roster2Id, rosters, users)}
            </span>
          </div>
          <div className="text-xs text-green-500 mb-1">Recebeu:</div>
          {renderAssets(team2Gets)}
        </div>
      </div>
    </div>
  )
})

export const TradesView = memo(function TradesView({ 
  leagueId, 
  rosters, 
  users,
  currentUserId 
}: TradesViewProps) {
  const { data: trades, isLoading, error } = useTrades(leagueId)
  const { data: players } = usePlayers()

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-slate-900 rounded-xl border border-slate-800 h-40 animate-pulse" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-slate-900 rounded-xl border border-red-900/50 p-6 text-center">
        <div className="text-2xl mb-2">⚠️</div>
        <p className="text-red-400">Erro ao carregar trades</p>
      </div>
    )
  }

  if (!trades || trades.length === 0) {
    return (
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-8 text-center">
        <div className="text-4xl mb-2">🔄</div>
        <p className="text-slate-400">Nenhuma trade realizada nesta temporada</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">Trades ({trades.length})</h3>
      </div>

      <div className="space-y-4">
        {trades.slice(0, 20).map(trade => (
          <TradeCard
            key={trade.transaction_id}
            trade={trade}
            rosters={rosters}
            users={users}
            players={players}
            currentUserId={currentUserId}
          />
        ))}
        {trades.length > 20 && (
          <p className="text-center text-slate-500 text-sm">
            Mostrando 20 de {trades.length} trades
          </p>
        )}
      </div>
    </div>
  )
})

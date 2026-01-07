import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useLeagueData } from '@/hooks/useSleeperUser'
import { calculateStandings } from '@/utils/standings'
import { RosterView } from '@/components/RosterView'
import { SkeletonTable } from '@/components/ui/SkeletonTable'
import { useAppStore } from '@/store/useAppStore'
import type { StandingTeam } from '@/types/sleeper'

type Tab = 'standings' | 'roster'

export function LeagueDetails() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, isError, refetch } = useLeagueData(id)
  const [activeTab, setActiveTab] = useState<Tab>('standings')
  const currentUser = useAppStore((state) => state.currentUser)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 pb-10">
        <div className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur border-b border-slate-800">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-2 bg-slate-800 rounded-lg w-20 h-9 animate-pulse" />
              <div>
                <div className="h-6 bg-slate-700 rounded w-48 mb-2 animate-pulse" />
                <div className="h-4 bg-slate-800 rounded w-32 animate-pulse" />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="h-9 w-32 bg-slate-700 rounded-lg animate-pulse" />
              <div className="h-9 w-28 bg-slate-800 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 mt-6">
          <SkeletonTable rows={10} />
        </div>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="text-center max-w-md bg-slate-900 p-8 rounded-xl border border-red-900/50">
          <h2 className="text-2xl font-bold text-red-500 mb-2">Erro ao carregar</h2>
          <p className="text-slate-400 mb-6">Não conseguimos carregar os dados.</p>
          <div className="flex gap-3 justify-center">
            <button 
              onClick={() => refetch()} 
              className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              Tentar Novamente
            </button>
            <Link 
              to="/" 
              className="bg-slate-800 px-4 py-2 rounded hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500/50"
            >
              Voltar
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const standings: StandingTeam[] = calculateStandings(data.rosters, data.users)
  
  const myRoster = data.rosters.find(r => r.owner_id === currentUser?.user_id)
  const myUser = data.users.find(u => u.user_id === currentUser?.user_id)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-10">
      <div className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link 
                to="/" 
                className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                aria-label="Voltar para lista de ligas"
              >
                ← Voltar
              </Link>
              <div>
                <h1 className="text-xl font-bold truncate">{data.league.name}</h1>
                <p className="text-sm text-slate-400">{data.league.total_rosters} times • Temporada {data.league.season}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2" role="tablist" aria-label="Visualização da liga">
            <button
              onClick={() => setActiveTab('standings')}
              role="tab"
              aria-selected={activeTab === 'standings'}
              aria-controls="standings-panel"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                activeTab === 'standings'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              📊 Classificação
            </button>
            <button
              onClick={() => setActiveTab('roster')}
              role="tab"
              aria-selected={activeTab === 'roster'}
              aria-controls="roster-panel"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                activeTab === 'roster'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              👤 Meu Roster
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-6">
        {activeTab === 'standings' && (
          <div 
            id="standings-panel"
            role="tabpanel"
            aria-labelledby="standings-tab"
            className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden"
          >
            <div className="p-4 border-b border-slate-800 flex justify-between">
              <h2 className="font-semibold">Classificação</h2>
              <span className="text-xs text-slate-400">{data.league.total_rosters} Times</span>
            </div>
            <table className="w-full" role="table" aria-label="Tabela de classificação">
              <thead>
                <tr className="text-slate-400 text-xs uppercase bg-slate-900/50">
                  <th scope="col" className="p-4 text-center w-12">#</th>
                  <th scope="col" className="p-4 text-left">Manager</th>
                  <th scope="col" className="p-4 text-center">W-L</th>
                  <th scope="col" className="p-4 text-right">Pts</th>
                  <th scope="col" className="p-4 text-right">Win%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {standings.map((team, i) => {
                  const isMe = team.name === myUser?.display_name || team.name === myUser?.username
                  return (
                    <tr key={team.id} className={`hover:bg-slate-800/50 ${isMe ? 'bg-blue-900/20' : ''}`}>
                      <td className="p-4 text-center text-slate-500 font-bold">{i + 1}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {team.avatar ? (
                            <img 
                              src={`https://sleepercdn.com/avatars/thumbs/${team.avatar}`} 
                              className="w-8 h-8 rounded-full" 
                              alt=""
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs" aria-hidden="true">
                              {team.name.charAt(0)}
                            </div>
                          )}
                          <span className="font-medium">
                            {team.name}
                            {isMe && <span className="ml-2 text-xs text-blue-400">(você)</span>}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-center font-bold">{team.wins}-{team.losses}</td>
                      <td className="p-4 text-right font-mono text-blue-300">{team.fpts.toFixed(1)}</td>
                      <td className="p-4 text-right font-mono text-green-400">{team.winRate.toFixed(0)}%</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'roster' && (
          <div 
            id="roster-panel"
            role="tabpanel"
            aria-labelledby="roster-tab"
            className="max-w-2xl mx-auto"
          >
            {myRoster ? (
              <RosterView roster={myRoster} owner={myUser} league={data.league} />
            ) : (
              <div className="bg-slate-900 rounded-xl border border-slate-800 p-8 text-center">
                <div className="text-4xl mb-4" aria-hidden="true">🤷</div>
                <h3 className="text-lg font-semibold mb-2">Roster não encontrado</h3>
                <p className="text-slate-400">Você não parece ter um time nesta liga.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

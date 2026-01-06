import { useParams, Link } from 'react-router-dom'
import { useLeagueData } from '@/hooks/useSleeperUser'
import { calculateStandings } from '@/utils/standings'
import type { StandingTeam } from '@/types/sleeper'

export function LeagueDetails() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, isError, refetch } = useLeagueData(id)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">🏈</div>
          <p className="text-slate-400">Carregando dados...</p>
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
            <button onClick={() => refetch()} className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700">
              Tentar Novamente
            </button>
            <Link to="/" className="bg-slate-800 px-4 py-2 rounded hover:bg-slate-700">
              Voltar
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const standings: StandingTeam[] = calculateStandings(data.rosters, data.users)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-10">
      <div className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700">← Voltar</Link>
            <h1 className="text-xl font-bold truncate">{data.league.name}</h1>
          </div>
          <span className="text-xs bg-blue-900/30 text-blue-300 px-2 py-1 rounded">{data.league.season}</span>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 mt-6">
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex justify-between">
            <h2 className="font-semibold">Classificação</h2>
            <span className="text-xs text-slate-400">{data.league.total_rosters} Times</span>
          </div>
          <table className="w-full">
            <thead>
              <tr className="text-slate-400 text-xs uppercase bg-slate-900/50">
                <th className="p-4 text-center w-12">#</th>
                <th className="p-4 text-left">Manager</th>
                <th className="p-4 text-center">W-L</th>
                <th className="p-4 text-right">Pts</th>
                <th className="p-4 text-right">Win%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {standings.map((team, i) => (
                <tr key={team.id} className="hover:bg-slate-800/50">
                  <td className="p-4 text-center text-slate-500 font-bold">{i + 1}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {team.avatar ? (
                        <img src={`https://sleepercdn.com/avatars/thumbs/${team.avatar}`} className="w-8 h-8 rounded-full" alt="" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs">{team.name.charAt(0)}</div>
                      )}
                      <span className="font-medium">{team.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-center font-bold">{team.wins}-{team.losses}</td>
                  <td className="p-4 text-right font-mono text-blue-300">{team.fpts.toFixed(1)}</td>
                  <td className="p-4 text-right font-mono text-green-400">{team.winRate.toFixed(0)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

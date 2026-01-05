import { useParams, Link } from 'react-router-dom'
import { useLeagueData } from '../hooks/useSleeperUser'

export function LeagueDetails() {
  const { id } = useParams()
  // Adicionamos 'isError' para saber se falhou
  const { data, isLoading, isError } = useLeagueData(id)

  // 1. TELA DE CARREGAMENTO
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-white flex items-center 
justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">🏈</div>
          <p className="text-slate-400">Carregando dados da Sleeper...</p>
        </div>
      </div>
    )
  }

  // 2. TELA DE ERRO (Evita a tela branca)
  if (isError || !data) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-white flex items-center 
justify-center p-6">
        <div className="text-center max-w-md bg-slate-900 p-8 rounded-xl border 
border-red-900/50">
          <h2 className="text-2xl font-bold text-red-500 mb-2">Ops! Algo deu 
errado.</h2>
          <p className="text-slate-400 mb-6">Não conseguimos carregar os dados 
desta liga. Verifique sua conexão.</p>
          <Link to="/" className="bg-slate-800 px-4 py-2 rounded 
hover:bg-slate-700 transition">
            Voltar para Home
          </Link>
        </div>
      </div>
    )
  }

  // Lógica de dados (Standings)
  const standings = data.rosters
    .map((roster: any) => {
      const owner = data.users.find((u: any) => u.user_id === roster.owner_id)
      return {
        id: roster.roster_id,
        name: owner?.display_name || 'Time Sem Dono',
        avatar: owner?.avatar,
        wins: roster.settings.wins,
        losses: roster.settings.losses,
        ties: roster.settings.ties || 0,
        fpts: roster.settings.fpts + (roster.settings.fpts_decimal || 0) / 100,
      }
    })
    .sort((a: any, b: any) => b.wins - a.wins || b.fpts - a.fpts)

  // 3. TELA PRINCIPAL (Visual Clean e Profissional)
  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 font-sans pb-10">
      
      {/* Header Fixo no Topo */}
      <div className="sticky top-0 z-10 bg-[#0f172a]/95 backdrop-blur border-b 
border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center 
justify-between">
          <div className="flex items-center gap-4">
             <Link to="/" className="p-2 bg-slate-800 rounded-lg 
hover:bg-slate-700 text-slate-300">
                &larr;
             </Link>
             <h1 className="text-lg md:text-xl font-bold 
truncate">{data.league.name}</h1>
          </div>
          <div className="text-xs font-mono bg-blue-900/30 text-blue-300 px-2 
py-1 rounded">
            ID: {data.league.league_id.slice(0,6)}...
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-6">
        {/* Card Principal */}
        <div className="bg-[#1e293b] rounded-xl border border-slate-700 
overflow-hidden shadow-2xl">
          <div className="p-4 border-b border-slate-700 bg-slate-800/50 flex 
justify-between items-center">
            <h2 className="font-semibold text-slate-200">Classificação 
{data.league.season}</h2>
            <span className="text-xs 
text-slate-400">{data.league.total_rosters} Times</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-900/40 text-slate-400 text-xs uppercase 
tracking-wider">
                  <th className="p-4 w-12 text-center">#</th>
                  <th className="p-4">Manager</th>
                  <th className="p-4 text-center">W-L-T</th>
                  <th className="p-4 text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {standings.map((team: any, index: number) => (
                  <tr key={team.id} className="hover:bg-slate-800/50 
transition-colors">
                    <td className="p-4 text-center font-mono text-slate-500 
font-bold text-sm">
                      {index + 1}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {team.avatar ? (
                          <img 
                            
src={`https://sleepercdn.com/avatars/thumbs/${team.avatar}`} 
                            className="w-8 h-8 rounded-full border 
border-slate-600"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-700 
flex items-center justify-center text-[10px]">User</div>
                        )}
                        <span className="font-medium text-sm md:text-base 
text-slate-200">
                          {team.name}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-center font-bold text-white 
tracking-wide text-sm">
                      {team.wins}-{team.losses}{team.ties > 0 && 
`-${team.ties}`}
                    </td>
                    <td className="p-4 text-right font-mono text-blue-300 
text-sm">
                      {team.fpts.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

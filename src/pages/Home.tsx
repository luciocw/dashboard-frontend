import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSleeperUser, useSleeperLeagues } from '@/hooks/useSleeperUser'
import { LeagueCard } from '@/components/LeagueCard'
import { StatCard } from '@/components/ui/StatCard'
import { getCurrentNFLSeason, getAvailableSeasons } from '@/utils/nfl'
import type { SleeperLeague } from '@/types/sleeper'

// Calcular stats agregadas das ligas
function calculateStats(leagues: SleeperLeague[]) {
  const total = leagues.length
  const dynasty = leagues.filter(l => l.settings?.type === 2).length
  const inSeason = leagues.filter(l => l.status === 'in_season').length
  const totalTeams = leagues.reduce((sum, l) => sum + l.total_rosters, 0)

  return { total, dynasty, inSeason, totalTeams }
}

export function Home() {
  const [inputValue, setInputValue] = useState('')
  const [username, setUsername] = useState('luciocw')
  const [season, setSeason] = useState(getCurrentNFLSeason())
  const navigate = useNavigate()

  const { data: user, isLoading: loadingUser, error: userError } = useSleeperUser(username)
  const { data: leagues, isLoading: loadingLeagues } = useSleeperLeagues(user?.user_id, season)

  const availableSeasons = getAvailableSeasons()
  const stats = leagues ? calculateStats(leagues) : null

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (inputValue.trim()) setUsername(inputValue.trim())
  }

  const handleLogout = () => {
    setUsername('')
    setInputValue('')
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏈</span>
            <div>
              <h1 className="font-bold text-lg">Dynasty Dashboard</h1>
              <p className="text-xs text-slate-500">v2.1.0</p>
            </div>
          </div>
          
          {user && (
            <div className="flex items-center gap-4">
              <select
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              >
                {availableSeasons.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              
              <div className="flex items-center gap-2">
                {user.avatar && (
                  <img 
                    src={`https://sleepercdn.com/avatars/thumbs/${user.avatar}`}
                    className="w-8 h-8 rounded-full"
                    alt=""
                  />
                )}
                <span className="text-sm font-medium">{user.display_name || user.username}</span>
              </div>

              <button
                onClick={handleLogout}
                className="text-xs text-slate-400 hover:text-white transition"
              >
                Sair
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Login Form */}
        {!user && (
          <div className="max-w-md mx-auto mt-20">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🏈</div>
              <h2 className="text-2xl font-bold mb-2">Dynasty Dashboard</h2>
              <p className="text-slate-400">Entre com seu username do Sleeper</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Username do Sleeper"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 transition"
                disabled={loadingUser}
              />
              <button 
                type="submit"
                disabled={loadingUser || !inputValue.trim()} 
                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed rounded-xl font-medium transition"
              >
                {loadingUser ? 'Carregando...' : 'Entrar'}
              </button>
            </form>
            
            {userError && (
              <div className="mt-4 p-4 bg-red-900/20 border border-red-800 rounded-xl text-red-400 text-sm text-center">
                ❌ Usuário não encontrado
              </div>
            )}
          </div>
        )}

        {/* Dashboard */}
        {user && (
          <>
            {/* HUD Stats */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <StatCard 
                  label="Total Ligas" 
                  value={stats.total} 
                  icon="🏆"
                />
                <StatCard 
                  label="Dynasty" 
                  value={stats.dynasty} 
                  icon="👑"
                />
                <StatCard 
                  label="Em Andamento" 
                  value={stats.inSeason} 
                  icon="🔥"
                />
                <StatCard 
                  label="Total Times" 
                  value={stats.totalTeams} 
                  icon="👥"
                />
              </div>
            )}

            {/* Loading */}
            {loadingLeagues && (
              <div className="flex justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin text-4xl mb-4">🏈</div>
                  <p className="text-slate-400">Carregando ligas...</p>
                </div>
              </div>
            )}

            {/* Leagues Grid */}
            {!loadingLeagues && leagues && leagues.length > 0 && (
              <>
                <h2 className="text-lg font-semibold mb-4 text-slate-300">
                  Suas Ligas ({leagues.length})
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {leagues.map(league => (
                    <LeagueCard 
                      key={league.league_id} 
                      league={league} 
                      onClick={() => navigate(`/league/${league.league_id}`)}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Empty State */}
            {!loadingLeagues && leagues && leagues.length === 0 && (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">🤷</div>
                <p className="text-slate-400">Nenhuma liga encontrada para {season}</p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-auto">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-slate-500 text-sm">
          Dynasty Dashboard • Feito com ❤️ por Lucio
        </div>
      </footer>
    </div>
  )
}

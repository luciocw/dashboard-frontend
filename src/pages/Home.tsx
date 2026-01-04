import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSleeperUser, useSleeperLeagues } from '@/hooks/useSleeperUser'
import { LeagueCard } from '@/components/LeagueCard'
import { getCurrentNFLSeason, getAvailableSeasons } from '@/utils/nfl'

export function Home() {
  const [inputValue, setInputValue] = useState('')
  const [username, setUsername] = useState('luciocw')
  const [season, setSeason] = useState(getCurrentNFLSeason())
  const navigate = useNavigate()

  const { data: user, isLoading: loadingUser, error: userError } = useSleeperUser(username)
  const { data: leagues, isLoading: loadingLeagues } = useSleeperLeagues(user?.user_id, season)

  const availableSeasons = getAvailableSeasons()

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (inputValue.trim()) setUsername(inputValue.trim())
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="container mx-auto p-6 max-w-6xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">🏈 Dynasty Dashboard</h1>
          <p className="text-slate-400">v2.1.0 - Temporada {getCurrentNFLSeason()}</p>
        </header>

        {!user && (
          <div className="max-w-md mx-auto">
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Username do Sleeper"
                className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg focus:outline-none focus:border-blue-500"
                disabled={loadingUser}
              />
              <button 
                type="submit"
                disabled={loadingUser || !inputValue.trim()} 
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                {loadingUser ? 'Carregando...' : 'Entrar'}
              </button>
            </form>
            
            {userError && (
              <div className="mt-4 p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-400 text-sm">
                ❌ Usuário não encontrado
              </div>
            )}
          </div>
        )}

        {user && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Olá, {user.display_name || user.username}!</h2>
              <select
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                {availableSeasons.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {loadingLeagues && (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
              </div>
            )}

            {!loadingLeagues && leagues && leagues.length > 0 && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {leagues.map(league => (
                  <LeagueCard 
                    key={league.league_id} 
                    league={league} 
                    onClick={() => navigate(`/league/${league.league_id}`)}
                  />
                ))}
              </div>
            )}

            {!loadingLeagues && leagues && leagues.length === 0 && (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">🤷</div>
                <p className="text-slate-400">Nenhuma liga encontrada para {season}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

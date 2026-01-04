import { useState, FormEvent } from 'react'
import { useSleeperUser, useSleeperLeagues } from './hooks/useSleeperUser'
import { LeagueCard } from './components/LeagueCard'

function App() {
  const [inputValue, setInputValue] = useState('')
  const [username, setUsername] = useState('')
  const [season, setSeason] = useState('2026')

  const { data: user, isLoading: loadingUser } = useSleeperUser(username)
  const { data: leagues } = useSleeperLeagues(user?.user_id, season)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (inputValue.trim()) {
      setUsername(inputValue.trim())
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="container mx-auto p-6 max-w-6xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">🏈 Dynasty 
Dashboard</h1>
          <p className="text-slate-400">v2.0.0 - React Edition</p>
        </header>

        {!user && (
          <form onSubmit={handleSubmit} className="max-w-md mx-auto 
space-y-4">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Username do Sleeper"
              className="w-full px-4 py-2 bg-slate-900 border 
border-slate-800 rounded-lg"
            />
            <button
              type="submit"
              disabled={loadingUser}
              className="w-full px-4 py-2 bg-blue-600 rounded-lg"
            >
              {loadingUser ? 'Carregando...' : 'Entrar'}
            </button>
          </form>
        )}

        {user && (
          <div>
            <h2 className="text-2xl mb-4">Bem-vindo, 
{user.display_name}!</h2>
            <div className="mb-6">
               <select
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                className="px-4 py-2 bg-slate-900 rounded-lg border 
border-slate-800"
              >
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
              </select>
            </div>

            {leagues && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {leagues.map(league => (
                  <LeagueCard 
                    key={league.league_id} 
                    league={league} 
                    onClick={() => console.log('Clicou na liga:', 
league.name)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default App

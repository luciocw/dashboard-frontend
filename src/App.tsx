import { useState, FormEvent } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { useSleeperUser, useSleeperLeagues } from './hooks/useSleeperUser'
import { LeagueCard } from './components/LeagueCard'
import { LeagueDetails } from './pages/LeagueDetails'

function Home() {
  const [inputValue, setInputValue] = useState('')
  const [username, setUsername] = useState('luciocw')
  const [season, setSeason] = useState('2026')
  const navigate = useNavigate()

  const { data: user, isLoading: loadingUser } = useSleeperUser(username)
  const { data: leagues } = useSleeperLeagues(user?.user_id, season)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (inputValue.trim()) setUsername(inputValue.trim())
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="container mx-auto p-6 max-w-6xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">🏈 Dynasty Dashboard</h1>
          <p className="text-slate-400">v2.1.0 - Com Navegação</p>
        </header>

        {!user && (
          <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Username do Sleeper"
              className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg"
            />
            <button disabled={loadingUser} className="w-full px-4 py-2 bg-blue-600 rounded-lg">
              Entrar
            </button>
          </form>
        )}

        {user && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl">Olá, {user.display_name}!</h2>
              <select
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                className="px-4 py-2 bg-slate-900 rounded-lg border border-slate-800"
              >
                <option value="2026">2026</option>
                <option value="2025">2025</option>
              </select>
            </div>

            {leagues && (
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
          </div>
        )}
      </div>
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/league/:id" element={<LeagueDetails />} />
    </Routes>
  )
}

export default App

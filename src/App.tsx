import { Routes, Route } from 'react-router-dom'
import { Home } from './pages/Home'
import { LeagueDetails } from './pages/LeagueDetails'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/league/:id" element={<LeagueDetails />} />
    </Routes>
  )
}

export default App

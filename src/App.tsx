import { Routes, Route } from 'react-router-dom'
import { Home } from './pages/Home'
import { LeagueDetails } from './pages/LeagueDetails'
import { TradeCalculatorPage } from './pages/TradeCalculatorPage'
import { OfflineBanner } from './components/OfflineBanner'

function App() {
  return (
    <>
      <OfflineBanner />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/league/:id" element={<LeagueDetails />} />
        <Route path="/trade-calc" element={<TradeCalculatorPage />} />
      </Routes>
    </>
  )
}

export default App

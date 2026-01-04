import { useParams, Link } from 'react-router-dom'

export function LeagueDetails() {
  // O "useParams" pega o ID que está na URL (ex: liga/12345)
  const { id } = useParams()

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="text-blue-400 hover:text-blue-300 mb-6 
inline-block">
          &larr; Voltar para Home
        </Link>

        <h1 className="text-3xl font-bold">Detalhes da Liga</h1>
        <p className="text-slate-400 mt-2">ID da Liga: {id}</p>

        <div className="mt-8 p-6 bg-slate-900 rounded-lg border 
border-slate-800">
          <p>🚧 Aqui vamos colocar a classificação e os times em 
breve!</p>
        </div>
      </div>
    </div>
  )
}

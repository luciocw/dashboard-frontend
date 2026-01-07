import { memo } from 'react'

interface ErrorCardProps {
  message?: string
  onRetry?: () => void
}

export const ErrorCard = memo(function ErrorCard({ 
  message = 'Erro ao carregar', 
  onRetry 
}: ErrorCardProps) {
  return (
    <div className="bg-slate-900 border border-red-900/50 rounded-xl p-4 text-center">
      <div className="text-2xl mb-2">⚠️</div>
      <p className="text-red-400 text-sm mb-3">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-xs transition"
        >
          Tentar novamente
        </button>
      )}
    </div>
  )
})

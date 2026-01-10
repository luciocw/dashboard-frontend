/**
 * TradeResult Component
 * Mostra o resultado do trade (vencedor, diferença)
 */

import { memo } from 'react'
import { TrendingUp, TrendingDown, Equal, AlertCircle } from 'lucide-react'
import type { TradeResult as TradeResultType } from '../types'

interface TradeResultProps {
  result: TradeResultType
  isValid: boolean
}

export const TradeResult = memo(function TradeResult({ result, isValid }: TradeResultProps) {
  if (!isValid) {
    return (
      <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
        <div className="flex items-center justify-center gap-3 text-slate-500">
          <AlertCircle className="w-5 h-5" />
          <span>Adicione itens em ambos os lados para ver o resultado</span>
        </div>
      </div>
    )
  }

  const { winner, difference, differencePercent, sideATotal, sideBTotal } = result

  // Determina cores e ícones baseado no vencedor
  const getWinnerInfo = () => {
    if (winner === 'even') {
      return {
        icon: <Equal className="w-6 h-6" />,
        label: 'Trade Equilibrado',
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500/30',
      }
    }
    if (winner === 'A') {
      return {
        icon: <TrendingUp className="w-6 h-6" />,
        label: 'Lado A Vence',
        color: 'text-green-400',
        bgColor: 'bg-green-500/10',
        borderColor: 'border-green-500/30',
      }
    }
    return {
      icon: <TrendingDown className="w-6 h-6" />,
      label: 'Lado B Vence',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
    }
  }

  const winnerInfo = getWinnerInfo()

  // Calcula a porcentagem de cada lado
  const total = sideATotal + sideBTotal
  const sideAPercent = total > 0 ? Math.round((sideATotal / total) * 100) : 50
  const sideBPercent = total > 0 ? Math.round((sideBTotal / total) * 100) : 50

  return (
    <div className={`rounded-xl border ${winnerInfo.borderColor} ${winnerInfo.bgColor} p-6`}>
      {/* Resultado principal */}
      <div className="flex items-center justify-center gap-3 mb-6">
        <span className={winnerInfo.color}>{winnerInfo.icon}</span>
        <span className={`text-xl font-bold ${winnerInfo.color}`}>{winnerInfo.label}</span>
      </div>

      {/* Barra de comparação */}
      <div className="relative h-8 bg-slate-800 rounded-full overflow-hidden mb-4">
        <div
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-600 to-green-500 transition-all duration-500"
          style={{ width: `${sideAPercent}%` }}
        />
        <div
          className="absolute right-0 top-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
          style={{ width: `${sideBPercent}%` }}
        />
        {/* Labels na barra */}
        <div className="absolute inset-0 flex items-center justify-between px-3 text-xs font-bold text-white">
          <span>A: {sideATotal}</span>
          <span>B: {sideBTotal}</span>
        </div>
      </div>

      {/* Detalhes */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-green-400">{sideATotal}</div>
          <div className="text-xs text-slate-500">Lado A</div>
        </div>
        <div>
          <div className={`text-2xl font-bold ${winnerInfo.color}`}>
            {winner === 'even' ? '=' : `+${difference}`}
          </div>
          <div className="text-xs text-slate-500">
            {winner === 'even' ? 'Igual' : `${differencePercent}% diferença`}
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold text-blue-400">{sideBTotal}</div>
          <div className="text-xs text-slate-500">Lado B</div>
        </div>
      </div>

      {/* Análise rápida */}
      {winner !== 'even' && (
        <div className="mt-4 pt-4 border-t border-slate-700/50">
          <p className="text-sm text-center text-slate-400">
            {differencePercent <= 5 && 'Trade muito equilibrado - ambos os lados saem bem.'}
            {differencePercent > 5 && differencePercent <= 15 && 'Pequena vantagem - trade aceitável.'}
            {differencePercent > 15 && differencePercent <= 25 && 'Vantagem considerável - avalie bem.'}
            {differencePercent > 25 && 'Grande diferença de valor - trade desequilibrado!'}
          </p>
        </div>
      )}
    </div>
  )
})

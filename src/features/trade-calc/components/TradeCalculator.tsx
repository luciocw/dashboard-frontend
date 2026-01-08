/**
 * TradeCalculator Component
 * Componente principal do Trade Calculator
 */

import { memo } from 'react'
import { Scale, RotateCcw, Info } from 'lucide-react'
import { useTradeCalculator } from '../hooks/useTradeCalculator'
import { TradeSide } from './TradeSide'
import { TradeResult } from './TradeResult'

export const TradeCalculator = memo(function TradeCalculator() {
  const {
    state,
    result,
    isValid,
    addPlayer,
    addPick,
    removeItem,
    clearSide,
    clearAll,
  } = useTradeCalculator()

  const { sideA, sideB } = state

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl">
            <Scale className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Trade Calculator</h1>
            <p className="text-sm text-slate-400">Analise trades de Dynasty</p>
          </div>
        </div>

        <button
          onClick={clearAll}
          disabled={sideA.items.length === 0 && sideB.items.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Limpar Tudo</span>
        </button>
      </div>

      {/* Info Banner */}
      <div className="flex items-start gap-3 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
        <Info className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-slate-400">
          <p>
            Adicione jogadores e picks em ambos os lados para calcular o valor do trade.
            Os valores são baseados em rankings de dynasty (0-100).
          </p>
        </div>
      </div>

      {/* Trade Sides */}
      <div className="grid lg:grid-cols-2 gap-6">
        <TradeSide
          side="A"
          items={sideA.items}
          total={result.sideATotal}
          onAddPlayer={(player) => addPlayer('A', player)}
          onAddPick={(pick) => addPick('A', pick)}
          onRemoveItem={(itemId) => removeItem('A', itemId)}
          onClear={() => clearSide('A')}
        />
        <TradeSide
          side="B"
          items={sideB.items}
          total={result.sideBTotal}
          onAddPlayer={(player) => addPlayer('B', player)}
          onAddPick={(pick) => addPick('B', pick)}
          onRemoveItem={(itemId) => removeItem('B', itemId)}
          onClear={() => clearSide('B')}
        />
      </div>

      {/* Result */}
      <TradeResult result={result} isValid={isValid} />

      {/* Footer Info */}
      <div className="text-center text-xs text-slate-600">
        <p>Valores baseados em consensus rankings de dynasty football.</p>
        <p className="mt-1">Jogadores sem valor mapeado aparecem com valor 0.</p>
      </div>
    </div>
  )
})

/**
 * TradeSide Component
 * Representa um lado do trade (A ou B)
 */

import { memo, useState, useCallback } from 'react'
import { Trash2, User, FileText } from 'lucide-react'
import { PlayerCard } from './PlayerCard'
import { PickCard } from './PickCard'
import { PlayerSearchModal } from './PlayerSearchModal'
import { PickSearchModal } from './PickSearchModal'
import type { TradeItem, TradePlayer, TradePick } from '../types'

interface TradeSideProps {
  side: 'A' | 'B'
  items: TradeItem[]
  total: number
  onAddPlayer: (player: TradePlayer) => void
  onAddPick: (pick: TradePick) => void
  onRemoveItem: (itemId: string) => void
  onClear: () => void
}

export const TradeSide = memo(function TradeSide({
  side,
  items,
  total,
  onAddPlayer,
  onAddPick,
  onRemoveItem,
  onClear,
}: TradeSideProps) {
  const [playerModalOpen, setPlayerModalOpen] = useState(false)
  const [pickModalOpen, setPickModalOpen] = useState(false)

  const handleAddPlayer = useCallback(
    (player: TradePlayer) => {
      onAddPlayer(player)
    },
    [onAddPlayer]
  )

  const handleAddPick = useCallback(
    (pick: TradePick) => {
      onAddPick(pick)
    },
    [onAddPick]
  )

  // Cores do lado
  const borderColor = side === 'A' ? 'border-green-500/30' : 'border-blue-500/30'
  const bgColor = side === 'A' ? 'bg-green-500/5' : 'bg-blue-500/5'
  const textColor = side === 'A' ? 'text-green-400' : 'text-blue-400'
  const badgeBg = side === 'A' ? 'bg-green-500/20' : 'bg-blue-500/20'

  return (
    <div className={`rounded-xl border ${borderColor} ${bgColor} overflow-hidden`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-lg text-sm font-bold ${badgeBg} ${textColor}`}>
            Lado {side}
          </span>
          <span className="text-sm text-slate-500">
            {items.length} {items.length === 1 ? 'item' : 'itens'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`text-xl font-bold ${textColor}`}>{total}</div>
          {items.length > 0 && (
            <button
              onClick={onClear}
              className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
              title="Limpar lado"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="p-4 space-y-2 min-h-[200px]">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-slate-500">
            <div className="text-4xl mb-2 opacity-50">📦</div>
            <p className="text-sm">Nenhum item adicionado</p>
            <p className="text-xs mt-1">Use os botões abaixo para adicionar</p>
          </div>
        ) : (
          items.map((item) =>
            item.type === 'player' ? (
              <PlayerCard
                key={`player-${item.playerId}`}
                player={item}
                onRemove={() => onRemoveItem(item.playerId)}
              />
            ) : (
              <PickCard
                key={`pick-${item.id}`}
                pick={item}
                onRemove={() => onRemoveItem(item.id)}
              />
            )
          )
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 p-4 border-t border-slate-700/50 bg-slate-800/30">
        <button
          onClick={() => setPlayerModalOpen(true)}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition ${
            side === 'A'
              ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
              : 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Jogador</span>
        </button>
        <button
          onClick={() => setPickModalOpen(true)}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition ${
            side === 'A'
              ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
              : 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Pick</span>
        </button>
      </div>

      {/* Modals */}
      <PlayerSearchModal
        isOpen={playerModalOpen}
        onClose={() => setPlayerModalOpen(false)}
        onSelect={handleAddPlayer}
        side={side}
      />
      <PickSearchModal
        isOpen={pickModalOpen}
        onClose={() => setPickModalOpen(false)}
        onSelect={handleAddPick}
        side={side}
      />
    </div>
  )
})

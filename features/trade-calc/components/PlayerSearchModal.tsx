/**
 * PlayerSearchModal Component
 * Modal para buscar e adicionar jogadores ao trade
 */

import { memo, useState, useCallback } from 'react'
import { X, Search, Loader2 } from 'lucide-react'
import { usePlayerSearch } from '../hooks/usePlayerSearch'
import { POSITION_COLORS, POSITION_BG } from '../constants'
import type { PlayerPosition, TradePlayer, SleeperPlayerWithValue } from '../types'

interface PlayerSearchModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (player: TradePlayer) => void
  side: 'A' | 'B'
}

const POSITIONS: Array<PlayerPosition | 'ALL'> = ['ALL', 'QB', 'RB', 'WR', 'TE', 'K', 'DL', 'LB', 'DB']

export const PlayerSearchModal = memo(function PlayerSearchModal({
  isOpen,
  onClose,
  onSelect,
  side,
}: PlayerSearchModalProps) {
  const { players, isLoading, search, setPosition, searchTerm, position } = usePlayerSearch({
    limit: 50,
  })

  const [inputValue, setInputValue] = useState('')

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value)
      search(e.target.value)
    },
    [search]
  )

  const handleSelectPlayer = useCallback(
    (player: SleeperPlayerWithValue) => {
      onSelect({
        type: 'player',
        playerId: player.player_id,
        name: player.full_name || `${player.first_name} ${player.last_name}`,
        position: player.position as PlayerPosition,
        team: player.team || 'FA',
        age: player.age,
        value: player.value,
      })
      onClose()
    },
    [onSelect, onClose]
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg max-h-[80vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div>
            <h3 className="font-bold text-white">Adicionar Jogador</h3>
            <p className="text-xs text-slate-400">Lado {side}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={inputValue}
              onChange={handleSearch}
              placeholder="Buscar jogador..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              autoFocus
            />
          </div>

          {/* Position filters */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {POSITIONS.map((pos) => (
              <button
                key={pos}
                onClick={() => setPosition(pos)}
                className={`px-2.5 py-1 text-xs font-medium rounded transition ${
                  position === pos
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {pos}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
            </div>
          ) : players.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              {searchTerm ? 'Nenhum jogador encontrado' : 'Digite para buscar jogadores'}
            </div>
          ) : (
            <div className="space-y-1">
              {players.map((player) => {
                const posColor = POSITION_COLORS[player.position || ''] || 'text-slate-400'
                const posBg = POSITION_BG[player.position || ''] || 'bg-slate-700/50'

                return (
                  <button
                    key={player.player_id}
                    onClick={() => handleSelectPlayer(player)}
                    className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-800 transition text-left group"
                  >
                    {/* Posição */}
                    <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${posBg} ${posColor}`}>
                      {player.position}
                    </span>

                    {/* Nome e time */}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-200 truncate group-hover:text-white">
                        {player.full_name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {player.team || 'Free Agent'}
                        {player.age && ` • ${player.age} anos`}
                      </div>
                    </div>

                    {/* Valor */}
                    <div className="text-right">
                      <span className={`text-sm font-bold ${player.value > 0 ? 'text-cyan-400' : 'text-slate-600'}`}>
                        {player.value || '-'}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-500">
            {players.length} jogadores encontrados
          </p>
        </div>
      </div>
    </div>
  )
})

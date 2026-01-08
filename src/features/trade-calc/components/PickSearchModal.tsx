/**
 * PickSearchModal Component
 * Modal para adicionar draft picks ao trade
 */

import { memo, useState, useCallback } from 'react'
import { X } from 'lucide-react'
import { PICK_YEARS, PICK_ROUNDS, PICK_RANGES, getPickId, getPickLabel, getPickValue } from '../constants'
import type { TradePick } from '../types'

interface PickSearchModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (pick: TradePick) => void
  side: 'A' | 'B'
}

export const PickSearchModal = memo(function PickSearchModal({
  isOpen,
  onClose,
  onSelect,
  side,
}: PickSearchModalProps) {
  const [selectedYear, setSelectedYear] = useState(PICK_YEARS[0])
  const [selectedRound, setSelectedRound] = useState(1)
  const [selectedRange, setSelectedRange] = useState<'early' | 'mid' | 'late'>('mid')

  const handleAdd = useCallback(() => {
    const range = selectedRound <= 2 ? selectedRange : undefined
    const id = getPickId(selectedYear, selectedRound, range)
    const label = getPickLabel(selectedYear, selectedRound, range)
    const value = getPickValue(selectedYear, selectedRound, range)

    onSelect({
      type: 'pick',
      id,
      year: selectedYear,
      round: selectedRound,
      range: range || null,
      value,
      label,
    })
    onClose()
  }, [selectedYear, selectedRound, selectedRange, onSelect, onClose])

  const previewValue = getPickValue(
    selectedYear,
    selectedRound,
    selectedRound <= 2 ? selectedRange : undefined
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div>
            <h3 className="font-bold text-white">Adicionar Pick</h3>
            <p className="text-xs text-slate-400">Lado {side}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Ano */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Ano</label>
            <div className="flex gap-2">
              {PICK_YEARS.map((year) => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    selectedYear === year
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>

          {/* Round */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Round</label>
            <div className="flex gap-2">
              {PICK_ROUNDS.map((round) => (
                <button
                  key={round}
                  onClick={() => setSelectedRound(round)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    selectedRound === round
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  {round}º
                </button>
              ))}
            </div>
          </div>

          {/* Range (só para rounds 1 e 2) */}
          {selectedRound <= 2 && (
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Posição no Draft
              </label>
              <div className="flex gap-2">
                {PICK_RANGES.map((range) => (
                  <button
                    key={range.value}
                    onClick={() => setSelectedRange(range.value)}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition ${
                      selectedRange === range.value
                        ? 'bg-cyan-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Preview */}
          <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-white">
                  {getPickLabel(
                    selectedYear,
                    selectedRound,
                    selectedRound <= 2 ? selectedRange : undefined
                  )}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">Preview do pick</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-cyan-400">{previewValue}</div>
                <div className="text-[10px] text-slate-500 uppercase">valor</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t border-slate-700">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleAdd}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-500 hover:to-blue-500 transition font-medium"
          >
            Adicionar Pick
          </button>
        </div>
      </div>
    </div>
  )
})

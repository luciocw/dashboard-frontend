/**
 * useTradeCalculator Hook
 * Gerencia o estado do Trade Calculator
 */

import { useState, useCallback, useMemo } from 'react'
import type { TradeItem, TradePlayer, TradePick, TradeState, TradeResult, TradeSideState } from '../types'

type TradeSide = 'A' | 'B'

const EMPTY_SIDE: TradeSideState = {
  items: [],
  totalValue: 0,
}

const INITIAL_STATE: TradeState = {
  sideA: { ...EMPTY_SIDE },
  sideB: { ...EMPTY_SIDE },
}

/**
 * Calcula o total de valor de um lado
 */
function calculateTotal(items: TradeItem[]): number {
  return items.reduce((sum, item) => sum + item.value, 0)
}

/**
 * Hook principal do Trade Calculator
 */
export function useTradeCalculator() {
  const [state, setState] = useState<TradeState>(INITIAL_STATE)

  /**
   * Adiciona um item a um lado do trade
   */
  const addItem = useCallback((side: TradeSide, item: TradeItem) => {
    setState((prev) => {
      const sideKey = side === 'A' ? 'sideA' : 'sideB'
      const currentSide = prev[sideKey]

      // Verifica se o item já existe
      const exists = currentSide.items.some((i) => {
        if (i.type === 'player' && item.type === 'player') {
          return i.playerId === item.playerId
        }
        if (i.type === 'pick' && item.type === 'pick') {
          return i.id === item.id
        }
        return false
      })

      if (exists) return prev

      const newItems = [...currentSide.items, item]

      return {
        ...prev,
        [sideKey]: {
          items: newItems,
          totalValue: calculateTotal(newItems),
        },
      }
    })
  }, [])

  /**
   * Adiciona um jogador a um lado
   */
  const addPlayer = useCallback(
    (side: TradeSide, player: Omit<TradePlayer, 'type'>) => {
      addItem(side, { type: 'player', ...player })
    },
    [addItem]
  )

  /**
   * Adiciona um pick a um lado
   */
  const addPick = useCallback(
    (side: TradeSide, pick: Omit<TradePick, 'type'>) => {
      addItem(side, { type: 'pick', ...pick })
    },
    [addItem]
  )

  /**
   * Remove um item de um lado
   */
  const removeItem = useCallback((side: TradeSide, itemId: string) => {
    setState((prev) => {
      const sideKey = side === 'A' ? 'sideA' : 'sideB'
      const currentSide = prev[sideKey]

      const newItems = currentSide.items.filter((item) => {
        if (item.type === 'player') return item.playerId !== itemId
        if (item.type === 'pick') return item.id !== itemId
        return true
      })

      return {
        ...prev,
        [sideKey]: {
          items: newItems,
          totalValue: calculateTotal(newItems),
        },
      }
    })
  }, [])

  /**
   * Limpa um lado do trade
   */
  const clearSide = useCallback((side: TradeSide) => {
    setState((prev) => ({
      ...prev,
      [side === 'A' ? 'sideA' : 'sideB']: { ...EMPTY_SIDE },
    }))
  }, [])

  /**
   * Limpa todo o trade
   */
  const clearAll = useCallback(() => {
    setState(INITIAL_STATE)
  }, [])

  /**
   * Move um item de um lado para outro
   */
  const moveItem = useCallback((itemId: string, from: TradeSide, to: TradeSide) => {
    setState((prev) => {
      const fromKey = from === 'A' ? 'sideA' : 'sideB'
      const toKey = to === 'A' ? 'sideA' : 'sideB'

      const fromSide = prev[fromKey]
      const toSide = prev[toKey]

      const item = fromSide.items.find((i) => {
        if (i.type === 'player') return i.playerId === itemId
        if (i.type === 'pick') return i.id === itemId
        return false
      })

      if (!item) return prev

      const newFromItems = fromSide.items.filter((i) => {
        if (i.type === 'player') return i.playerId !== itemId
        if (i.type === 'pick') return i.id !== itemId
        return true
      })

      const newToItems = [...toSide.items, item]

      return {
        ...prev,
        [fromKey]: {
          items: newFromItems,
          totalValue: calculateTotal(newFromItems),
        },
        [toKey]: {
          items: newToItems,
          totalValue: calculateTotal(newToItems),
        },
      }
    })
  }, [])

  /**
   * Calcula o resultado do trade
   */
  const result = useMemo((): TradeResult => {
    const sideATotal = state.sideA.totalValue
    const sideBTotal = state.sideB.totalValue
    const difference = Math.abs(sideATotal - sideBTotal)

    let winner: 'A' | 'B' | 'even' = 'even'
    if (sideATotal > sideBTotal) winner = 'A'
    else if (sideBTotal > sideATotal) winner = 'B'

    // Calcula diferença percentual baseada no maior valor
    const maxValue = Math.max(sideATotal, sideBTotal)
    const differencePercent = maxValue > 0 ? Math.round((difference / maxValue) * 100) : 0

    return {
      winner,
      difference,
      differencePercent,
      sideATotal,
      sideBTotal,
    }
  }, [state.sideA.totalValue, state.sideB.totalValue])

  /**
   * Verifica se o trade está vazio
   */
  const isEmpty = useMemo(() => {
    return state.sideA.items.length === 0 && state.sideB.items.length === 0
  }, [state.sideA.items.length, state.sideB.items.length])

  /**
   * Verifica se o trade é válido (ambos os lados têm itens)
   */
  const isValid = useMemo(() => {
    return state.sideA.items.length > 0 && state.sideB.items.length > 0
  }, [state.sideA.items.length, state.sideB.items.length])

  return {
    state,
    result,
    isEmpty,
    isValid,
    addItem,
    addPlayer,
    addPick,
    removeItem,
    clearSide,
    clearAll,
    moveItem,
  }
}

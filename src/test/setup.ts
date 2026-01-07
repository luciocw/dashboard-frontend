import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock do fetch global
global.fetch = vi.fn()

// Mock do navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  value: true,
  writable: true,
})

// Limpar mocks após cada teste
afterEach(() => {
  vi.clearAllMocks()
})

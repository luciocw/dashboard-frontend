interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

export class CacheManager {
  private cache: Map<string, CacheEntry<any>>
  private storageKey = 'dynasty_cache'

  constructor() {
    this.cache = new Map()
    this.loadFromStorage()
  }

  set<T>(key: string, data: T, ttlHours: number = 4): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttlHours * 60 * 60 * 1000,
    }
    this.cache.set(key, entry)
    this.saveToStorage()
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    const isExpired = Date.now() - entry.timestamp > entry.ttl
    if (isExpired) {
      this.cache.delete(key)
      this.saveToStorage()
      return null
    }

    return entry.data as T
  }

  clear(): void {
    this.cache.clear()
    localStorage.removeItem(this.storageKey)
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey)
      if (stored) {
        const parsed = JSON.parse(stored)
        this.cache = new Map(Object.entries(parsed))
      }
    } catch (e) {
      console.error('Failed to load cache:', e)
    }
  }

  private saveToStorage(): void {
    try {
      const obj = Object.fromEntries(this.cache)
      localStorage.setItem(this.storageKey, JSON.stringify(obj))
    } catch (e) {
      console.error('Failed to save cache:', e)
    }
  }
}

export const cacheManager = new CacheManager()

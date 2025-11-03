/**
 * Simple in-memory TTL cache for dashboard data
 * Caches SQL queries, KPI data, and widget configurations
 * Default TTL: 10 minutes
 */

interface CacheEntry {
  timestamp: number;
  value: any;
}

export class SimpleCache {
  private cache = new Map<string, CacheEntry>();
  private ttl: number;

  constructor(ttlMs: number = 10 * 60 * 1000) {
    this.ttl = ttlMs;
  }

  /**
   * Get a value from cache if it exists and hasn't expired
   */
  get<T = any>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    const now = Date.now();
    const age = now - entry.timestamp;

    // Check if entry has expired
    if (age > this.ttl) {
      this.cache.delete(key);
      console.log(`[Cache] Expired: ${key}`);
      return null;
    }

    console.log(`[Cache] HIT: ${key} (age: ${Math.round(age / 1000)}s)`);
    return entry.value as T;
  }

  /**
   * Set a value in cache
   */
  set(key: string, value: any): void {
    try {
      this.cache.set(key, {
        timestamp: Date.now(),
        value: value,
      });
      console.log(`[Cache] SET: ${key}`);
    } catch (error) {
      console.error(`[Cache] Error setting key ${key}:`, error);
    }
  }

  /**
   * Invalidate cache entries by exact key or prefix
   */
  invalidate(keyOrPrefix: string): void {
    // Check if exact key exists
    if (this.cache.has(keyOrPrefix)) {
      this.cache.delete(keyOrPrefix);
      console.log(`[Cache] INVALIDATED (exact): ${keyOrPrefix}`);
      return;
    }

    // Otherwise invalidate by prefix
    let count = 0;
    for (const key of Array.from(this.cache.keys())) {
      if (key.startsWith(keyOrPrefix)) {
        this.cache.delete(key);
        count++;
      }
    }
    
    if (count > 0) {
      console.log(`[Cache] INVALIDATED (prefix): ${keyOrPrefix} (${count} entries)`);
    }
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    console.log(`[Cache] CLEARED (${size} entries)`);
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys()),
    };
  }

  /**
   * Remove expired entries (useful for cleanup)
   */
  cleanup(): void {
    const now = Date.now();
    let removed = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl) {
        this.cache.delete(key);
        removed++;
      }
    }

    if (removed > 0) {
      console.log(`[Cache] CLEANUP: Removed ${removed} expired entries`);
    }
  }
}

// Global cache instance with 10-minute TTL
export const cache = new SimpleCache(10 * 60 * 1000);

// Optional: Run cleanup every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => cache.cleanup(), 5 * 60 * 1000);
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests = 10, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  async check(identifier: string): Promise<{ success: boolean; remaining: number; resetTime: number }> {
    const now = Date.now();
    const entry = this.limits.get(identifier);

    if (!entry || now > entry.resetTime) {
      const resetTime = now + this.windowMs;
      this.limits.set(identifier, { count: 1, resetTime });
      return { success: true, remaining: this.maxRequests - 1, resetTime };
    }

    if (entry.count >= this.maxRequests) {
      return { success: false, remaining: 0, resetTime: entry.resetTime };
    }

    entry.count++;
    this.limits.set(identifier, entry);
    return { success: true, remaining: this.maxRequests - entry.count, resetTime: entry.resetTime };
  }

  cleanup() {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    this.limits.forEach((entry, key) => {
      if (now > entry.resetTime) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => this.limits.delete(key));
  }
}

export const rateLimiter = new RateLimiter(10, 60000);

let cleanupInterval: NodeJS.Timeout | null = null;

if (typeof window === 'undefined' && typeof global !== 'undefined') {
  if (!cleanupInterval) {
    cleanupInterval = setInterval(() => rateLimiter.cleanup(), 5 * 60 * 1000);
  }
}

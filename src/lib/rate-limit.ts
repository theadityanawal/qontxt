import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

// Rate limit configurations
const RATE_LIMIT_CONFIGS = {
  default: {
    points: 20,
    duration: '1m',
    blockDuration: '5m'
  },
  job_parse: {
    points: 10,
    duration: '1m',
    blockDuration: '5m'
  },
  resume_analyze: {
    points: 30,
    duration: '1m',
    blockDuration: '5m'
  }
} as const;

interface RateLimitOptions {
  points?: number;
  duration?: `${number}${'s' | 'm' | 'h' | 'd'}`;
  blockDuration?: `${number}${'s' | 'm' | 'h' | 'd'}`;
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

class RateLimiter {
  private redis: Redis;
  private limiters: Map<string, Ratelimit> = new Map();

  constructor() {
    this.redis = Redis.fromEnv();
  }

  private getLimiter(key: string, options?: RateLimitOptions): Ratelimit {
    const cacheKey = `${key}:${JSON.stringify(options)}`;
    
    if (!this.limiters.has(cacheKey)) {
      const config = options || RATE_LIMIT_CONFIGS.default;
      
      this.limiters.set(
        cacheKey,
        new Ratelimit({
          redis: this.redis,
          limiter: Ratelimit.slidingWindow(
            config.points || RATE_LIMIT_CONFIGS.default.points,
            config.duration || RATE_LIMIT_CONFIGS.default.duration
          ),
          analytics: true,
          prefix: `ratelimit:${key}`
        })
      );
    }

    return this.limiters.get(cacheKey)!;
  }

  public async check(
    identifier: string,
    options?: RateLimitOptions
  ): Promise<RateLimitResult> {
    try {
      const limiter = this.getLimiter(identifier, options);
      const result = await limiter.limit(identifier);

      return {
        success: result.success,
        limit: result.limit,
        remaining: result.remaining,
        reset: result.reset,
        retryAfter: result.success ? undefined : Math.ceil((result.reset - Date.now()) / 1000)
      };
    } catch (error) {
      console.error('Rate limit check failed:', error);
      // Be conservative on errors - assume limit was hit
      return {
        success: false,
        limit: 0,
        remaining: 0,
        reset: Date.now() + 60000, // 1 minute
        retryAfter: 60
      };
    }
  }

  public async getRemainingPoints(identifier: string): Promise<number> {
    try {
      const limiter = this.getLimiter(identifier);
      const result = await limiter.limit(identifier);
      return result.remaining;
    } catch (error) {
      console.error('Failed to get remaining points:', error);
      return 0;
    }
  }

  public async resetLimits(identifier: string): Promise<void> {
    try {
      await this.redis.del(`ratelimit:${identifier}`);
    } catch (error) {
      console.error('Failed to reset rate limits:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const rateLimit = new RateLimiter();
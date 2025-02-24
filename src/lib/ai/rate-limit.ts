import { redis } from './redis';

type RateLimitAction = 'ai_analysis' | 'ai_tailor';

const RATE_LIMITS = {
  ai_analysis: {
    points: 10,
    duration: 24 * 60 * 60, // 24 hours
  },
  ai_tailor: {
    points: 20,
    duration: 24 * 60 * 60, // 24 hours
  },
} as const;

export async function rateLimit(
  userId: string,
  action: RateLimitAction
): Promise<void> {
  const key = `rate_limit:${action}:${userId}`;
  const limit = RATE_LIMITS[action];

  const current = await redis.get(key);
  const points = current ? parseInt(current, 10) : 0;

  if (points >= limit.points) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }

  await redis.multi()
    .incr(key)
    .expire(key, limit.duration)
    .exec();
}

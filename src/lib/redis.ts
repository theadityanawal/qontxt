import { Redis } from '@upstash/redis';
import { z } from 'zod';

// Redis client singleton
class RedisClient {
  private static instance: RedisClient;
  private client: Redis;
  private readonly defaultTTL = 3600; // 1 hour

  private constructor() {
    this.client = Redis.fromEnv();
  }

  public static getInstance(): RedisClient {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient();
    }
    return RedisClient.instance;
  }

  private generateKey(prefix: string, ...parts: string[]): string {
    return `${prefix}:${parts.join(':')}`;
  }

  public async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) as T : null;
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  public async set(key: string, value: unknown, ttl: number = this.defaultTTL): Promise<void> {
    try {
      await this.client.set(key, JSON.stringify(value), { ex: ttl });
    } catch (error) {
      console.error('Redis set error:', error);
    }
  }

  public async delete(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      console.error('Redis delete error:', error);
    }
  }

  // Cache key generators for different features
  public getAnalysisKey(userId: string, section: string, content: string): string {
    return this.generateKey('analysis', userId, section, this.hashContent(content));
  }

  public getJobParseKey(userId: string, content: string): string {
    return this.generateKey('job-parse', userId, this.hashContent(content));
  }

  private hashContent(content: string): string {
    // Simple hash for cache key - in production, use a proper hashing function
    return Buffer.from(content).toString('base64').slice(0, 32);
  }
}

// Export singleton instance
export const redis = RedisClient.getInstance();

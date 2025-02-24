import { Redis } from '@upstash/redis';
import { z } from 'zod';

interface MetricsConfig {
  flushInterval: number; // milliseconds
  retentionPeriod: number; // days
  sampleRate: number; // 0-1
}

const MetricDataSchema = z.object({
  timestamp: z.number(),
  value: z.number(),
  tags: z.record(z.string()).optional(),
  metadata: z.record(z.unknown()).optional()
});

type MetricData = z.infer<typeof MetricDataSchema>;

class MetricsService {
  private static instance: MetricsService;
  private redis: Redis;
  private buffer: Map<string, MetricData[]> = new Map();
  private flushTimeout: NodeJS.Timeout | null = null;

  private readonly config: MetricsConfig = {
    flushInterval: 30000, // 30 seconds
    retentionPeriod: 30, // 30 days
    sampleRate: 1.0 // 100% sampling
  };

  private constructor() {
    this.redis = Redis.fromEnv();
    this.startFlushTimer();
  }

  public static getInstance(): MetricsService {
    if (!MetricsService.instance) {
      MetricsService.instance = new MetricsService();
    }
    return MetricsService.instance;
  }

  private startFlushTimer() {
    if (this.flushTimeout) {
      clearTimeout(this.flushTimeout);
    }

    this.flushTimeout = setInterval(
      () => this.flush(),
      this.config.flushInterval
    );
  }

  private async flush() {
    if (this.buffer.size === 0) return;

    const pipeline = this.redis.pipeline();
    const now = Date.now();

    for (const [metricName, data] of this.buffer.entries()) {
      try {
        // Group metrics by tags for efficient storage
        const groupedMetrics = this.groupMetricsByTags(data);

        for (const [tagKey, metrics] of groupedMetrics.entries()) {
          const key = `metrics:${metricName}:${tagKey}`;
          
          // Store metrics in a time-series format
          pipeline.zadd(
            key,
            ...metrics.flatMap(m => [m.timestamp, JSON.stringify(m)])
          );

          // Set expiration
          pipeline.expire(
            key,
            this.config.retentionPeriod * 24 * 60 * 60
          );
        }

        // Update metric metadata
        pipeline.hset(
          `metrics:metadata:${metricName}`,
          {
            lastUpdate: now,
            count: await this.getMetricCount(metricName) + data.length
          }
        );
      } catch (error) {
        console.error(`Failed to flush metrics for ${metricName}:`, error);
      }
    }

    try {
      await pipeline.exec();
      this.buffer.clear();
    } catch (error) {
      console.error('Failed to flush metrics:', error);
    }
  }

  private groupMetricsByTags(metrics: MetricData[]): Map<string, MetricData[]> {
    const grouped = new Map<string, MetricData[]>();

    for (const metric of metrics) {
      const tagKey = this.getTagKey(metric.tags);
      if (!grouped.has(tagKey)) {
        grouped.set(tagKey, []);
      }
      grouped.get(tagKey)!.push(metric);
    }

    return grouped;
  }

  private getTagKey(tags: Record<string, string> = {}): string {
    return Object.entries(tags)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}:${v}`)
      .join(':');
  }

  public async record(
    name: string,
    value: number,
    tags?: Record<string, string>,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    // Apply sampling
    if (Math.random() > this.config.sampleRate) return;

    try {
      const metric: MetricData = {
        timestamp: Date.now(),
        value,
        tags,
        metadata
      };

      MetricDataSchema.parse(metric);

      if (!this.buffer.has(name)) {
        this.buffer.set(name, []);
      }
      this.buffer.get(name)!.push(metric);

      // Flush if buffer gets too large
      if (this.buffer.get(name)!.length > 1000) {
        await this.flush();
      }
    } catch (error) {
      console.error(`Failed to record metric ${name}:`, error);
    }
  }

  public async getMetrics(
    name: string,
    timeRange: { start: number; end: number },
    tags?: Record<string, string>
  ): Promise<MetricData[]> {
    try {
      const tagKey = this.getTagKey(tags);
      const key = `metrics:${name}:${tagKey}`;

      const metrics = await this.redis.zrangebyscore(
        key,
        timeRange.start,
        timeRange.end
      );

      return metrics.map(m => JSON.parse(m));
    } catch (error) {
      console.error(`Failed to get metrics for ${name}:`, error);
      return [];
    }
  }

  public async getMetricCount(name: string): Promise<number> {
    try {
      const metadata = await this.redis.hgetall(`metrics:metadata:${name}`);
      return parseInt(metadata.count || '0', 10);
    } catch (error) {
      console.error(`Failed to get count for ${name}:`, error);
      return 0;
    }
  }

  public async clearOldMetrics(): Promise<void> {
    try {
      const now = Date.now();
      const cutoff = now - (this.config.retentionPeriod * 24 * 60 * 60 * 1000);

      const keys = await this.redis.keys('metrics:*');
      const pipeline = this.redis.pipeline();

      for (const key of keys) {
        if (key.startsWith('metrics:metadata:')) continue;
        pipeline.zremrangebyscore(key, 0, cutoff);
      }

      await pipeline.exec();
    } catch (error) {
      console.error('Failed to clear old metrics:', error);
    }
  }
}

// Export singleton instance
export const metrics = MetricsService.getInstance();
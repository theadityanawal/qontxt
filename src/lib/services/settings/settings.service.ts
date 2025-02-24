import {
  UserSettings,
  UserSettingsSchema,
  DEFAULT_AI_SETTINGS
} from '@/types/settings';

export class SettingsService {
  private static instance: SettingsService;
  private cache: Map<string, { settings: UserSettings; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  public static getInstance(): SettingsService {
    if (!SettingsService.instance) {
      SettingsService.instance = new SettingsService();
    }
    return SettingsService.instance;
  }

  public async getUserSettings(userId: string): Promise<UserSettings> {
    // Check cache first
    const cached = this.getCachedSettings(userId);
    if (cached) return cached;

    try {
      // Get from Redis
      const settings = await redis.get<UserSettings>(`settings:${userId}`);

      if (!settings) {
        // Create default settings for new users
        return this.createDefaultSettings(userId);
      }

      // Validate and cache settings
      const validated = UserSettingsSchema.parse(settings);
      this.setCachedSettings(userId, validated);

      return validated;
    } catch (error) {
      errorTracker.captureError(error, {
        userId,
        operation: 'getUserSettings'
      });
      // Return safe defaults on error
      return this.createDefaultSettings(userId);
    }
  }

  public async updateSettings(
    userId: string,
    updates: Partial<UserSettings>
  ): Promise<UserSettings> {
    try {
      const current = await this.getUserSettings(userId);
      const updated: UserSettings = {
        ...current,
        ...updates,
        updatedAt: new Date().toISOString()
      };

      // Validate before saving
      const validated = UserSettingsSchema.parse(updated);

      // Save to Redis
      await redis.set(`settings:${userId}`, validated);

      // Update cache
      this.setCachedSettings(userId, validated);

      // Record metrics
      await metrics.record('settings_update', 1, { userId });

      return validated;
    } catch (error) {
      errorTracker.captureError(error, {
        userId,
        operation: 'updateSettings'
      });
      throw error;
    }
  }

  public async updateUsage(
    userId: string,
    aiRequests: number = 1
  ): Promise<void> {
    try {
      const settings = await this.getUserSettings(userId);

      const updated: UserSettings = {
        ...settings,
        usage: {
          ...settings.usage,
          aiRequests: settings.usage.aiRequests + aiRequests,
          lastRequest: new Date().toISOString()
        },
        updatedAt: new Date().toISOString()
      };

      await redis.set(`settings:${userId}`, updated);
      this.setCachedSettings(userId, updated);
    } catch (error) {
      errorTracker.captureError(error, {
        userId,
        operation: 'updateUsage'
      });
    }
  }

  private getCachedSettings(userId: string): UserSettings | null {
    const cached = this.cache.get(userId);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.settings;
    }
    this.cache.delete(userId);
    return null;
  }

  private setCachedSettings(userId: string, settings: UserSettings): void {
    this.cache.set(userId, {
      settings,
      timestamp: Date.now()
    });
  }

  private createDefaultSettings(userId: string): UserSettings {
    const now = new Date().toISOString();
    return {
      userId,
      profile: {
        email: '', // Will be set during auth
      },
      ai: DEFAULT_AI_SETTINGS,
      usage: {
        tier: 'free',
        aiRequests: 0
      },
      createdAt: now,
      updatedAt: now
    };
  }
}

// Export singleton instance
export const settings = SettingsService.getInstance();


import { z } from 'zod';

// Settings schemas
export const UserProfileSchema = z.object({
  name: z.string().optional(),
  email: z.string().email(),
  timezone: z.string().optional()
});

export const AISettingsSchema = z.object({
  defaultModel: z.enum(['gemini-2-flash']), // Only Gemini for MVP
  temperature: z.number().min(0).max(1).default(0.7),
  currentModel: z.object({
    provider: z.string(),
    modelName: z.string()
  }).optional()
});

export const UsageSchema = z.object({
  tier: z.enum(['free']).default('free'), // Only free tier for MVP
  aiRequests: z.number().default(0),
  lastRequest: z.string().optional()
});

export const UserSettingsSchema = z.object({
  userId: z.string(),
  profile: UserProfileSchema,
  ai: AISettingsSchema,
  usage: UsageSchema,
  createdAt: z.string(),
  updatedAt: z.string()
});

// Type exports from Zod schemas
export type UserProfile = z.infer<typeof UserProfileSchema>;
export type AISettings = z.infer<typeof AISettingsSchema>;
export type Usage = z.infer<typeof UsageSchema>;
export type UserSettings = z.infer<typeof UserSettingsSchema>;

export interface SettingsUpdateRequest {
  profile?: Partial<UserSettings['profile']>;
  ai?: Partial<UserSettings['ai']>;
}

export const DEFAULT_AI_SETTINGS: AISettings = {
  defaultModel: 'gemini-2-flash',
  temperature: 0.7
};

export type UserTier = 'free' | 'pro';

export interface AIModelOption {
  id: string;
  name: string;
  provider: string;
  description: string;
  tier: UserTier;
}

export const AI_MODEL_OPTIONS: AIModelOption[] = [
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'openai',
    description: 'Latest GPT-4 model with enhanced performance',
    tier: 'pro'
  },
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    provider: 'google',
    description: 'Google\'s advanced language model',
    tier: 'pro'
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'openai',
    description: 'Fast and efficient language model',
    tier: 'free'
  }
];

export const TIER_LIMITS: Record<UserTier, { aiRequests: number }> = {
  free: { aiRequests: 25 },
  pro: { aiRequests: 250 }
};


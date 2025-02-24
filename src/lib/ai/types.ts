import { z } from 'zod';

export const AIModelConfigSchema = z.object({
  modelName: z.string(),
  temperature: z.number().min(0).max(1).default(0.7),
  maxTokens: z.number().positive().default(1000),
  apiKey: z.string(),
  provider: z.enum(['gemini', 'deepseek', 'openai'])
});

export type AIModelConfig = z.infer<typeof AIModelConfigSchema>;

export const AICompletionRequestSchema = z.object({
  prompt: z.string(),
  temperature: z.number().min(0).max(1).optional(),
  maxTokens: z.number().positive().optional(),
  stopSequences: z.array(z.string()).optional(),
  streamResponse: z.boolean().optional()
});

export type AICompletionRequest = z.infer<typeof AICompletionRequestSchema>;

export interface AICompletionResponse {
  text: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  metadata: {
    provider: string;
    model: string;
    [key: string]: any;
  };
}

export interface AIStreamChunk {
  text: string;
  isComplete: boolean;
}

export interface AIProvider {
  initialize(config: AIModelConfig): Promise<void>;
  generateCompletion(request: AICompletionRequest): Promise<AICompletionResponse>;
  generateStreamingCompletion?(request: AICompletionRequest): AsyncGenerator<AIStreamChunk>;
  validateConfig(config: AIModelConfig): Promise<boolean>;
  analyzeJob(description: string): Promise<JobAnalysis>;
  tailorResume(baseResume: any, jobAnalysis: JobAnalysis): Promise<AIAnalysisResult>;
}

export const DEFAULT_MODELS: Record<string, AIModelConfig> = {
  'gemini-2-flash': {
    provider: 'gemini',
    modelName: 'gemini-2.0-flash-001',
    temperature: 0.7,
    maxTokens: 1000,
    apiKey: process.env.GEMINI_API_KEY || ''
  },
  'deepseek-r1': {
    provider: 'deepseek',
    modelName: 'deepseek-r1',
    temperature: 0.7,
    maxTokens: 1000,
    apiKey: process.env.DEEPSEEK_API_KEY || ''
  },
  'openai-o3-mini': {
    provider: 'openai',
    modelName: 'o3-mini',
    temperature: 0.7,
    maxTokens: 1000,
    apiKey: process.env.OPENAI_API_KEY || ''
  }
};

export class AIError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly provider: string,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AIError';
  }
}

export interface AIProviderMetrics {
  requestCount: number;
  errorCount: number;
  averageLatency: number;
  tokenUsage: {
    prompt: number;
    completion: number;
    total: number;
  };
}

export interface AIModelCapabilities {
  streamingSupported: boolean;
  maxContextLength: number;
  supportedLanguages: string[];
  specialFeatures: string[];
}

export interface JobAnalysis {
  keyRequirements: string[];
  technicalSkills: string[];
  softSkills: string[];
  roleResponsibilities: string[];
  experienceLevels: {
    minimum: number;
    preferred: number;
  };
}








}  matchedKeywords: string[];  suggestions: string[];  matchScore: number;  enhancedContent: any;export interface AIAnalysisResult {

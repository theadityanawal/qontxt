import { AIServiceAdapter, AIServiceConfig, CompletionRequest, CompletionResponse } from './types';
import { GeminiAdapter } from './gemini.adapter';
import { AIProviderFactory, AIProviderType } from './provider.factory';
import { AICompletionRequest, AICompletionResponse, AIStreamChunk, AIAnalysisResult, JobAnalysis } from './types';
import { settings } from '../settings';
import { ResumeData } from '@/types/resume.types';
import { rateLimit } from '../rate-limit';
import { redis } from '../redis';

export type AIProvider = 'gemini' | 'openai';

export class AIService {
  private static instance: AIService;
  private providerFactory: AIProviderFactory;
  private adapters: Map<AIProvider, AIServiceAdapter> = new Map();
  private activeProvider: AIProvider = 'gemini';
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 3600000; // 1 hour in milliseconds
  private providerType: AIProviderType = 'openai';

  private constructor() {
    // Initialize adapters
    this.adapters.set('gemini', new GeminiAdapter());
    this.providerFactory = AIProviderFactory.getInstance();
  }

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  public async initialize(config: { [key in AIProvider]?: AIServiceConfig }) {
    try {
      await Promise.all(
        Object.entries(config).map(async ([provider, providerConfig]) => {
          const adapter = this.adapters.get(provider as AIProvider);
          if (adapter) {
            await adapter.initialize(providerConfig);
          }
        })
      );
    } catch (error) {
      console.error('AI service initialization failed:', error);
      throw new Error('Failed to initialize AI service');
    }
  }

  private getCacheKey(request: CompletionRequest): string {
    return `${this.activeProvider}:${JSON.stringify(request)}`;
  }

  private getCachedResponse(key: string): CompletionResponse | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCachedResponse(key: string, response: CompletionResponse): void {
    this.cache.set(key, {
      data: response,
      timestamp: Date.now()
    });
  }

  public setActiveProvider(provider: AIProvider) {
    if (!this.adapters.has(provider)) {
      throw new Error(`Provider ${provider} not configured`);
    }
    this.activeProvider = provider;
  }

  private async updateUserMetrics(userId: string): Promise<void> {
    const userSettings = await settings.getUserSettings(userId);
    await settings.updateUsageMetrics({
      aiRequests: userSettings.usage.aiRequests + 1
    });
  }

  public async generateCompletion(
    request: AICompletionRequest,
    userId?: string,
    modelName?: string
  ): Promise<AICompletionResponse> {
    try {
      // Get provider based on user settings or specified model
      const provider = await this.providerFactory.getProvider(modelName);

      // Generate completion
      const response = await provider.generateCompletion(request);

      // Update usage metrics if userId provided
      if (userId) {
        await this.updateUserMetrics(userId);
      }

      return response;
    } catch (error) {
      console.error('AI completion error:', error);
      throw error;
    }
  }

  public async *generateStreamingCompletion(
    request: AICompletionRequest,
    userId?: string,
    modelName?: string
  ): AsyncGenerator<AIStreamChunk> {
    try {
      const provider = await this.providerFactory.getProvider(modelName);

      if (!provider.generateStreamingCompletion) {
        throw new Error('Streaming not supported by this provider');
      }

      // Generate streaming completion
      yield* provider.generateStreamingCompletion(request);

      // Update metrics after successful completion
      if (userId) {
        await this.updateUserMetrics(userId);
      }
    } catch (error) {
      console.error('AI streaming error:', error);
      throw error;
    }
  }

  public async validateProvider(modelName: string): Promise<boolean> {
    try {
      const provider = await this.providerFactory.getProvider(modelName);
      return !!provider;
    } catch {
      return false;
    }
  }

  public getProviderFactory(): AIProviderFactory {
    return this.providerFactory;
  }

  public clearCache(): void {
    this.cache.clear();
  }

  public removeCacheEntry(key: string): void {
    this.cache.delete(key);
  }

  public async generateATSScore(resume: ResumeData, jobDescription?: string): Promise<{
    overall: number;
    format: number;
    content: number;
    keywords: number;
  }> {
    try {
      const prompt = `
        Analyze the following resume for ATS compatibility:
        ${JSON.stringify(resume)}
        ${jobDescription ? `\nTarget Job Description:\n${jobDescription}` : ''}

        Provide a scoring analysis in the following JSON format:
        {
          "overall": number (0-100),
          "format": number (0-100),
          "content": number (0-100),
          "keywords": number (0-100)
        }

        Consider:
        1. Proper formatting and structure
        2. Keyword optimization
        3. Content relevance
        4. Quantifiable achievements
      `;

      const response = await this.generateCompletion({ prompt, temperature: 0.3 });
      return JSON.parse(response.text);
    } catch (error) {
      errorTracker.captureError(error, {
        component: 'AIService',
        operation: 'generateATSScore'
      });
      throw error;
    }
  }

  public async generateSuggestions(resume: ResumeData, jobDescription?: string): Promise<{
    strengths: string[];
    weaknesses: string[];
    improvements: string[];
  }> {
    try {
      const prompt = `
        Analyze the following resume and provide improvement suggestions:
        ${JSON.stringify(resume)}
        ${jobDescription ? `\nTarget Job Description:\n${jobDescription}` : ''}

        Provide analysis in the following JSON format:
        {
          "strengths": string[],
          "weaknesses": string[],
          "improvements": string[]
        }

        Focus on:
        1. Content strength and impact
        2. Skills alignment
        3. Achievement highlighting
        4. Professional presentation
      `;

      const response = await this.generateCompletion({ prompt, temperature: 0.7 });
      return JSON.parse(response.text);
    } catch (error) {
      errorTracker.captureError(error, {
        component: 'AIService',
        operation: 'generateSuggestions'
      });
      throw error;
    }
  }

  setProvider(type: AIProviderType) {
    this.providerType = type;
  }

  private async getCachedAnalysis(key: string): Promise<any | null> {
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  private async cacheAnalysis(key: string, data: any): Promise<void> {
    await redis.set(key, JSON.stringify(data), 'EX', 24 * 60 * 60); // Cache for 24 hours
  }

  async analyzeJobDescription(userId: string, description: string): Promise<JobAnalysis> {
    await rateLimit(userId, 'ai_analysis');

    const cacheKey = `job_analysis:${Buffer.from(description).toString('base64')}`;
    const cached = await this.getCachedAnalysis(cacheKey);
    if (cached) {
      return cached;
    }

    const provider = AIProviderFactory.createProvider(this.providerType);
    const analysis = await provider.analyzeJob(description);
    await this.cacheAnalysis(cacheKey, analysis);

    return analysis;
  }

  async tailorResume(userId: string, baseResume: any, jobAnalysis: JobAnalysis): Promise<AIAnalysisResult> {
    await rateLimit(userId, 'ai_tailor');

    const provider = AIProviderFactory.createProvider(this.providerType);
    const result = await provider.tailorResume(baseResume, jobAnalysis);

    return result;
  }
}

// Export singleton instance
export const ai = AIService.getInstance();

import { AIProvider, AIModelConfig, DEFAULT_MODELS, AIError } from './types';
import { GeminiProvider } from './providers/gemini.provider';
import { DeepseekProvider } from './providers/deepseek.provider';
import { OpenAIProvider } from './providers/openai.provider';

export type AIProviderType = 'openai' | 'gemini' | 'deepseek';

export class AIProviderFactory {
  private static instance: AIProviderFactory;
  private providers: Map<string, AIProvider> = new Map();
  private activeProvider: AIProvider | null = null;
  private activeConfig: AIModelConfig | null = null;

  private constructor() {}

  public static getInstance(): AIProviderFactory {
    if (!AIProviderFactory.instance) {
      AIProviderFactory.instance = new AIProviderFactory();
    }
    return AIProviderFactory.instance;
  }

  private getProviderInstance(config: AIModelConfig): AIProvider {
    switch (config.provider) {
      case 'gemini':
        return GeminiProvider.getInstance();
      case 'deepseek':
        return DeepseekProvider.getInstance();
      case 'openai':
        return OpenAIProvider.getInstance();
      default:
        throw new AIError(
          `Unknown provider: ${config.provider}`,
          'UNKNOWN_PROVIDER',
          config.provider
        );
    }
  }

  public async initializeProvider(config: AIModelConfig): Promise<AIProvider> {
    try {
      const provider = this.getProviderInstance(config);
      await provider.initialize(config);
      this.providers.set(config.modelName, provider);
      this.activeProvider = provider;
      this.activeConfig = config;
      return provider;
    } catch (error) {
      throw new AIError(
        `Failed to initialize provider: ${error.message}`,
        'INITIALIZATION_FAILED',
        config.provider,
        { originalError: error }
      );
    }
  }

  public async getProvider(modelName?: string): Promise<AIProvider> {
    if (!modelName && this.activeProvider) {
      return this.activeProvider;
    }

    const config = modelName
      ? DEFAULT_MODELS[modelName]
      : DEFAULT_MODELS['gemini-2-flash'];

    if (!config) {
      throw new AIError(
        `Model not found: ${modelName}`,
        'MODEL_NOT_FOUND',
        'unknown'
      );
    }

    if (this.providers.has(config.modelName)) {
      const provider = this.providers.get(config.modelName)!;
      this.activeProvider = provider;
      this.activeConfig = config;
      return provider;
    }

    return this.initializeProvider(config);
  }

  public async setDefaultProvider(modelName: string): Promise<void> {
    const provider = await this.getProvider(modelName);
    this.activeProvider = provider;
    this.activeConfig = DEFAULT_MODELS[modelName];
  }

  public getActiveConfig(): AIModelConfig | null {
    return this.activeConfig;
  }

  public async validateConfig(config: AIModelConfig): Promise<boolean> {
    try {
      const provider = this.getProviderInstance(config);
      return await provider.validateConfig(config);
    } catch (error) {
      console.error('Config validation failed:', error);
      return false;
    }
  }

  public clearProviders(): void {
    this.providers.clear();
    this.activeProvider = null;
    this.activeConfig = null;
  }
}

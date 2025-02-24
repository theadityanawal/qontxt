import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { AIServiceAdapter, AIServiceConfig, CompletionRequest, CompletionResponse } from './types';

interface RetryConfig {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
}

export class GeminiAdapter implements AIServiceAdapter {
  private client: GoogleGenerativeAI | null = null;
  private model: GenerativeModel | null = null;
  private readonly retryConfig: RetryConfig = {
    maxAttempts: 3,
    initialDelay: 1000,
    maxDelay: 10000
  };

  async initialize(config: AIServiceConfig) {
    try {
      this.client = new GoogleGenerativeAI(config.apiKey);
      this.model = this.client.getGenerativeModel({
        model: config.modelName || "gemini-2.0-flash-001",
        safetySettings: [
          { category: 'HARM_CATEGORY_DANGEROUS', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
        ]
      });
    } catch (error) {
      console.error('Gemini initialization error:', error);
      throw new Error('Failed to initialize Gemini model');
    }
  }

  private async withRetry<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error | null = null;
    let delay = this.retryConfig.initialDelay;

    for (let attempt = 1; attempt <= this.retryConfig.maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt === this.retryConfig.maxAttempts) {
          break;
        }

        await new Promise(resolve => setTimeout(resolve, delay));
        delay = Math.min(delay * 2, this.retryConfig.maxDelay);
      }
    }

    throw new Error(`Operation failed after ${this.retryConfig.maxAttempts} attempts: ${lastError?.message}`);
  }

  private validateModel(): void {
    if (!this.model) {
      throw new Error('Gemini model not initialized');
    }
  }

  async generateCompletion(request: CompletionRequest): Promise<CompletionResponse> {
    this.validateModel();

    return this.withRetry(async () => {
      const result = await this.model!.generateContent({
        contents: [{ role: 'user', text: request.prompt }],
        generationConfig: {
          maxTokens: request.maxTokens,
          temperature: request.temperature,
          topK: 40,
          topP: 0.95,
          stopSequences: ['```']
        }
      });

      const response = await result.response;
      const text = response.text();

      if (!text) {
        throw new Error('Empty response from Gemini');
      }

      return {
        text,
        usage: {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0
        },
        metadata: {
          provider: 'gemini',
          model: this.model!.model,
          safetyRatings: response.promptFeedback?.safetyRatings || []
        }
      };
    });
  }

  async *generateStreamingCompletion(request: CompletionRequest) {
    this.validateModel();

    try {
      const result = await this.model!.generateContentStream({
        contents: [{ role: 'user', text: request.prompt }],
        generationConfig: {
          maxTokens: request.maxTokens,
          temperature: request.temperature,
          topK: 40,
          topP: 0.95,
          stopSequences: ['```']
        }
      });

      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) {
          yield text;
        }
      }
    } catch (error) {
      console.error('Gemini streaming error:', error);
      throw new Error('Streaming generation failed');
    }
  }
}

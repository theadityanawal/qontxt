import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import {
  AIProvider,
  AIModelConfig,
  AICompletionRequest,
  AICompletionResponse,
  AIStreamChunk,
  AIError
} from '../types';

export class GeminiProvider implements AIProvider {
  private client: GoogleGenerativeAI | null = null;
  private model: GenerativeModel | null = null;
  private config: AIModelConfig | null = null;

  async initialize(config: AIModelConfig): Promise<void> {
    try {
      this.client = new GoogleGenerativeAI(config.apiKey);
      this.model = this.client.getGenerativeModel({
        model: config.modelName,
        safetySettings: [
          { category: 'HARM_CATEGORY_DANGEROUS', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
        ]
      });
      this.config = config;
    } catch (error) {
      throw new AIError(
        'Failed to initialize Gemini model',
        'INITIALIZATION_ERROR',
        'gemini',
        { originalError: error }
      );
    }
  }

  async validateConfig(config: AIModelConfig): Promise<boolean> {
    try {
      const tempClient = new GoogleGenerativeAI(config.apiKey);
      await tempClient.getGenerativeModel({ model: config.modelName });
      return true;
    } catch {
      return false;
    }
  }

  private validateInitialization(): void {
    if (!this.client || !this.model || !this.config) {
      throw new AIError(
        'Gemini provider not initialized',
        'NOT_INITIALIZED',
        'gemini'
      );
    }
  }

  async generateCompletion(request: AICompletionRequest): Promise<AICompletionResponse> {
    this.validateInitialization();

    try {
      const result = await this.model!.generateContent({
        contents: [{ role: 'user', text: request.prompt }],
        generationConfig: {
          maxTokens: request.maxTokens || this.config!.maxTokens,
          temperature: request.temperature || this.config!.temperature,
          topK: 40,
          topP: 0.95,
          stopSequences: request.stopSequences
        }
      });

      const response = await result.response;
      const text = response.text();

      if (!text) {
        throw new AIError(
          'Empty response from Gemini',
          'EMPTY_RESPONSE',
          'gemini'
        );
      }

      return {
        text,
        usage: {
          promptTokens: 0, // Gemini doesn't provide token counts
          completionTokens: 0,
          totalTokens: 0
        },
        metadata: {
          provider: 'gemini',
          model: this.config!.modelName,
          safetyRatings: response.promptFeedback?.safetyRatings || []
        }
      };
    } catch (error) {
      throw new AIError(
        'Gemini completion failed',
        'COMPLETION_ERROR',
        'gemini',
        { originalError: error }
      );
    }
  }

  async *generateStreamingCompletion(request: AICompletionRequest): AsyncGenerator<AIStreamChunk> {
    this.validateInitialization();

    try {
      const result = await this.model!.generateContentStream({
        contents: [{ role: 'user', text: request.prompt }],
        generationConfig: {
          maxTokens: request.maxTokens || this.config!.maxTokens,
          temperature: request.temperature || this.config!.temperature,
          topK: 40,
          topP: 0.95,
          stopSequences: request.stopSequences
        }
      });

      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) {
          yield {
            text,
            isComplete: false
          };
        }
      }

      yield {
        text: '',
        isComplete: true
      };
    } catch (error) {
      throw new AIError(
        'Gemini streaming failed',
        'STREAMING_ERROR',
        'gemini',
        { originalError: error }
      );
    }
  }
}

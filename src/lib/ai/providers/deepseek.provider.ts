import OpenAI from 'openai';
import {
  AIProvider,
  AIModelConfig,
  AICompletionRequest,
  AICompletionResponse,
  AIStreamChunk,
  AIError
} from '../types';

export class DeepseekProvider implements AIProvider {
  private client: OpenAI | null = null;
  private config: AIModelConfig | null = null;

  async initialize(config: AIModelConfig): Promise<void> {
    try {
      this.client = new OpenAI({
        baseURL: 'https://api.deepseek.com',
        apiKey: config.apiKey,
        maxRetries: 3
      });
      this.config = config;

      // Validate connection by listing models
      await this.client.models.list();
    } catch (error: any) {
      let code = 'INITIALIZATION_ERROR';
      let message = 'Failed to initialize Deepseek model';

      // Map Deepseek error codes
      if (error.status === 401) {
        code = 'AUTHENTICATION_ERROR';
        message = 'Invalid API key';
      } else if (error.status === 402) {
        code = 'INSUFFICIENT_BALANCE';
        message = 'Insufficient account balance';
      } else if (error.status === 429) {
        code = 'RATE_LIMIT_EXCEEDED';
        message = 'Rate limit reached';
      }

      throw new AIError(
        message,
        code,
        'deepseek',
        { originalError: error }
      );
    }
  }

  async validateConfig(config: AIModelConfig): Promise<boolean> {
    try {
      const tempClient = new OpenAI({
        baseURL: 'https://api.deepseek.com',
        apiKey: config.apiKey
      });
      await tempClient.models.list();
      return true;
    } catch {
      return false;
    }
  }

  private validateInitialization(): void {
    if (!this.client || !this.config) {
      throw new AIError(
        'Deepseek provider not initialized',
        'NOT_INITIALIZED',
        'deepseek'
      );
    }
  }

  async generateCompletion(request: AICompletionRequest): Promise<AICompletionResponse> {
    this.validateInitialization();

    try {
      const completion = await this.client!.chat.completions.create({
        model: this.config!.modelName,
        messages: [{ role: "user", content: request.prompt }],
        max_tokens: request.maxTokens || this.config!.maxTokens,
        temperature: request.temperature || this.config!.temperature,
        stop: request.stopSequences,
        stream: false
      });

      if (!completion.choices?.[0]?.message?.content) {
        throw new AIError(
          'Empty response from Deepseek',
          'EMPTY_RESPONSE',
          'deepseek'
        );
      }

      return {
        text: completion.choices[0].message.content,
        usage: {
          promptTokens: completion.usage?.prompt_tokens || 0,
          completionTokens: completion.usage?.completion_tokens || 0,
          totalTokens: completion.usage?.total_tokens || 0
        },
        metadata: {
          provider: 'deepseek',
          model: this.config!.modelName,
          finishReason: completion.choices[0].finish_reason
        }
      };
    } catch (error: any) {
      // Map Deepseek error codes to our error types
      let code = 'COMPLETION_ERROR';
      let message = 'Deepseek completion failed';

      if (error.status === 400) {
        code = 'INVALID_REQUEST';
        message = 'Invalid request format';
      } else if (error.status === 401) {
        code = 'AUTHENTICATION_ERROR';
        message = 'Invalid API key';
      } else if (error.status === 402) {
        code = 'INSUFFICIENT_BALANCE';
        message = 'Insufficient account balance';
      } else if (error.status === 429) {
        code = 'RATE_LIMIT_EXCEEDED';
        message = 'Rate limit reached';
      } else if (error.status === 500) {
        code = 'SERVER_ERROR';
        message = 'Deepseek server error';
      } else if (error.status === 503) {
        code = 'SERVER_OVERLOADED';
        message = 'Deepseek server overloaded';
      }

      throw new AIError(message, code, 'deepseek', { originalError: error });
    }
  }

  async *generateStreamingCompletion(request: AICompletionRequest): AsyncGenerator<AIStreamChunk> {
    this.validateInitialization();

    try {
      const stream = await this.client!.chat.completions.create({
        model: this.config!.modelName,
        messages: [{ role: "user", content: request.prompt }],
        max_tokens: request.maxTokens || this.config!.maxTokens,
        temperature: request.temperature || this.config!.temperature,
        stop: request.stopSequences,
        stream: true
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          yield {
            text: content,
            isComplete: false
          };
        }
      }

      yield {
        text: '',
        isComplete: true
      };
    } catch (error: any) {
      let code = 'STREAMING_ERROR';
      let message = 'Deepseek streaming failed';

      if (error.status === 429) {
        code = 'RATE_LIMIT_EXCEEDED';
        message = 'Rate limit reached';
      } else if (error.status === 503) {
        code = 'SERVER_OVERLOADED';
        message = 'Server overloaded';
      }

      throw new AIError(message, code, 'deepseek', { originalError: error });
    }
  }
}

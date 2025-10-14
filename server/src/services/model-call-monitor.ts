import { logger } from '../logger';

export interface ModelCallRequest {
  id: string;
  timestamp: Date;
  provider: 'openai' | 'anthropic' | 'google' | 'mock';
  model: string;
  endpoint: string;
  inputTokens?: number;
  requestId?: string;
  requestBody?: any;
  headers?: Record<string, string>;
}

export interface ModelCallFailure extends ModelCallRequest {
  httpStatus: number;
  providerErrorCode?: string;
  rawErrorMessage: string;
  errorResponse?: any;
  estimatedInputTokens?: number;
  suggestedFix?: string;
}

class ModelCallMonitor {
  private failedCalls: ModelCallFailure[] = [];
  private maxStoredFailures = 50; // Keep last 50 failures

  /**
   * Log a failed model call with detailed error information
   */
  logFailure(failure: ModelCallFailure): void {
    // Add suggested fix based on error analysis
    failure.suggestedFix = this.generateSuggestedFix(failure);
    
    // Store in memory (in production, this would go to database/redis)
    this.failedCalls.unshift(failure);
    if (this.failedCalls.length > this.maxStoredFailures) {
      this.failedCalls = this.failedCalls.slice(0, this.maxStoredFailures);
    }

    // Log to Winston [[memory:3752752]]
    logger.error('Model API call failed', {
      id: failure.id,
      provider: failure.provider,
      model: failure.model,
      httpStatus: failure.httpStatus,
      providerErrorCode: failure.providerErrorCode,
      rawErrorMessage: failure.rawErrorMessage,
      estimatedInputTokens: failure.estimatedInputTokens,
      suggestedFix: failure.suggestedFix,
      timestamp: failure.timestamp.toISOString()
    });

    // Also log to console for immediate visibility
    console.error(`🚨 Model Call Failed: ${failure.provider}/${failure.model}`, {
      id: failure.id,
      status: failure.httpStatus,
      error: failure.rawErrorMessage,
      tokens: failure.estimatedInputTokens,
      fix: failure.suggestedFix
    });
  }

  /**
   * Log a successful model call for monitoring
   */
  logSuccess(request: ModelCallRequest, responseTokens?: number): void {
    logger.info('Model API call succeeded', {
      id: request.id,
      provider: request.provider,
      model: request.model,
      inputTokens: request.inputTokens,
      outputTokens: responseTokens,
      timestamp: request.timestamp.toISOString()
    });
  }

  /**
   * Get the last N failed model calls
   */
  getLastFailedCalls(count: number = 3): ModelCallFailure[] {
    return this.failedCalls.slice(0, count);
  }

  /**
   * Generate suggested fixes based on error analysis
   */
  private generateSuggestedFix(failure: ModelCallFailure): string {
    const { httpStatus, providerErrorCode, rawErrorMessage, estimatedInputTokens, provider, model } = failure;

    // Context/token size errors
    if (httpStatus === 400 && (
      rawErrorMessage.toLowerCase().includes('token') ||
      rawErrorMessage.toLowerCase().includes('context') ||
      rawErrorMessage.toLowerCase().includes('maximum') ||
      providerErrorCode === 'context_length_exceeded'
    )) {
      const suggestions = [`Reduce input context size (current: ~${estimatedInputTokens || 'unknown'} tokens)`];
      
      if (provider === 'openai') {
        if (model.includes('gpt-4')) {
          suggestions.push('Switch to gpt-4-turbo (128k context) or gpt-4o (128k context)');
        } else {
          suggestions.push('Switch to gpt-3.5-turbo-16k for larger context');
        }
      } else if (provider === 'anthropic') {
        if (!model.includes('claude-3')) {
          suggestions.push('Switch to Claude-3 models (200k context window)');
        }
      }
      
      suggestions.push('Implement text truncation or chunking strategy');
      return suggestions.join(' OR ');
    }

    // Rate limit errors
    if (httpStatus === 429 || providerErrorCode === 'rate_limit_exceeded') {
      return 'Implement exponential backoff retry OR upgrade API tier OR reduce request frequency';
    }

    // Authentication errors
    if (httpStatus === 401 || httpStatus === 403) {
      return 'Check API key validity OR verify account permissions OR check billing status';
    }

    // Model not found errors
    if (httpStatus === 404 || providerErrorCode === 'model_not_found') {
      const modelSuggestions: Record<string, string[]> = {
        openai: ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'],
        anthropic: ['claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307'],
        google: ['gemini-pro', 'gemini-pro-vision']
      };
      const suggested = modelSuggestions[provider] || ['Check provider documentation for available models'];
      return `Use available model: ${suggested.join(' OR ')}`;
    }

    // Server errors
    if (httpStatus >= 500) {
      return 'Provider server error - retry with exponential backoff OR switch to backup provider';
    }

    // Generic fallback
    return `Check provider documentation for error code: ${providerErrorCode || httpStatus}`;
  }

  /**
   * Estimate token count for common inputs (rough approximation)
   */
  estimateTokens(text: string): number {
    // Rough approximation: ~4 characters per token for English text
    return Math.ceil(text.length / 4);
  }

  /**
   * Create a unique ID for tracking calls
   */
  generateCallId(): string {
    return `model_call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const modelCallMonitor = new ModelCallMonitor();

/**
 * Wrapper function for making monitored API calls
 */
export async function monitoredApiCall<T>(
  callInfo: Omit<ModelCallRequest, 'id' | 'timestamp'>,
  apiCall: () => Promise<T>
): Promise<T> {
  const requestId = modelCallMonitor.generateCallId();
  const request: ModelCallRequest = {
    ...callInfo,
    id: requestId,
    timestamp: new Date()
  };

  try {
    const result = await apiCall();
    modelCallMonitor.logSuccess(request);
    return result;
  } catch (error: any) {
    const failure: ModelCallFailure = {
      ...request,
      httpStatus: error.response?.status || error.status || 500,
      providerErrorCode: error.response?.data?.error?.code || error.code,
      rawErrorMessage: error.message || 'Unknown error',
      errorResponse: error.response?.data || error.data,
      estimatedInputTokens: request.inputTokens || (
        request.requestBody ? modelCallMonitor.estimateTokens(JSON.stringify(request.requestBody)) : undefined
      )
    };

    modelCallMonitor.logFailure(failure);
    throw error;
  }
}

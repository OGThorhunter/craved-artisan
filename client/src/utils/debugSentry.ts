/**
 * Enhanced Sentry debugging utilities
 * This helps capture and log detailed error information for debugging
 */

import * as Sentry from '@sentry/react';

export interface ErrorContext {
  component: string;
  step?: string;
  userRole?: string;
  email?: string;
  additionalData?: Record<string, unknown>;
}

/**
 * Enhanced error logging with detailed context
 */
export const logError = (error: Error, context: ErrorContext) => {
  // Log to console for immediate debugging
  console.error('🚨 Error captured:', {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent
  });

  // Send to Sentry with enhanced context
  Sentry.captureException(error, {
    tags: {
      component: context.component,
      step: context.step || 'unknown',
      userRole: context.userRole || 'unknown',
    },
    extra: {
      ...context.additionalData,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    },
    level: 'error',
  });
};

/**
 * Log signup-specific errors with detailed context
 */
export const logSignupError = (
  error: Error, 
  step: string, 
  formData: Record<string, unknown>
) => {
  logError(error, {
    component: 'signup',
    step,
    userRole: formData.role as string,
    email: formData.email as string,
    additionalData: {
      currentStep: step,
      hasEmail: !!formData.email,
      hasPassword: !!formData.password,
      hasName: !!formData.name,
      passwordLength: (formData.password as string)?.length || 0,
      hasProfileData: Object.keys(formData.profileData || {}).length > 0,
      agreementsCount: (formData.acceptedAgreements as unknown[])?.length || 0,
      stripeCompleted: formData.stripeCompleted || false,
    }
  });
};

/**
 * Log API errors with request/response details
 */
export const logApiError = (
  error: Error,
  endpoint: string,
  method: string,
  requestData?: Record<string, unknown>,
  responseData?: Record<string, unknown>
) => {
  logError(error, {
    component: 'api',
    additionalData: {
      endpoint,
      method,
      requestData,
      responseData,
      statusCode: (error as any).response?.status,
      statusText: (error as any).response?.statusText,
    }
  });
};

/**
 * Create a test error to verify Sentry is working
 */
export const testSentryError = () => {
  const testError = new Error('Test error for Sentry debugging');
  logError(testError, {
    component: 'debug',
    step: 'test',
    additionalData: {
      testType: 'manual',
      purpose: 'verify sentry integration'
    }
  });
};

/**
 * Get current error context for debugging
 */
export const getErrorContext = () => {
  return {
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
    localStorage: Object.keys(localStorage),
    sessionStorage: Object.keys(sessionStorage),
  };
};

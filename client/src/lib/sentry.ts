import * as Sentry from "@sentry/react";

/**
 * Initialize Sentry for error tracking, performance monitoring, and logging
 * Only initializes in production or when explicitly enabled in development
 */
export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  
  // Only initialize if DSN is provided
  if (!dsn) {
    console.warn('Sentry DSN not found. Error tracking disabled.');
    return;
  }

  const environment = import.meta.env.MODE;
  const isProduction = environment === 'production';

  Sentry.init({
    dsn,
    environment,
    
    // Enable structured logging
    enableLogs: true,
    
    // Integrations for tracking and logging
    integrations: [
      // Browser tracing for performance monitoring
      Sentry.browserTracingIntegration(),
      
      // Session Replay - captures user sessions when errors occur
      Sentry.replayIntegration({
        maskAllText: true, // Privacy: mask all text content
        blockAllMedia: true, // Privacy: block all media elements
      }),
      
      // Console logging integration - automatically capture console errors
      Sentry.consoleLoggingIntegration({ 
        levels: ['error', 'warn'] // Capture console.error and console.warn
      }),
    ],

    // Performance Monitoring - sample rate
    tracesSampleRate: isProduction ? 0.1 : 1.0, // 10% in production, 100% in dev
    
    // Session Replay - only capture sessions with errors
    replaysSessionSampleRate: 0, // Don't capture all sessions
    replaysOnErrorSampleRate: 1.0, // Capture 100% of sessions with errors

    // Filter out noise
    beforeSend(event, hint) {
      // Don't send errors from browser extensions
      if (event.exception?.values?.[0]?.stacktrace?.frames?.some(
        frame => frame.filename?.includes('extension://')
      )) {
        return null;
      }

      // Log errors in development
      if (!isProduction) {
        console.error('Sentry captured error:', hint.originalException || hint.syntheticException);
      }

      return event;
    },

    // Ignore common browser errors that aren't actionable
    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      'chrome-extension://',
      'moz-extension://',
      // Network errors that are user-related
      'NetworkError',
      'Network request failed',
      // ResizeObserver errors (harmless)
      'ResizeObserver loop limit exceeded',
    ],
  });
}

// Export logger for structured logging
export const { logger } = Sentry;

export default Sentry;


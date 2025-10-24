import * as Sentry from "@sentry/node";

export function initSentry() {
  const dsn = process.env.SENTRY_DSN;
  
  if (!dsn) {
    console.warn('Sentry DSN not found. Error tracking disabled.');
    console.log('Available env vars:', Object.keys(process.env).filter(key => key.includes('SENTRY')));
    return;
  }

  const environment = process.env.NODE_ENV || 'development';
  const isProduction = environment === 'production';

  console.log(`🔍 Initializing Sentry for ${environment} environment...`);

  Sentry.init({
    dsn,
    environment,
    tracesSampleRate: isProduction ? 0.1 : 1.0,
    debug: !isProduction,
    
    beforeSend(event, hint) {
      // Log errors in development
      if (!isProduction) {
        console.error('🚨 Sentry captured error:', hint.originalException || hint.syntheticException);
        console.error('📊 Event details:', {
          message: event.message,
          exception: event.exception,
          tags: event.tags,
          extra: event.extra
        });
      }
      return event;
    },

    beforeSendTransaction(event) {
      // Filter out health check requests
      if (event.transaction === 'GET /health') {
        return null;
      }
      return event;
    },

    // Add custom tags for better organization
    initialScope: {
      tags: {
        service: 'craved-artisan-backend',
        version: process.env.npm_package_version || '1.0.0'
      }
    }
  });

  console.log('✅ Sentry initialized successfully');
}

export default Sentry;

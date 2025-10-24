import * as Sentry from '@sentry/react';
import { logger } from '../lib/sentry';

/**
 * Test function to verify Sentry is working
 * Call this from the browser console: window.testSentry()
 */
export function testSentry() {
  console.log('🧪 Testing Sentry error tracking, logging, and tracing...');
  
  return Sentry.startSpan(
    {
      op: 'test.sentry',
      name: 'Sentry Integration Test',
    },
    (span) => {
      try {
        span.setAttribute('test_type', 'integration');
        span.setAttribute('timestamp', new Date().toISOString());
        
        // Test 1: Capture a test message
        Sentry.captureMessage('Test message from Craved Artisan', 'info');
        console.log('✅ Test message sent to Sentry');
        
        // Test 2: Test structured logging
        logger.info('Testing Sentry logger integration', {
          test: true,
          component: 'sentry_test',
        });
        logger.warn('Testing warning level logging', {
          warningType: 'test',
        });
        console.log('✅ Test logs sent to Sentry');
        
        // Test 3: Test tracing with a simulated API call
        Sentry.startSpan(
          {
            op: 'http.client',
            name: 'Test API Call',
          },
          (childSpan) => {
            childSpan.setAttribute('endpoint', '/test');
            childSpan.setAttribute('method', 'GET');
            childSpan.setStatus({ code: 1, message: 'ok' });
            console.log('✅ Test span created');
          }
        );
        
        // Test 4: Capture a test error
        const testError = new Error('Test error from Craved Artisan - Sentry is working!');
        Sentry.captureException(testError, {
          tags: {
            test: true,
            component: 'sentry_test',
          },
          extra: {
            timestamp: new Date().toISOString(),
            message: 'This is a test error to verify Sentry integration',
          },
        });
        console.log('✅ Test error sent to Sentry');
        
        // Test 5: Test error logging
        logger.error('Test error log', {
          errorType: 'test',
          severity: 'low',
        });
        console.log('✅ Test error log sent to Sentry');
        
        span.setStatus({ code: 1, message: 'ok' });
        console.log('📊 Check your Sentry dashboard in a few seconds!');
        console.log('You should see:');
        console.log('  - Issues: Test error');
        console.log('  - Logs: Info, Warning, and Error logs');
        console.log('  - Performance: Test spans and traces');
        
        return 'Sentry test completed! Check your dashboard.';
      } catch (error) {
        span.setStatus({ code: 2, message: 'error' });
        console.error('❌ Sentry test failed:', error);
        return 'Sentry test failed. Check console for details.';
      }
    }
  );
}

// Make it available globally for easy testing
if (typeof window !== 'undefined') {
  (window as any).testSentry = testSentry;
}


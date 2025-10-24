import React, { useState } from 'react';
import { testSentryError, logError } from '../../utils/debugSentry';

/**
 * Debug component for testing Sentry error reporting
 * This helps verify that Sentry is working correctly
 */
const SentryDebugger: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testBasicError = () => {
    try {
      throw new Error('Test error for Sentry debugging');
    } catch (error) {
      if (error instanceof Error) {
        logError(error, {
          component: 'debug',
          step: 'basic_test',
          additionalData: {
            testType: 'basic',
            purpose: 'verify sentry integration'
          }
        });
        addResult('✅ Basic error sent to Sentry');
      }
    }
  };

  const testSignupError = () => {
    try {
      throw new Error('Simulated signup error');
    } catch (error) {
      if (error instanceof Error) {
        logError(error, {
          component: 'signup',
          step: 'test',
          userRole: 'VENDOR',
          email: 'test@example.com',
          additionalData: {
            testType: 'signup_simulation',
            purpose: 'verify signup error tracking'
          }
        });
        addResult('✅ Signup error simulation sent to Sentry');
      }
    }
  };

  const testApiError = () => {
    try {
      const mockError = new Error('Simulated API error');
      (mockError as any).response = {
        status: 400,
        statusText: 'Bad Request',
        data: { message: 'Test API error' }
      };
      throw mockError;
    } catch (error) {
      if (error instanceof Error) {
        logError(error, {
          component: 'api',
          additionalData: {
            endpoint: '/test/endpoint',
            method: 'POST',
            testType: 'api_simulation',
            purpose: 'verify API error tracking'
          }
        });
        addResult('✅ API error simulation sent to Sentry');
      }
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="p-6 bg-gray-50 rounded-lg border">
      <h3 className="text-lg font-semibold mb-4">Sentry Debugger</h3>
      
      <div className="space-y-3 mb-4">
        <button
          onClick={testBasicError}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test Basic Error
        </button>
        
        <button
          onClick={testSignupError}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 ml-2"
        >
          Test Signup Error
        </button>
        
        <button
          onClick={testApiError}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 ml-2"
        >
          Test API Error
        </button>
        
        <button
          onClick={clearResults}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 ml-2"
        >
          Clear Results
        </button>
      </div>

      <div className="bg-white p-4 rounded border">
        <h4 className="font-medium mb-2">Test Results:</h4>
        {testResults.length === 0 ? (
          <p className="text-gray-500">No tests run yet. Click a button above to test Sentry.</p>
        ) : (
          <ul className="space-y-1">
            {testResults.map((result, index) => (
              <li key={index} className="text-sm font-mono">{result}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Instructions:</strong></p>
        <ol className="list-decimal list-inside space-y-1 mt-2">
          <li>Click the test buttons above to send test errors to Sentry</li>
          <li>Check your Sentry dashboard for the errors</li>
          <li>Verify that errors appear with the correct context and tags</li>
          <li>Use this to debug why your actual errors might not be appearing</li>
        </ol>
      </div>
    </div>
  );
};

export default SentryDebugger;

import React from 'react';

// Global error handlers for runtime error trapping

export const setupGlobalErrorHandlers = () => {
  // Temporarily disabled to prevent issues
  console.log('Error handlers disabled for debugging');
  
  // Global window error handler
  // window.onerror = (message, source, lineno, colno, error) => {
  //   console.error('Global error caught:', {
  //     message,
  //     source,
  //     lineno,
  //     colno,
  //     error,
  //     timestamp: new Date().toISOString(),
  //     userAgent: navigator.userAgent,
  //     url: window.location.href
  //   });
    
  //   // You can send this to your error tracking service here
  //   // Example: sendToErrorTracking({ message, source, lineno, colno, error });
    
  //   return false; // Don't prevent default error handling
  // };

  // Unhandled promise rejection handler
  // window.onunhandledrejection = (event) => {
  //   console.error('Unhandled promise rejection:', {
  //     reason: event.reason,
  //     timestamp: new Date().toISOString(),
  //     userAgent: navigator.userAgent,
  //     url: window.location.href
  //   });
    
  //   // You can send this to your error tracking service here
  //   // Example: sendToErrorTracking({ type: 'unhandledRejection', reason: event.reason });
    
  //   event.preventDefault(); // Prevent default browser handling
  // };

  // Console error interceptor - FIXED: Removed recursive call
  // const originalConsoleError = console.error;
  // console.error = (...args) => {
  //   // Call original console.error first
  //   originalConsoleError.apply(console, args);
    
  //   // Then log to your error tracking service (without calling console.error again)
  //   // console.error('Console error intercepted:', {
  //   //   args,
  //   //   timestamp: new Date().toISOString(),
  //   //   userAgent: navigator.userAgent,
  //   //   url: window.location.href
  //   // });
  // };
};

// Error boundary fallback component
export const ErrorFallback: React.FC<{ 
  error: Error; 
  resetErrorBoundary: () => void;
}> = ({ error, resetErrorBoundary }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Something went wrong
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            {error.message || 'An unexpected error occurred'}
          </p>
          <div className="space-y-2">
            <button
              onClick={resetErrorBoundary}
              className="w-full bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
            >
              Try again
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-gray-200 text-gray-900 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
            >
              Go to homepage
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 
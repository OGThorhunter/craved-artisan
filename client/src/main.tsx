import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from 'react-error-boundary';
import { QueryProvider } from './lib/query';
import { HelmetProvider } from 'react-helmet-async';
import './index.css';
import App from './App.tsx';
import { setupGlobalErrorHandlers, ErrorFallback } from './utils/errorHandlers.tsx';

// Setup global error handlers
setupGlobalErrorHandlers();



createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <QueryProvider>
        <HelmetProvider>
          <App />
        </HelmetProvider>
      </QueryProvider>
    </ErrorBoundary>
  </StrictMode>,
);

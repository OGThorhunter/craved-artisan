import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from 'react-error-boundary';
import { QueryProvider } from './lib/query';
import { HelmetProvider } from 'react-helmet-async';
import './index.css';
import App from './App.tsx';
import { setupGlobalErrorHandlers, ErrorFallback } from './utils/errorHandlers.tsx';
import { muteExtensionNoise } from './utils/devConsole';
import { initSentry } from './lib/sentry';
import './utils/testSentry'; // Load test utility

// Initialize Sentry first (before any errors can occur)
initSentry();

// Setup global error handlers
setupGlobalErrorHandlers();

// Mute extension noise in development
muteExtensionNoise();



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

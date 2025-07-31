import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from 'react-error-boundary';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import './index.css';
import App from './App.tsx';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary fallback={<h1>⚠️ App crashed</h1>}>
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <App />
        </HelmetProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
);

import { QueryClient, QueryClientProvider, QueryCache } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (err: any) => {
      // TODO: hook up your toast system here
      // If your fetch wrapper adds requestId, surface it:
      const rid = err?.requestId ? ` (Request ID: ${err.requestId})` : "";
      
      // Better error logging to prevent truncation
      if (err?.response?.data) {
        console.error(`Query error${rid}:`, {
          status: err.response.status,
          statusText: err.response.statusText,
          data: err.response.data,
          message: err.message,
          url: err.config?.url
        });
      } else {
        console.error(`Query error${rid}:`, {
          message: err.message,
          name: err.name,
          stack: err.stack,
          url: err.config?.url
        });
      }
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 5_000,
      retry: 2,
    },
  },
});

export function QueryProvider({ children }: PropsWithChildren) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

export { queryClient };

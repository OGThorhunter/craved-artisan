import { QueryClient, QueryClientProvider, QueryCache } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (err: any) => {
      // TODO: hook up your toast system here
      // If your fetch wrapper adds requestId, surface it:
      const rid = err?.requestId ? ` (Request ID: ${err.requestId})` : "";
      console.error(`Query error${rid}:`, err);
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

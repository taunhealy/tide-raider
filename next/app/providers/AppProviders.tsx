"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { SubscriptionProvider } from "../context/SubscriptionContext";
import { AdProvider } from "../context/AdContext";
import { SessionProvider } from "../context/SessionProvider";

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="error-container">
      <h2>Something went wrong</h2>
      <pre>{error.message}</pre>
    </div>
  );
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          <SubscriptionProvider>
            <AdProvider>{children}</AdProvider>
          </SubscriptionProvider>
        </SessionProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

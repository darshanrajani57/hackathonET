"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useEffect, useState } from "react";

import { getMarketPulse, getSignals } from "@/lib/api";
import { connectMarketWebSocket } from "@/lib/websocket";

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
          },
        },
      }),
  );

  useEffect(() => {
    const cleanup = connectMarketWebSocket();

    queryClient.prefetchQuery({
      queryKey: ["signals"],
      queryFn: getSignals,
    });

    queryClient.prefetchQuery({
      queryKey: ["market-pulse"],
      queryFn: getMarketPulse,
    });

    return () => cleanup?.();
  }, [queryClient]);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useEffect, useState } from "react";

import { getDataSourceStatus, getMarketPulse, getSignals } from "@/lib/api";
import { useMarketStore } from "@/lib/store/market-store";
import { useMockData } from "@/lib/utils";
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
    if (useMockData) {
      useMarketStore.getState().setConnectionStatus("connected");
    }

    const cleanup = useMockData ? undefined : connectMarketWebSocket();

    const refresh = async () => {
      const [signals, pulse] = await Promise.all([getSignals(), getMarketPulse()]);
      const source = getDataSourceStatus();
      const store = useMarketStore.getState();
      store.setSignals(signals);
      store.setPulse(pulse);
      store.setSourceStatus({
        signals: source.signals,
        marketPulse: source.marketPulse,
      });
    };

    void refresh();
    const timer = setInterval(() => {
      void refresh();
    }, 30_000);

    return () => {
      clearInterval(timer);
      cleanup?.();
    };
  }, [queryClient]);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

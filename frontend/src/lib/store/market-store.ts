import { create } from "zustand";

import { mockMarketPulse } from "@/lib/mock/prices";
import { mockSignals } from "@/lib/mock/signals";
import { DataSourceMode } from "@/lib/api";
import { MarketPulse, Signal } from "@/lib/types";
import { useMockData } from "@/lib/utils";

type ConnectionStatus = "connected" | "disconnected" | "reconnecting";

interface MarketStore {
  connectionStatus: ConnectionStatus;
  lastUpdateAt: string;
  latencyMs: number;
  modelName: string;
  signals: Signal[];
  pulse: MarketPulse;
  sourceStatus: {
    signals: DataSourceMode;
    marketPulse: DataSourceMode;
    chart: DataSourceMode;
  };
  setConnectionStatus: (status: ConnectionStatus) => void;
  setSignals: (signals: Signal[]) => void;
  setPulse: (pulse: MarketPulse) => void;
  setSourceStatus: (status: Partial<MarketStore["sourceStatus"]>) => void;
  updateFromSocket: (payload: Partial<{ signals: Signal[]; pulse: MarketPulse; latencyMs: number }>) => void;
}

export const useMarketStore = create<MarketStore>((set) => ({
  connectionStatus: useMockData ? "connected" : "disconnected",
  lastUpdateAt: new Date().toISOString(),
  latencyMs: 42,
  modelName: "qwen3:8b",
  signals: mockSignals,
  pulse: mockMarketPulse,
  sourceStatus: {
    signals: "MOCK",
    marketPulse: "MOCK",
    chart: "MOCK",
  },
  setConnectionStatus: (status) => set({ connectionStatus: status }),
  setSignals: (signals) => set({ signals, lastUpdateAt: new Date().toISOString() }),
  setPulse: (pulse) => set({ pulse, lastUpdateAt: new Date().toISOString() }),
  setSourceStatus: (status) =>
    set((state) => ({
      sourceStatus: {
        ...state.sourceStatus,
        ...status,
      },
    })),
  updateFromSocket: (payload) =>
    set((state) => ({
      ...state,
      signals: payload.signals ?? state.signals,
      pulse: payload.pulse ?? state.pulse,
      latencyMs: payload.latencyMs ?? state.latencyMs,
      lastUpdateAt: new Date().toISOString(),
    })),
}));

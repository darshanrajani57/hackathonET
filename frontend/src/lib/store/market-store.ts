import { create } from "zustand";

import { mockMarketPulse } from "@/lib/mock/prices";
import { mockSignals } from "@/lib/mock/signals";
import { MarketPulse, Signal } from "@/lib/types";

type ConnectionStatus = "connected" | "disconnected" | "reconnecting";

interface MarketStore {
  connectionStatus: ConnectionStatus;
  lastUpdateAt: string;
  latencyMs: number;
  modelName: string;
  signals: Signal[];
  pulse: MarketPulse;
  setConnectionStatus: (status: ConnectionStatus) => void;
  updateFromSocket: (payload: Partial<{ signals: Signal[]; pulse: MarketPulse; latencyMs: number }>) => void;
}

export const useMarketStore = create<MarketStore>((set) => ({
  connectionStatus: "disconnected",
  lastUpdateAt: new Date().toISOString(),
  latencyMs: 42,
  modelName: "qwen3:8b",
  signals: mockSignals,
  pulse: mockMarketPulse,
  setConnectionStatus: (status) => set({ connectionStatus: status }),
  updateFromSocket: (payload) =>
    set((state) => ({
      ...state,
      signals: payload.signals ?? state.signals,
      pulse: payload.pulse ?? state.pulse,
      latencyMs: payload.latencyMs ?? state.latencyMs,
      lastUpdateAt: new Date().toISOString(),
    })),
}));

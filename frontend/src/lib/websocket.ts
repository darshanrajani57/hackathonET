import { useMarketStore } from "@/lib/store/market-store";

const WS_URL = "ws://localhost:8000/ws/market";

let socket: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let attempt = 0;

function scheduleReconnect(connect: () => void) {
  const delay = Math.min(1000 * 2 ** attempt, 30_000);
  attempt += 1;
  useMarketStore.getState().setConnectionStatus("reconnecting");
  reconnectTimer = setTimeout(connect, delay);
}

export function connectMarketWebSocket() {
  if (typeof window === "undefined") {
    return;
  }

  if (socket && socket.readyState === WebSocket.OPEN) {
    return;
  }

  const connect = () => {
    socket = new WebSocket(WS_URL);

    socket.onopen = () => {
      attempt = 0;
      useMarketStore.getState().setConnectionStatus("connected");
    };

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        useMarketStore.getState().updateFromSocket(payload);
      } catch {
        useMarketStore.getState().setConnectionStatus("connected");
      }
    };

    socket.onerror = () => {
      useMarketStore.getState().setConnectionStatus("reconnecting");
    };

    socket.onclose = () => {
      useMarketStore.getState().setConnectionStatus("disconnected");
      scheduleReconnect(connect);
    };
  };

  connect();

  return () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
    }
    socket?.close();
  };
}

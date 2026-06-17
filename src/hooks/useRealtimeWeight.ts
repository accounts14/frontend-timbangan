import { useEffect, useRef, useState, useCallback } from 'react';
import { WS_URL } from '@/lib/config';
import type { Alert, Device, PressureLog, Settings, WSMessage } from '@/types/api';

interface RealtimeState {
  connected: boolean;
  latest: PressureLog | null;
  settings: Settings | null;
  lastAlert: Alert | null;
  device: Device | null;
}

export function useRealtimeWeight(initial?: {
  latest?: PressureLog | null;
  settings?: Settings | null;
}) {
  const [state, setState] = useState<RealtimeState>({
    connected: false,
    latest:    initial?.latest   ?? null,
    settings:  initial?.settings ?? null,
    lastAlert: null,
    device:    null,
  });

  const wsRef          = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => setState((s) => ({ ...s, connected: true }));

      ws.onmessage = (event) => {
        try {
          const msg: WSMessage = JSON.parse(event.data);
          switch (msg.type) {
            case 'pressure_update':
              setState((s) => ({ ...s, latest: msg.data }));
              break;
            case 'new_alert':
              setState((s) => ({ ...s, lastAlert: msg.data }));
              break;
            case 'device_status':
              setState((s) => ({ ...s, device: msg.data }));
              break;
            case 'settings_update':
              setState((s) => ({ ...s, settings: msg.data }));
              break;
            default:
              break;
          }
        } catch {
          // abaikan pesan malformed
        }
      };

      ws.onclose = () => {
        setState((s) => ({ ...s, connected: false }));
        reconnectTimer.current = setTimeout(connect, 3000);
      };

      ws.onerror = () => ws.close();
    } catch {
      reconnectTimer.current = setTimeout(connect, 3000);
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [connect]);

  return state;
}

// ============================================================
// INCIDENT ROOM — useWebSocket Hook
// Manages WebSocket connection to the FastAPI backend.
// Falls back gracefully when server is unreachable.
// ============================================================

import { useEffect, useRef, useCallback, useState } from 'react';

const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:8000/ws';

export function useWebSocket({ onIncidentCreated, onUpdatePosted, onStatusChanged }) {
  const wsRef       = useRef(null);
  const reconnectRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [attempt,   setAttempt]   = useState(0);

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        setAttempt(0);
        console.log('[WS] Connected to', WS_URL);
      };

      ws.onmessage = (evt) => {
        try {
          const msg = JSON.parse(evt.data);
          switch (msg.type) {
            case 'incident_created':
              onIncidentCreated?.(msg.payload);
              break;
            case 'update_posted':
              onUpdatePosted?.(msg.payload);
              break;
            case 'status_changed':
              onStatusChanged?.(msg.payload);
              break;
            default:
              break;
          }
        } catch (e) {
          console.warn('[WS] Bad message', e);
        }
      };

      ws.onerror = () => {
        // Silently fail — backend may not be running in standalone frontend mode
      };

      ws.onclose = () => {
        setConnected(false);
        // Exponential backoff reconnect (max 30s)
        const delay = Math.min(1000 * 2 ** attempt, 30000);
        reconnectRef.current = setTimeout(() => {
          setAttempt(a => a + 1);
          connect();
        }, delay);
      };
    } catch (e) {
      // WebSocket not available (e.g., in test env)
      setConnected(false);
    }
  }, [attempt, onIncidentCreated, onUpdatePosted, onStatusChanged]);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectRef.current);
      wsRef.current?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Send a message to the server
  const send = useCallback((type, payload) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, payload }));
    }
  }, []);

  return { connected, send };
}

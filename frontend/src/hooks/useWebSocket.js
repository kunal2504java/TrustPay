import { useEffect, useCallback, useRef } from 'react';
import { wsService } from '../services/websocket';

export const useWebSocket = (token) => {
  const isConnectedRef = useRef(false);

  useEffect(() => {
    if (token && !isConnectedRef.current) {
      wsService.connect(token);
      isConnectedRef.current = true;
    }

    return () => {
      if (isConnectedRef.current) {
        wsService.disconnect();
        isConnectedRef.current = false;
      }
    };
  }, [token]);

  const subscribe = useCallback((escrowId) => {
    wsService.subscribe(escrowId);
  }, []);

  const unsubscribe = useCallback((escrowId) => {
    wsService.unsubscribe(escrowId);
  }, []);

  const on = useCallback((event, callback) => {
    return wsService.on(event, callback);
  }, []);

  const off = useCallback((event, callback) => {
    wsService.off(event, callback);
  }, []);

  return {
    subscribe,
    unsubscribe,
    on,
    off
  };
};

export const useEscrowUpdates = (escrowId, onUpdate) => {
  const { subscribe, unsubscribe, on } = useWebSocket();

  useEffect(() => {
    if (!escrowId) return;

    // Subscribe to escrow updates
    subscribe(escrowId);

    // Listen for updates
    const unsubscribeListener = on(`escrow:${escrowId}`, (message) => {
      if (onUpdate) {
        onUpdate(message);
      }
    });

    // Cleanup
    return () => {
      unsubscribe(escrowId);
      unsubscribeListener();
    };
  }, [escrowId, subscribe, unsubscribe, on, onUpdate]);
};

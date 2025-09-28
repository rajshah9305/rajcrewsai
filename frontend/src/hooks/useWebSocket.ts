'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface UseWebSocketOptions {
  onOpen?: (event: Event) => void;
  onMessage?: (event: MessageEvent) => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
  reconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

interface UseWebSocketResult<T = any> {
  data: T | null;
  isConnected: boolean;
  error: Event | null;
  send: (data: any) => void;
  close: () => void;
}

export function useWebSocket<T = any>(
  url: string,
  options: UseWebSocketOptions = {}
): UseWebSocketResult<T> {
  const {
    onOpen,
    onMessage,
    onClose,
    onError,
    reconnect = true,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<Event | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);

  const close = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    
    setIsConnected(false);
    reconnectAttemptsRef.current = 0;
  }, []);

  const send = useCallback((message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const data = typeof message === 'string' ? message : JSON.stringify(message);
      wsRef.current.send(data);
    } else {
      console.warn('WebSocket is not connected. Message not sent:', message);
    }
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = (event) => {
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
        onOpen?.(event);
      };

      ws.onmessage = (event) => {
        try {
          const parsedData = JSON.parse(event.data);
          setData(parsedData);
          onMessage?.(event);
        } catch (err) {
          // If data is not JSON, use it as is
          setData(event.data as T);
          onMessage?.(event);
        }
      };

      ws.onclose = (event) => {
        setIsConnected(false);
        onClose?.(event);

        // Attempt reconnection if enabled
        if (reconnect && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current += 1;
          
          reconnectTimerRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        }
      };

      ws.onerror = (event) => {
        setError(event);
        onError?.(event);
      };
    } catch (err) {
      console.error('Failed to create WebSocket connection:', err);
    }
  }, [url, onOpen, onMessage, onClose, onError, reconnect, reconnectInterval, maxReconnectAttempts]);

  useEffect(() => {
    connect();

    return () => {
      close();
    };
  }, [connect, close]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      close();
    };
  }, [close]);

  return {
    data,
    isConnected,
    error,
    send,
    close,
  };
}

// Custom hook for WebSocket with automatic JSON parsing
export function useJsonWebSocket<T = any>(
  url: string,
  options: UseWebSocketOptions = {}
) {
  const [parsedData, setParsedData] = useState<T | null>(null);

  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      setParsedData(data);
      options.onMessage?.(event);
    } catch (error) {
      console.error('Failed to parse WebSocket message as JSON:', error);
      setParsedData(event.data as T);
      options.onMessage?.(event);
    }
  }, [options.onMessage]);

  const wsResult = useWebSocket(url, {
    ...options,
    onMessage: handleMessage,
  });

  return {
    ...wsResult,
    data: parsedData,
  };
}

// Custom hook for WebSocket subscriptions
export function useWebSocketSubscription<T = any>(
  baseUrl: string,
  channel: string,
  options: UseWebSocketOptions = {}
) {
  const url = `${baseUrl}/${channel}`;
  return useJsonWebSocket<T>(url, options);
}

// Custom hook for multiple WebSocket connections
export function useMultiWebSocket<T = any>(
  urls: string[],
  options: UseWebSocketOptions = {}
) {
  const connections = urls.map(url => useWebSocket<T>(url, options));
  
  const allConnected = connections.every(conn => conn.isConnected);
  const anyError = connections.some(conn => conn.error);
  const allData = connections.map(conn => conn.data);

  const sendAll = useCallback((message: any) => {
    connections.forEach(conn => conn.send(message));
  }, [connections]);

  const closeAll = useCallback(() => {
    connections.forEach(conn => conn.close());
  }, [connections]);

  return {
    connections,
    allConnected,
    anyError,
    allData,
    sendAll,
    closeAll,
  };
}
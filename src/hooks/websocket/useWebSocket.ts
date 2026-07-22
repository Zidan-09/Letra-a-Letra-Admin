import { useEffect, useRef, useState, useCallback } from 'react';

interface UseWebSocketOptions {
  onOpen?: (event: Event) => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
  onMessage?: (event: MessageEvent) => void;
}

export const useWebSocket = <T = any>(url: string, options?: UseWebSocketOptions) => {
  const [data, setData] = useState<T | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
  if (!url) return;

    const socket = new WebSocket(url);
    ws.current = socket;

    socket.onopen = (event) => {
      setIsConnected(true);
      options?.onOpen?.(event);
    }

    socket.onclose = (event) => {
      setIsConnected(false);
      options?.onClose?.(event);
    }

    socket.onerror = (event) => {
      options?.onError?.(event);
    }

    socket.onmessage = (event) => {        
      try {
        const parsedData = JSON.parse(event.data);
        setData(parsedData);

      } catch {
        setData(event.data as unknown as T);
      }
      options?.onMessage?.(event);
    }

    return () => {
      socket.close();
    }

  }, [url]);

  const sendMessage = useCallback((message: any) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const messageString = typeof message === 'object' ? JSON.stringify(message) : String(message);
      ws.current.send(messageString);
    } else {
      console.warn('WebSocket não está conectado. Mensagem não enviada:', message);
    }
  }, []);

  return { data, isConnected, sendMessage };
};
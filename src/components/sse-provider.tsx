import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

interface SseEvent {
  type: string;
  data?: any;
  message?: string;
  timestamp: string;
  userId?: number;
  orderId?: string;
  status?: string;
}

interface SseContextType {
  isConnected: boolean;
  lastEvent: SseEvent | null;
  connectionError: string | null;
  reconnect: () => void;
  disconnect: () => void;
}

const SseContext = createContext<SseContextType | undefined>(undefined);

interface SseProviderProps {
  children: React.ReactNode;
  userId?: number;
  token?: string;
}

export const SseProvider: React.FC<SseProviderProps> = ({
  children,
  userId,
  token,
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<SseEvent | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [maxReconnectAttempts] = useState(5);

  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL || "https://api-staging.easymarket.africa";

  const connect = useCallback(() => {
    if (eventSource) {
      eventSource.close();
    }

    setConnectionError(null);

    // Determine the SSE endpoint
    const endpoint = userId
      ? `${baseUrl}/api/v1/sse/events/${userId}`
      : `${baseUrl}/api/v1/sse/events`;

    console.log(`🔌 Connecting to SSE: ${endpoint}`);

    const es = new EventSource(endpoint, {
      withCredentials: true,
    });

    es.onopen = () => {
      console.log("✅ SSE connection established");
      setIsConnected(true);
      setConnectionError(null);
      setReconnectAttempts(0);
    };

    es.onmessage = (event) => {
      try {
        const data: SseEvent = JSON.parse(event.data);
        console.log("📨 SSE event received:", data);
        setLastEvent(data);

        // Handle different event types
        switch (data.type) {
          case "connected":
            console.log("🎉 SSE connection confirmed");
            break;
          case "heartbeat":
            // Heartbeat received, connection is alive
            break;
          case "order_update":
            console.log("📦 Order update received:", data.data);
            // Handle order updates
            break;
          case "order_status_change":
            console.log("🔄 Order status changed:", data);
            // Handle order status changes
            break;
          case "notification":
            console.log("🔔 Notification received:", data.data);
            // Handle notifications
            break;
          case "chat_message":
            console.log("💬 Chat message received:", data.data);
            // Handle chat messages
            break;
          case "admin_broadcast":
            console.log("📢 Admin broadcast received:", data.data);
            // Handle admin broadcasts
            break;
          default:
            console.log("📨 Unknown event type:", data.type);
        }
      } catch (error) {
        console.error("❌ Error parsing SSE event:", error);
      }
    };

    es.onerror = (error) => {
      console.error("❌ SSE connection error:", error);
      setIsConnected(false);
      setConnectionError("Connection failed");

      // Attempt to reconnect
      if (reconnectAttempts < maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
        console.log(
          `🔄 Attempting to reconnect in ${delay}ms (attempt ${
            reconnectAttempts + 1
          }/${maxReconnectAttempts})`
        );

        setTimeout(() => {
          setReconnectAttempts((prev) => prev + 1);
          connect();
        }, delay);
      } else {
        console.error("❌ Max reconnection attempts reached");
        setConnectionError("Max reconnection attempts reached");
      }
    };

    setEventSource(es);
  }, [baseUrl, userId, reconnectAttempts, maxReconnectAttempts, eventSource]);

  const disconnect = useCallback(() => {
    if (eventSource) {
      console.log("🔌 Disconnecting SSE");
      eventSource.close();
      setEventSource(null);
      setIsConnected(false);
      setLastEvent(null);
      setConnectionError(null);
    }
  }, [eventSource]);

  const reconnect = useCallback(() => {
    console.log("🔄 Manual reconnect requested");
    setReconnectAttempts(0);
    disconnect();
    setTimeout(connect, 1000);
  }, [connect, disconnect]);

  // Auto-connect on mount
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [eventSource]);

  const contextValue: SseContextType = {
    isConnected,
    lastEvent,
    connectionError,
    reconnect,
    disconnect,
  };

  return (
    <SseContext.Provider value={contextValue}>{children}</SseContext.Provider>
  );
};

export const useSse = (): SseContextType => {
  const context = useContext(SseContext);
  if (context === undefined) {
    throw new Error("useSse must be used within a SseProvider");
  }
  return context;
};

// Hook for specific event types
export const useSseEvent = (eventType: string) => {
  const { lastEvent } = useSse();
  return lastEvent?.type === eventType ? lastEvent : null;
};

// Hook for order updates
export const useOrderUpdates = () => {
  const { lastEvent } = useSse();
  return lastEvent?.type === "order_update" ? lastEvent : null;
};

// Hook for notifications
export const useNotifications = () => {
  const { lastEvent } = useSse();
  return lastEvent?.type === "notification" ? lastEvent : null;
};

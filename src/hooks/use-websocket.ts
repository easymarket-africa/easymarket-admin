import { useEffect, useRef, useState, useCallback } from "react";
import {
  webSocketService,
  WebSocketMessage,
  OrderUpdateData,
  NotificationData,
  ChatData,
} from "@/services/websocket.service";

export interface UseWebSocketOptions {
  token?: string;
  serverUrl?: string;
  autoConnect?: boolean;
  onOrderUpdate?: (data: OrderUpdateData) => void;
  onNotification?: (data: NotificationData) => void;
  onChatMessage?: (data: ChatData) => void;
  onBroadcast?: (data: Record<string, unknown>) => void;
  onConnect?: () => void;
  onDisconnect?: (reason: string) => void;
  onError?: (error: Error) => void;
}

export interface UseWebSocketReturn {
  isConnected: boolean;
  socketId: string | undefined;
  transport: string | undefined;
  lastMessage: WebSocketMessage | null;
  connect: (token: string, serverUrl?: string) => void;
  disconnect: () => void;
  sendPing: () => void;
  joinRoom: (roomName: string) => void;
  leaveRoom: (roomName: string) => void;
  sendAdminBroadcast: (event: string, message: Record<string, unknown>) => void;
  sendToUser: (
    userId: number,
    event: string,
    message: Record<string, unknown>
  ) => void;
}

export const useWebSocket = (
  options: UseWebSocketOptions = {}
): UseWebSocketReturn => {
  const {
    token,
    serverUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL ||
      "http://localhost:3001",
    autoConnect = true,
    onOrderUpdate,
    onNotification,
    onChatMessage,
    onBroadcast,
    onConnect,
    onDisconnect,
    onError,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [socketId, setSocketId] = useState<string | undefined>();
  const [transport, setTransport] = useState<string | undefined>();
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);

  const callbacksRef = useRef({
    onOrderUpdate,
    onNotification,
    onChatMessage,
    onBroadcast,
    onConnect,
    onDisconnect,
    onError,
  });

  // Update callbacks ref when they change
  useEffect(() => {
    callbacksRef.current = {
      onOrderUpdate,
      onNotification,
      onChatMessage,
      onBroadcast,
      onConnect,
      onDisconnect,
      onError,
    };
  }, [
    onOrderUpdate,
    onNotification,
    onChatMessage,
    onBroadcast,
    onConnect,
    onDisconnect,
    onError,
  ]);

  // Event handlers
  const handleConnect = useCallback(() => {
    setIsConnected(true);
    setSocketId(webSocketService.socketId);
    setTransport(webSocketService.transport);
    callbacksRef.current.onConnect?.();
  }, []);

  const handleDisconnect = useCallback((...args: unknown[]) => {
    const reason = args[0] as string;
    setIsConnected(false);
    setSocketId(undefined);
    setTransport(undefined);
    callbacksRef.current.onDisconnect?.(reason);
  }, []);

  const handleError = useCallback((...args: unknown[]) => {
    const error = args[0] as Error;
    callbacksRef.current.onError?.(error);
  }, []);

  const handleOrderUpdate = useCallback((...args: unknown[]) => {
    const data = args[0] as WebSocketMessage;
    setLastMessage(data);
    if (data.type === "order") {
      callbacksRef.current.onOrderUpdate?.(data.data as OrderUpdateData);
    }
  }, []);

  const handleNotification = useCallback((...args: unknown[]) => {
    const data = args[0] as WebSocketMessage;
    setLastMessage(data);
    if (data.type === "notification") {
      callbacksRef.current.onNotification?.(data.data as NotificationData);
    }
  }, []);

  const handleChatMessage = useCallback((...args: unknown[]) => {
    const data = args[0] as WebSocketMessage;
    setLastMessage(data);
    if (data.type === "chat") {
      callbacksRef.current.onChatMessage?.(data.data as ChatData);
    }
  }, []);

  const handleBroadcast = useCallback((...args: unknown[]) => {
    const data = args[0] as WebSocketMessage;
    setLastMessage(data);
    if (data.type === "broadcast") {
      callbacksRef.current.onBroadcast?.(data.data as Record<string, unknown>);
    }
  }, []);

  // Connect function
  const connect = useCallback(
    (connectToken: string, connectServerUrl?: string) => {
      webSocketService.connect(connectToken, connectServerUrl || serverUrl);
    },
    [serverUrl]
  );

  // Disconnect function
  const disconnect = useCallback(() => {
    webSocketService.disconnect();
  }, []);

  // Send functions
  const sendPing = useCallback(() => {
    webSocketService.sendPing();
  }, []);

  const joinRoom = useCallback((roomName: string) => {
    webSocketService.joinRoom(roomName);
  }, []);

  const leaveRoom = useCallback((roomName: string) => {
    webSocketService.leaveRoom(roomName);
  }, []);

  const sendAdminBroadcast = useCallback(
    (event: string, message: Record<string, unknown>) => {
      webSocketService.sendAdminBroadcast(event, message);
    },
    []
  );

  const sendToUser = useCallback(
    (userId: number, event: string, message: Record<string, unknown>) => {
      webSocketService.sendToUser(userId, event, message);
    },
    []
  );

  // Set up event listeners
  useEffect(() => {
    webSocketService.addEventListener("connect", handleConnect);
    webSocketService.addEventListener("disconnect", handleDisconnect);
    webSocketService.addEventListener("connect_error", handleError);
    webSocketService.addEventListener("error", handleError);
    webSocketService.addEventListener("order", handleOrderUpdate);
    webSocketService.addEventListener("notification", handleNotification);
    webSocketService.addEventListener("chat", handleChatMessage);
    webSocketService.addEventListener("broadcast", handleBroadcast);

    return () => {
      webSocketService.removeEventListener("connect", handleConnect);
      webSocketService.removeEventListener("disconnect", handleDisconnect);
      webSocketService.removeEventListener("connect_error", handleError);
      webSocketService.removeEventListener("error", handleError);
      webSocketService.removeEventListener("order", handleOrderUpdate);
      webSocketService.removeEventListener("notification", handleNotification);
      webSocketService.removeEventListener("chat", handleChatMessage);
      webSocketService.removeEventListener("broadcast", handleBroadcast);
    };
  }, [
    handleConnect,
    handleDisconnect,
    handleError,
    handleOrderUpdate,
    handleNotification,
    handleChatMessage,
    handleBroadcast,
  ]);

  // Auto-connect if token is provided
  useEffect(() => {
    if (autoConnect && token) {
      connect(token);
    }

    return () => {
      if (autoConnect) {
        disconnect();
      }
    };
  }, [autoConnect, token, connect, disconnect]);

  // Update connection state periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setIsConnected(webSocketService.connected);
      setSocketId(webSocketService.socketId);
      setTransport(webSocketService.transport);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    isConnected,
    socketId,
    transport,
    lastMessage,
    connect,
    disconnect,
    sendPing,
    joinRoom,
    leaveRoom,
    sendAdminBroadcast,
    sendToUser,
  };
};

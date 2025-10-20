"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useWebSocket, UseWebSocketOptions } from "@/hooks/use-websocket";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import {
  WebSocketMessage,
  OrderUpdateData,
  NotificationData,
  ChatData,
} from "@/services/websocket.service";

interface WebSocketContextType {
  isConnected: boolean;
  socketId: string | undefined;
  transport: string | undefined;
  lastMessage: WebSocketMessage | null;
  sendPing: () => void;
  joinRoom: (roomName: string) => void;
  leaveRoom: (roomName: string) => void;
  sendAdminBroadcast: (event: string, message: Record<string, unknown>) => void;
  sendToUser: (
    userId: number,
    event: string,
    message: Record<string, unknown>
  ) => void;
  connectionStatus: "connecting" | "connected" | "disconnected" | "error";
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined
);

interface WebSocketProviderProps {
  children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
  children,
}) => {
  const { token, isAuthenticated } = useAuth();
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected" | "error"
  >("disconnected");

  const handleOrderUpdate = (data: OrderUpdateData) => {
    console.log("📦 Order update received in admin:", data);
    toast.info(`Order Update: ${data.orderNumber}`, {
      description: data.message,
      duration: 5000,
    });
  };

  const handleNotification = (data: NotificationData) => {
    console.log("🔔 Notification received in admin:", data);
    toast.info(data.title, {
      description: data.message,
      duration: 4000,
    });
  };

  const handleChatMessage = (data: ChatData) => {
    console.log("💬 Chat message received in admin:", data);
    toast.info(`New Message from ${data.senderName}`, {
      description: data.message,
      duration: 6000,
    });
  };

  const handleBroadcast = (data: Record<string, unknown>) => {
    console.log("📢 Broadcast received in admin:", data);
    toast.info("System Broadcast", {
      description: String(data.message || "System notification"),
      duration: 5000,
    });
  };

  const handleConnect = () => {
    console.log("✅ WebSocket connected in admin panel");
    setConnectionStatus("connected");
    toast.success("Connected to real-time updates");
  };

  const handleDisconnect = (reason: string) => {
    console.log("❌ WebSocket disconnected in admin panel:", reason);
    setConnectionStatus("disconnected");
    toast.error("Disconnected from real-time updates");
  };

  const handleError = (error: Error) => {
    console.error("❌ WebSocket error in admin panel:", error);
    setConnectionStatus("error");
    // Only show error toast for unexpected errors, not connection failures
    if (
      !error.message.includes("websocket error") &&
      !error.message.includes("TransportError")
    ) {
      toast.error("WebSocket connection error");
    }
  };

  const webSocketOptions: UseWebSocketOptions = {
    token: token || undefined,
    serverUrl: process.env.NEXT_PUBLIC_WEBSOCKET_URL || "http://localhost:3100",
    autoConnect: false, // Disable auto-connect to prevent errors when backend is not running
    onOrderUpdate: handleOrderUpdate,
    onNotification: handleNotification,
    onChatMessage: handleChatMessage,
    onBroadcast: handleBroadcast,
    onConnect: handleConnect,
    onDisconnect: handleDisconnect,
    onError: handleError,
  };

  const {
    isConnected,
    socketId,
    transport,
    lastMessage,
    connect,
    sendPing,
    joinRoom,
    leaveRoom,
    sendAdminBroadcast,
    sendToUser,
  } = useWebSocket(webSocketOptions);

  // Update connection status based on WebSocket state
  useEffect(() => {
    if (isAuthenticated && !isConnected) {
      setConnectionStatus("connecting");
    } else if (isConnected) {
      setConnectionStatus("connected");
    } else if (!isAuthenticated) {
      setConnectionStatus("disconnected");
    }
  }, [isAuthenticated, isConnected]);

  // Attempt to connect when authenticated (with delay to allow backend to start)
  useEffect(() => {
    if (isAuthenticated && token && !isConnected) {
      const timer = setTimeout(() => {
        console.log("🔌 Attempting to connect to WebSocket...");
        connect(token);
      }, 2000); // 2 second delay

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, token, isConnected, connect]);

  // Join admin room when connected
  useEffect(() => {
    if (isConnected) {
      joinRoom("admin");
      console.log("🏠 Joined admin room");
    }
  }, [isConnected, joinRoom]);

  const contextValue: WebSocketContextType = {
    isConnected,
    socketId,
    transport,
    lastMessage,
    sendPing,
    joinRoom,
    leaveRoom,
    sendAdminBroadcast,
    sendToUser,
    connectionStatus,
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocketContext = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error(
      "useWebSocketContext must be used within a WebSocketProvider"
    );
  }
  return context;
};

import { io, Socket } from "socket.io-client";

export interface WebSocketMessage {
  id: string;
  type: "order" | "notification" | "chat" | "broadcast";
  data: OrderUpdateData | NotificationData | ChatData | Record<string, unknown>;
  timestamp: string;
}

export interface OrderUpdateData {
  orderId: number;
  orderNumber: string;
  userId: number;
  status: string;
  paymentStatus?: string;
  message: string;
  timestamp: Date;
  metadata?: {
    agentId?: number;
    agentName?: string;
    estimatedDeliveryTime?: Date;
    actualDeliveryTime?: Date;
    trackingInfo?: Record<string, unknown>;
    cancellationReason?: string;
  };
}

export interface NotificationData {
  title: string;
  message: string;
  type?: string;
}

export interface ChatData {
  message: string;
  senderId: number;
  senderName: string;
  chatId?: string;
}

class WebSocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 1000;
  private eventListeners: Map<string, ((...args: unknown[]) => void)[]> =
    new Map();

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners() {
    // Connection events
    this.addEventListener("connect", () => {
      console.log("🔌 WebSocket connected");
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.addEventListener("disconnect", (...args: unknown[]) => {
      const reason = args[0] as string;
      console.log("🔌 WebSocket disconnected:", reason);
      this.isConnected = false;
      this.handleReconnection();
    });

    this.addEventListener("connect_error", (...args: unknown[]) => {
      const error = args[0] as Error;
      console.error("❌ WebSocket connection error:", error);
      this.handleReconnection();
    });

    // Message events
    this.addEventListener("order", (...args: unknown[]) => {
      const data = args[0] as WebSocketMessage;
      console.log("📦 Order update received:", data);
    });

    this.addEventListener("notification", (...args: unknown[]) => {
      const data = args[0] as WebSocketMessage;
      console.log("🔔 Notification received:", data);
    });

    this.addEventListener("chat", (...args: unknown[]) => {
      const data = args[0] as WebSocketMessage;
      console.log("💬 Chat message received:", data);
    });

    this.addEventListener("broadcast", (...args: unknown[]) => {
      const data = args[0] as WebSocketMessage;
      console.log("📢 Broadcast received:", data);
    });

    this.addEventListener("connected", (...args: unknown[]) => {
      const data = args[0] as Record<string, unknown>;
      console.log("✅ Connection confirmed:", data);
    });

    this.addEventListener("error", (...args: unknown[]) => {
      const data = args[0] as Record<string, unknown>;
      console.error("❌ WebSocket error:", data);
    });
  }

  private handleReconnection() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay =
        this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1);

      console.log(
        `🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`
      );

      setTimeout(() => {
        if (this.socket && !this.isConnected) {
          this.socket.connect();
        }
      }, delay);
    } else {
      console.error("❌ Max reconnection attempts reached");
    }
  }

  connect(
    token: string,
    serverUrl: string | undefined = process.env.NEXT_PUBLIC_WEBSOCKET_URL
  ) {
    if (this.socket && this.isConnected) {
      console.log("🔌 Already connected to WebSocket");
      return;
    }

    console.log("🔌 Connecting to WebSocket server:", serverUrl);
    console.log("🔌 Using token:", token ? "✅ Present" : "❌ Missing");

    try {
      this.socket = io(serverUrl, {
        auth: {
          token: token,
        },
        transports: ["websocket", "polling"],
        forceNew: true,
        timeout: 10000, // Reduced timeout
        reconnection: true,
        reconnectionAttempts: 3, // Reduced attempts
        reconnectionDelay: 2000, // Increased delay
        reconnectionDelayMax: 10000,
      });
    } catch (error) {
      console.error("❌ Failed to create WebSocket connection:", error);
      this.emit("connect_error", error);
      return;
    }

    // Set up socket event listeners
    this.socket.on("connect", () => {
      this.emit("connect");
    });

    this.socket.on("disconnect", (reason: string) => {
      this.emit("disconnect", reason);
    });

    this.socket.on("connect_error", (error: Error) => {
      this.emit("connect_error", error);
    });

    this.socket.on("order", (data: WebSocketMessage) => {
      this.emit("order", data);
    });

    this.socket.on("notification", (data: WebSocketMessage) => {
      this.emit("notification", data);
    });

    this.socket.on("chat", (data: WebSocketMessage) => {
      this.emit("chat", data);
    });

    this.socket.on("broadcast", (data: WebSocketMessage) => {
      this.emit("broadcast", data);
    });

    this.socket.on("connected", (data: Record<string, unknown>) => {
      this.emit("connected", data);
    });

    this.socket.on("error", (data: Record<string, unknown>) => {
      this.emit("error", data);
    });

    this.socket.on("pong", (data: Record<string, unknown>) => {
      console.log("🏓 Pong received:", data);
    });
  }

  disconnect() {
    if (this.socket) {
      console.log("🔌 Disconnecting from WebSocket...");
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Send methods for admin actions
  sendPing() {
    if (this.socket && this.isConnected) {
      this.socket.emit("ping");
    }
  }

  joinRoom(roomName: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit("join_room", { room: roomName });
    }
  }

  leaveRoom(roomName: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit("leave_room", { room: roomName });
    }
  }

  sendAdminBroadcast(event: string, message: Record<string, unknown>) {
    if (this.socket && this.isConnected) {
      this.socket.emit("admin_broadcast", { event, message });
    }
  }

  sendToUser(userId: number, event: string, message: Record<string, unknown>) {
    if (this.socket && this.isConnected) {
      this.socket.emit("admin_send_to_user", { userId, event, message });
    }
  }

  // Event listener management
  addEventListener(event: string, callback: (...args: unknown[]) => void) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  removeEventListener(event: string, callback: (...args: unknown[]) => void) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: unknown) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((callback) => callback(data));
    }
  }

  // Getters
  get connected(): boolean {
    return this.isConnected;
  }

  get socketId(): string | undefined {
    return this.socket?.id;
  }

  get transport(): string | undefined {
    return this.socket?.io.engine.transport.name;
  }
}

// Export singleton instance
export const webSocketService = new WebSocketService();
export default webSocketService;

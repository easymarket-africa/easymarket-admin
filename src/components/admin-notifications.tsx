"use client";

import React, { useState } from "react";
import { useWebSocketContext } from "./websocket-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Send, Users, User, MessageSquare } from "lucide-react";
import { toast } from "sonner";

export const AdminNotifications: React.FC = () => {
  const { isConnected, sendAdminBroadcast, sendToUser } = useWebSocketContext();

  const [notificationType, setNotificationType] = useState<
    "broadcast" | "user"
  >("broadcast");
  const [userId, setUserId] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [eventType, setEventType] = useState("notification");

  const handleSendNotification = () => {
    if (!isConnected) {
      toast.error("WebSocket not connected");
      return;
    }

    if (!message.trim()) {
      toast.error("Message is required");
      return;
    }

    if (notificationType === "user" && !userId.trim()) {
      toast.error("User ID is required for user notifications");
      return;
    }

    const notificationData = {
      title: title || "Admin Notification",
      message: message,
      type: "admin",
      timestamp: new Date().toISOString(),
    };

    try {
      if (notificationType === "broadcast") {
        sendAdminBroadcast(eventType, notificationData);
        toast.success("Broadcast notification sent to all users");
      } else {
        sendToUser(parseInt(userId), eventType, notificationData);
        toast.success(`Notification sent to user ${userId}`);
      }

      // Clear form
      setTitle("");
      setMessage("");
      setUserId("");
    } catch (error) {
      toast.error("Failed to send notification");
      console.error("Error sending notification:", error);
    }
  };

  const handleSendOrderUpdate = () => {
    if (!isConnected) {
      toast.error("WebSocket not connected");
      return;
    }

    if (!userId.trim()) {
      toast.error("User ID is required for order updates");
      return;
    }

    const orderData = {
      orderId: Math.floor(Math.random() * 1000),
      orderNumber: `EM${Date.now().toString().slice(-6)}`,
      userId: parseInt(userId),
      status: "confirmed",
      message: "Your order has been confirmed and is being prepared",
      timestamp: new Date(),
      metadata: {
        estimatedDeliveryTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      },
    };

    try {
      sendToUser(parseInt(userId), "order", orderData);
      toast.success(`Order update sent to user ${userId}`);
    } catch (error) {
      toast.error("Failed to send order update");
      console.error("Error sending order update:", error);
    }
  };

  const handleSendChatMessage = () => {
    if (!isConnected) {
      toast.error("WebSocket not connected");
      return;
    }

    if (!userId.trim()) {
      toast.error("User ID is required for chat messages");
      return;
    }

    if (!message.trim()) {
      toast.error("Message is required");
      return;
    }

    const chatData = {
      message: message,
      senderId: 0, // Admin ID
      senderName: "Admin",
      chatId: `admin_${userId}`,
      timestamp: new Date().toISOString(),
    };

    try {
      sendToUser(parseInt(userId), "chat", chatData);
      toast.success(`Chat message sent to user ${userId}`);
      setMessage("");
    } catch (error) {
      toast.error("Failed to send chat message");
      console.error("Error sending chat message:", error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Admin Notifications
          </CardTitle>
          <CardDescription>
            Send real-time notifications to users via WebSocket
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant={isConnected ? "default" : "secondary"}>
              {isConnected ? "Connected" : "Disconnected"}
            </Badge>
            <span className="text-sm text-gray-600">
              {isConnected
                ? "Ready to send notifications"
                : "WebSocket not connected"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="notification-type">Notification Type</Label>
              <Select
                value={notificationType}
                onValueChange={(value: "broadcast" | "user") =>
                  setNotificationType(value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="broadcast">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Broadcast to All Users
                    </div>
                  </SelectItem>
                  <SelectItem value="user">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Send to Specific User
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {notificationType === "user" && (
              <div className="space-y-2">
                <Label htmlFor="user-id">User ID</Label>
                <Input
                  id="user-id"
                  type="number"
                  placeholder="Enter user ID"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="event-type">Event Type</Label>
              <Select value={eventType} onValueChange={setEventType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="notification">Notification</SelectItem>
                  <SelectItem value="order">Order Update</SelectItem>
                  <SelectItem value="chat">Chat Message</SelectItem>
                  <SelectItem value="broadcast">Broadcast</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title (Optional)</Label>
              <Input
                id="title"
                placeholder="Notification title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Enter your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSendNotification}
              disabled={!isConnected}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              Send Notification
            </Button>

            {notificationType === "user" && (
              <>
                <Button
                  onClick={handleSendOrderUpdate}
                  disabled={!isConnected || !userId.trim()}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  Send Order Update
                </Button>

                <Button
                  onClick={handleSendChatMessage}
                  disabled={!isConnected || !userId.trim() || !message.trim()}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  Send Chat Message
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

"use client";

import React from "react";
import { useWebSocketContext } from "./websocket-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wifi, WifiOff, AlertCircle, Loader2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const WebSocketStatus: React.FC = () => {
  const { isConnected, connectionStatus, socketId, transport, sendPing } =
    useWebSocketContext();

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case "connected":
        return <Wifi className="h-4 w-4 text-green-500" />;
      case "connecting":
        return <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <WifiOff className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case "connected":
        return "Connected";
      case "connecting":
        return "Connecting...";
      case "error":
        return "Connection Error";
      default:
        return "Disconnected";
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case "connected":
        return "bg-green-100 text-green-800 border-green-200";
      case "connecting":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "error":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={`${getStatusColor()} flex items-center gap-1`}
            >
              {getStatusIcon()}
              <span className="text-xs font-medium">{getStatusText()}</span>
            </Badge>
            {isConnected && (
              <Button
                variant="ghost"
                size="sm"
                onClick={sendPing}
                className="h-6 px-2 text-xs"
              >
                Ping
              </Button>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <div className="font-medium">WebSocket Status</div>
            <div className="text-sm text-gray-600">
              Status: {getStatusText()}
            </div>
            {socketId && (
              <div className="text-sm text-gray-600">
                Socket ID: {socketId.substring(0, 8)}...
              </div>
            )}
            {transport && (
              <div className="text-sm text-gray-600">
                Transport: {transport}
              </div>
            )}
            <div className="text-sm text-gray-600">
              Server:{" "}
              {process.env.NEXT_PUBLIC_WEBSOCKET_URL || "localhost:3001"}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MessageCircle, Copy, ExternalLink } from "lucide-react";

// Import types from API
import { Order } from "@/types/api";

interface WhatsAppShareModalProps {
  order: Order;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Mock agent groups
const agentGroups = [
  { id: "group-1", name: "Lagos Delivery Team", phone: "+234 801 111 1111" },
  { id: "group-2", name: "Abuja Delivery Team", phone: "+234 802 222 2222" },
  { id: "group-3", name: "Port Harcourt Team", phone: "+234 803 333 3333" },
  { id: "group-4", name: "Emergency Response", phone: "+234 804 444 4444" },
];

export function WhatsAppShareModal({
  order,
  open,
  onOpenChange,
}: WhatsAppShareModalProps) {
  const [selectedGroup, setSelectedGroup] = useState("");
  const [customMessage, setCustomMessage] = useState("");

  if (!order) return null;

  // Generate default message
  const defaultMessage = `🚚 NEW ORDER ALERT 🚚

Order ID: ${order.orderNumber}
Customer: ${order.customer.name}
Phone: ${order.customer.phoneNumber || "Not provided"}
Email: ${order.customer.email}

📦 Items:
${order.items
  .map(
    (item) =>
      `• ${item.productName} (${item.quantity}x) - ₦${parseFloat(
        item.unitPrice
      ).toLocaleString()}`
  )
  .join("\n")}

💰 Subtotal: ₦${parseFloat(order.subtotal).toLocaleString()}
🚚 Delivery Fee: ₦${parseFloat(order.deliveryFee).toLocaleString()}
💰 Total: ₦${parseFloat(order.total).toLocaleString()}
📍 Address: ${order.deliveryAddress.street}, ${order.deliveryAddress.city}, ${
    order.deliveryAddress.state
  }, ${order.deliveryAddress.country}

Status: ${order.status.replace("_", " ").toUpperCase()}
Payment: ${order.paymentStatus.toUpperCase()}
${
  order.assignedAgent
    ? `👤 Assigned Agent: ${order.assignedAgent.name} (${order.assignedAgent.phoneNumber})`
    : "👤 Agent: Not assigned yet"
}

⏰ Order Time: ${new Date(order.createdAt).toLocaleString()}
${order.notes ? `📝 Notes: ${order.notes}` : ""}

Please confirm receipt and update status accordingly.`;

  const finalMessage = customMessage || defaultMessage;

  const handleShareToWhatsApp = () => {
    if (!selectedGroup) return;

    let phoneNumber = "";
    // let _recipientName = ""; // Unused

    // Check if it's an agent (starts with "agent-")
    if (selectedGroup.startsWith("agent-")) {
      const agent = order.assignedAgent;
      if (agent) {
        phoneNumber = agent.phoneNumber.replace(/\s+/g, "");
        // _recipientName = agent.name; // Unused
      }
    } else {
      // It's a group
      const group = agentGroups.find((g) => g.id === selectedGroup);
      if (group) {
        phoneNumber = group.phone.replace(/\s+/g, "");
        // _recipientName = group.name; // Unused
      }
    }

    if (!phoneNumber) return;

    const encodedMessage = encodeURIComponent(finalMessage);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    window.open(whatsappUrl, "_blank");
  };

  const copyMessage = () => {
    navigator.clipboard.writeText(finalMessage);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-green-600" />
            Share Order via WhatsApp
          </DialogTitle>
          <DialogDescription>
            Send order {order.orderNumber} details to assigned agent or delivery
            groups
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Agent Selection */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recipient-select">Choose Recipient</Label>
              <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose recipient" />
                </SelectTrigger>
                <SelectContent>
                  {/* Assigned Agent Option */}
                  {order.assignedAgent && (
                    <SelectItem value={`agent-${order.assignedAgent.id}`}>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          📱 {order.assignedAgent.name} (Assigned Agent)
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {order.assignedAgent.phoneNumber}
                        </span>
                      </div>
                    </SelectItem>
                  )}

                  {/* Group Options */}
                  {agentGroups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      <div className="flex flex-col">
                        <span>👥 {group.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {group.phone}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Agent Info Display */}
            {order.assignedAgent &&
              selectedGroup === `agent-${order.assignedAgent.id}` && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      📱 Direct Message to Assigned Agent
                    </span>
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    <p>
                      <strong>Name:</strong> {order.assignedAgent.name}
                    </p>
                    <p>
                      <strong>Phone:</strong> {order.assignedAgent.phoneNumber}
                    </p>
                    <p>
                      <strong>Email:</strong> {order.assignedAgent.email}
                    </p>
                  </div>
                </div>
              )}
          </div>

          {/* Message Preview/Edit */}
          <div className="space-y-2">
            <Label htmlFor="message">Message (Edit if needed)</Label>
            <Textarea
              id="message"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder={defaultMessage}
              className="min-h-[300px] font-mono text-sm"
            />
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Leave empty to use default message</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCustomMessage(defaultMessage)}
              >
                Use Default
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Button
              onClick={handleShareToWhatsApp}
              disabled={!selectedGroup}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Open in WhatsApp
            </Button>
            <Button variant="outline" onClick={copyMessage}>
              <Copy className="mr-2 h-4 w-4" />
              Copy Message
            </Button>
          </div>

          {/* Instructions */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">How it works:</h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>
                Choose to send to the assigned agent directly or to a delivery
                group
              </li>
              <li>Review and customize the message if needed</li>
              <li>Click &quot;Open in WhatsApp&quot; to send the message</li>
              <li>The message will open in WhatsApp Web/App ready to send</li>
            </ol>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

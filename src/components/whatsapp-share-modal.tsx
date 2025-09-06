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

interface WhatsAppShareModalProps {
  order: any;
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

Order ID: ${order.id}
Customer: ${order.customer.name}
Phone: ${order.customer.phone}

📦 Items:
${order.items
  .map(
    (item: any) =>
      `• ${item.name} (${item.quantity}x) - ₦${item.price.toLocaleString()}`
  )
  .join("\n")}

💰 Total: ₦${order.total.toLocaleString()}
📍 Address: ${order.address}

Status: ${order.status.replace("_", " ").toUpperCase()}
${
  order.agent
    ? `👤 Assigned Agent: ${order.agent.name}`
    : "👤 Agent: Not assigned yet"
}

⏰ Order Time: ${new Date(order.createdAt).toLocaleString()}

Please confirm receipt and update status accordingly.`;

  const finalMessage = customMessage || defaultMessage;

  const handleShareToWhatsApp = () => {
    if (!selectedGroup) return;

    const group = agentGroups.find((g) => g.id === selectedGroup);
    if (!group) return;

    const encodedMessage = encodeURIComponent(finalMessage);
    const whatsappUrl = `https://wa.me/${group.phone.replace(
      /\s+/g,
      ""
    )}?text=${encodedMessage}`;

    window.open(whatsappUrl, "_blank");
  };

  const copyMessage = () => {
    navigator.clipboard.writeText(finalMessage);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-green-600" />
            Share Order to WhatsApp Group
          </DialogTitle>
          <DialogDescription>
            Share order {order.id} details with your delivery agent groups
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Group Selection */}
          <div className="space-y-2">
            <Label htmlFor="group-select">Select Agent Group</Label>
            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a WhatsApp group" />
              </SelectTrigger>
              <SelectContent>
                {agentGroups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    <div className="flex flex-col">
                      <span>{group.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {group.phone}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              <li>Select the appropriate agent group for this order</li>
              <li>Review and customize the message if needed</li>
              <li>Click "Open in WhatsApp" to share with the group</li>
              <li>The message will open in WhatsApp Web/App ready to send</li>
            </ol>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

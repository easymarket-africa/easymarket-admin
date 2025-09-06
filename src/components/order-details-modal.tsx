"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Phone, Copy, MapPin } from "lucide-react";

interface OrderDetailsModalProps {
  order: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderDetailsModal({
  order,
  open,
  onOpenChange,
}: OrderDetailsModalProps) {
  if (!order) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "preparing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "on_the_way":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Order Details - {order.id}</DialogTitle>
          <DialogDescription>
            Complete information about this order
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Status */}
          <div className="flex items-center justify-between">
            <Badge className={getStatusColor(order.status)}>
              {order.status.replace("_", " ")}
            </Badge>
            <div className="text-sm text-muted-foreground">
              {new Date(order.createdAt).toLocaleDateString()} at{" "}
              {new Date(order.createdAt).toLocaleTimeString()}
            </div>
          </div>

          {/* Customer Information */}
          <div className="space-y-3">
            <h3 className="font-semibold">Customer Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Name</p>
                <p className="text-sm text-muted-foreground">
                  {order.customer.name}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">
                  {order.customer.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div>
                <p className="text-sm font-medium">Phone</p>
                <p className="text-sm text-muted-foreground">
                  {order.customer.phone}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(order.customer.phone)}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`tel:${order.customer.phone}`)}
              >
                <Phone className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Separator />

          {/* Delivery Address */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Delivery Address
            </h3>
            <p className="text-sm text-muted-foreground">{order.address}</p>
          </div>

          <Separator />

          {/* Order Items */}
          <div className="space-y-3">
            <h3 className="font-semibold">Order Items</h3>
            <div className="space-y-2">
              {order.items.map((item: any, index: number) => (
                <div
                  key={index}
                  className="flex justify-between items-center py-2 border-b border-border last:border-0"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                  <p className="font-medium">₦{item.price.toLocaleString()}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-border">
              <p className="font-semibold">Total</p>
              <p className="font-semibold text-lg">
                ₦{order.total.toLocaleString()}
              </p>
            </div>
          </div>

          <Separator />

          {/* Agent Information */}
          <div className="space-y-3">
            <h3 className="font-semibold">Assigned Agent</h3>
            {order.agent ? (
              <div>
                <p className="font-medium">{order.agent.name}</p>
                <p className="text-sm text-muted-foreground">
                  Agent ID: {order.agent.id}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No agent assigned yet
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

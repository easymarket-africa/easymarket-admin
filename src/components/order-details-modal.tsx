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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Phone,
  Copy,
  MapPin,
  Settings,
  X,
  CheckCircle,
  MessageCircle,
} from "lucide-react";
import { useState } from "react";
import {
  useUpdateOrderStatus,
  useCancelOrder,
  useUpdatePaymentStatus,
} from "@/hooks/use-orders";

// Import types from API
import { Order } from "@/types/api";

interface OrderDetailsModalProps {
  order: Order;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderDetailsModal({
  order,
  open,
  onOpenChange,
}: OrderDetailsModalProps) {
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const updateStatusMutation = useUpdateOrderStatus();
  const cancelOrderMutation = useCancelOrder();
  const updatePaymentStatusMutation = useUpdatePaymentStatus();

  if (!order) return null;

  const getStatusColor = (status: Order["status"]) => {
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

  const handleStatusUpdate = (newStatus: string) => {
    updateStatusMutation.mutate({
      id: order.id,
      data: { status: newStatus },
    });
  };

  const handlePaymentStatusUpdate = (newPaymentStatus: string) => {
    updatePaymentStatusMutation.mutate({
      id: order.id,
      data: { paymentStatus: newPaymentStatus },
    });
  };

  const handleCancelOrder = () => {
    if (!cancelReason.trim()) return;

    cancelOrderMutation.mutate(
      {
        id: order.id,
        data: { reason: cancelReason },
      },
      {
        onSuccess: () => {
          setShowCancelForm(false);
          setCancelReason("");
        },
      }
    );
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "paid":
      case "successful":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "refunded":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Order Details - {order.orderNumber}</DialogTitle>
          <DialogDescription>
            Complete information about this order
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(order.status)}>
                {order.status.replace("_", " ")}
              </Badge>
              <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                Payment: {order.paymentStatus}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              {new Date(order.createdAt).toLocaleDateString()} at{" "}
              {new Date(order.createdAt).toLocaleTimeString()}
            </div>
          </div>

          {/* Order Management */}
          <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
            <h3 className="font-semibold flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Order Management
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Status Management */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Order Status</label>
                <Select
                  value={order.status}
                  onValueChange={handleStatusUpdate}
                  disabled={updateStatusMutation.isPending}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="preparing">Preparing</SelectItem>
                    <SelectItem value="ready_for_delivery">
                      Ready for Delivery
                    </SelectItem>
                    <SelectItem value="on_the_way">On the Way</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Payment Status Management */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Payment Status</label>
                <Select
                  value={order.paymentStatus}
                  onValueChange={handlePaymentStatusUpdate}
                  disabled={updatePaymentStatusMutation.isPending}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="successful">Successful</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Cancel Order Section */}
            {order.status !== "cancelled" && (
              <div className="space-y-2">
                {!showCancelForm ? (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowCancelForm(true)}
                    disabled={cancelOrderMutation.isPending}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel Order
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Cancellation Reason
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        placeholder="Enter reason for cancellation..."
                        className="flex-1 px-3 py-2 border border-input bg-background rounded-md text-sm"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleCancelOrder}
                        disabled={
                          !cancelReason.trim() || cancelOrderMutation.isPending
                        }
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Confirm Cancel
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowCancelForm(false);
                          setCancelReason("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
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
                  {order.customer.phoneNumber || "Not provided"}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  copyToClipboard(order.customer.phoneNumber || "")
                }
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  window.open(`tel:${order.customer.phoneNumber || ""}`)
                }
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
            <p className="text-sm text-muted-foreground">
              {order.deliveryAddress.street}, {order.deliveryAddress.city},{" "}
              {order.deliveryAddress.state}, {order.deliveryAddress.country}
            </p>
          </div>

          <Separator />

          {/* Order Items */}
          <div className="space-y-3">
            <h3 className="font-semibold">Order Items</h3>
            <div className="space-y-2">
              {order.items.map((item, index: number) => (
                <div
                  key={index}
                  className="flex justify-between items-center py-2 border-b border-border last:border-0"
                >
                  <div>
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-sm text-muted-foreground">
                      Quantity: {item.quantity} × ₦
                      {parseFloat(item.unitPrice).toLocaleString()}
                    </p>
                  </div>
                  <p className="font-medium">
                    ₦{parseFloat(item.totalPrice).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-border">
              <p className="font-semibold">Total</p>
              <p className="font-semibold text-lg">
                ₦{parseFloat(order.total).toLocaleString()}
              </p>
            </div>
          </div>

          <Separator />

          {/* Agent Information */}
          <div className="space-y-3">
            <h3 className="font-semibold">Assigned Agent</h3>
            {order.assignedAgent ? (
              <div className="space-y-3">
                <div>
                  <p className="font-medium">{order.assignedAgent.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Agent ID: {order.assignedAgent.id}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Phone: {order.assignedAgent.phoneNumber}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Email: {order.assignedAgent.email}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const message = `🚚 ORDER UPDATE 🚚

Order: ${order.orderNumber}
Customer: ${order.customer.name}
Status: ${order.status.replace("_", " ").toUpperCase()}

Please check the admin panel for full details.`;
                      const encodedMessage = encodeURIComponent(message);
                      const whatsappUrl = `https://wa.me/${order.assignedAgent?.phoneNumber.replace(
                        /\s+/g,
                        ""
                      )}?text=${encodedMessage}`;
                      window.open(whatsappUrl, "_blank");
                    }}
                    className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Send WhatsApp
                  </Button>
                </div>
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

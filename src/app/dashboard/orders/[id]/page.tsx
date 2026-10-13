"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Copy,
  Phone,
  MapPin,
  CreditCard,
  Truck,
  History as HistoryIcon,
  X,
  CheckCircle,
  MessageCircle,
  Receipt,
} from "lucide-react";
import {
  useOrder,
  useOrderHistory,
  useUpdateOrderStatus,
  useCancelOrder,
} from "@/hooks/use-orders";
import { useVendors } from "@/hooks/use-vendors";
import { ConfirmOrderVendorDialog } from "@/components/confirm-order-vendor-dialog";
import { PageSkeleton } from "@/components/loading-states";
import { ErrorDisplay } from "@/components/error-display";
import { Order } from "@/types/api";

const getStatusColor = (status: Order["status"]) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700";
    case "confirmed":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border-blue-200 dark:border-blue-700";
    case "preparing":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300 border-orange-200 dark:border-orange-700";
    case "ready_for_delivery":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 border-purple-200 dark:border-purple-700";
    case "out_for_delivery":
      return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700";
    case "delivered":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-200 dark:border-green-700";
    case "cancelled":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 border-red-200 dark:border-red-700";
    case "refunded":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300 border-amber-200 dark:border-amber-700";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300 border-gray-200 dark:border-gray-700";
  }
};

const getPaymentStatusColor = (status: Order["paymentStatus"]) => {
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

function money(value?: string | number) {
  const n = typeof value === "string" ? parseFloat(value) : value;
  if (n === undefined || Number.isNaN(n)) return "—";
  return `₦${n.toLocaleString()}`;
}

function formatDateTime(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  return `${d.toLocaleDateString()} at ${d.toLocaleTimeString()}`;
}

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const orderId = Number(params.id);

  const [showCancelForm, setShowCancelForm] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedVendorId, setSelectedVendorId] = useState<number | null>(null);

  const { data: order, isLoading, error, refetch } = useOrder(orderId);
  const { data: history, isLoading: historyLoading } = useOrderHistory(orderId);
  const { data: vendorsData } = useVendors({ limit: 100, status: "active" });
  const vendors = vendorsData?.vendors || [];

  const updateStatusMutation = useUpdateOrderStatus();
  const cancelOrderMutation = useCancelOrder();

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (error || !order) {
    return (
      <ErrorDisplay
        error={error}
        onRetry={() => refetch()}
        title="Failed to load order"
        description="There was an error loading this order's details. Please try again."
      />
    );
  }

  const handleStatusUpdate = (newStatus: string) => {
    if (newStatus === "confirmed" && !order.pickupVendor) {
      setSelectedVendorId(null);
      setConfirmDialogOpen(true);
      return;
    }
    updateStatusMutation.mutate({ id: order.id, data: { status: newStatus } });
  };

  const handleConfirmOrder = () => {
    if (!selectedVendorId) return;
    updateStatusMutation.mutate(
      { id: order.id, data: { status: "confirmed", vendorId: selectedVendorId } },
      {
        onSuccess: () => {
          setConfirmDialogOpen(false);
          setSelectedVendorId(null);
        },
      }
    );
  };

  const handleCancelOrder = () => {
    if (!cancelReason.trim()) return;
    cancelOrderMutation.mutate(
      { id: order.id, data: { reason: cancelReason } },
      {
        onSuccess: () => {
          setShowCancelForm(false);
          setCancelReason("");
        },
      }
    );
  };

  const copyToClipboard = (text: string) => navigator.clipboard.writeText(text);

  const hasRefund = !!order.refund;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/orders">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">
              Order {order.orderNumber}
            </h1>
            <Badge className={getStatusColor(order.status)}>
              {order.status.replace(/_/g, " ")}
            </Badge>
            <Badge className={getPaymentStatusColor(order.paymentStatus)}>
              Payment: {order.paymentStatus}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Placed {formatDateTime(order.createdAt)}
          </p>
        </div>
      </div>

      {/* Order Management */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <SelectItem value="out_for_delivery">
                    Out for Delivery
                  </SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

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
                    disabled={!cancelReason.trim() || cancelOrderMutation.isPending}
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
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="payment">Payment & Refunds</TabsTrigger>
          <TabsTrigger value="delivery">Delivery & Logistics</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Customer</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
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
              <div className="col-span-2 flex items-center gap-2">
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-sm text-muted-foreground">
                    {order.customer.phoneNumber || "Not provided"}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(order.customer.phoneNumber || "")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`tel:${order.customer.phoneNumber || ""}`)}
                >
                  <Phone className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Items & Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center py-2 border-b border-border last:border-0"
                  >
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {item.quantity} × {money(item.unitPrice)}
                      </p>
                    </div>
                    <p className="font-medium">{money(item.totalPrice)}</p>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{money(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span>{money(order.deliveryFee)}</span>
                </div>
                {parseFloat(order.serviceFee || "0") > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Service Fee</span>
                    <span>{money(order.serviceFee)}</span>
                  </div>
                )}
                {parseFloat(order.discount || "0") > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Discount</span>
                    <span>-{money(order.discount)}</span>
                  </div>
                )}
                {parseFloat(order.promoDiscount || "0") > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Promo discount{order.promoCode ? ` (${order.promoCode})` : ""}
                    </span>
                    <span>-{money(order.promoDiscount)}</span>
                  </div>
                )}
                {parseFloat(order.referralDiscount || "0") > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Referral discount
                      {order.referralCode ? ` (${order.referralCode})` : ""}
                    </span>
                    <span>-{money(order.referralDiscount)}</span>
                  </div>
                )}
                <Separator className="my-1" />
                <div className="flex justify-between font-semibold text-base">
                  <span>Total</span>
                  <span>{money(order.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {(order.notes || order.cancellationReason) && (
            <Card>
              <CardContent className="pt-6 space-y-2">
                {order.notes && (
                  <div>
                    <p className="text-sm font-medium">Notes</p>
                    <p className="text-sm text-muted-foreground">{order.notes}</p>
                  </div>
                )}
                {order.cancellationReason && (
                  <div>
                    <p className="text-sm font-medium">Cancellation Reason</p>
                    <p className="text-sm text-muted-foreground">
                      {order.cancellationReason}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Payment & Refunds */}
        <TabsContent value="payment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Payment
              </CardTitle>
            </CardHeader>
            <CardContent>
              {order.payment ? (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Reference</p>
                    <p className="text-muted-foreground">
                      {order.payment.reference || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Provider</p>
                    <p className="text-muted-foreground">
                      {order.payment.provider || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Channel</p>
                    <p className="text-muted-foreground">
                      {order.payment.channel || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Paid At</p>
                    <p className="text-muted-foreground">
                      {order.payment.paidAt ? formatDateTime(order.payment.paidAt) : "—"}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="font-medium">Gateway Response</p>
                    <p className="text-muted-foreground">
                      {order.payment.gatewayResponse || "—"}
                    </p>
                  </div>
                  {order.payment.failureReason && (
                    <div className="col-span-2">
                      <p className="font-medium">Failure Reason</p>
                      <p className="text-muted-foreground">
                        {order.payment.failureReason}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No payment transaction recorded for this order yet.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                Refunds
              </CardTitle>
            </CardHeader>
            <CardContent>
              {hasRefund ? (
                <div className="space-y-4">
                  {order.refund?.paystackRefundAmount && (
                    <div className="space-y-1 text-sm">
                      <p className="font-medium">Paystack Refund (customer-facing)</p>
                      <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                        <span>Amount: {money(order.refund.paystackRefundAmount)}</span>
                        <span>
                          Refunded At:{" "}
                          {order.refund.paystackRefundedAt
                            ? formatDateTime(order.refund.paystackRefundedAt)
                            : "—"}
                        </span>
                        <span>Reference: {order.refund.paystackRefundReference || "—"}</span>
                        <span>Reason: {order.refund.paystackRefundReason || "—"}</span>
                      </div>
                    </div>
                  )}
                  {order.refund?.logisticsRefundAmount && (
                    <div className="space-y-1 text-sm">
                      <p className="font-medium">
                        Waysdrop Logistics Refund (internal wallet)
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                        <span>Amount: {money(order.refund.logisticsRefundAmount)}</span>
                        <span>
                          Refunded At:{" "}
                          {order.refund.logisticsRefundedAt
                            ? formatDateTime(order.refund.logisticsRefundedAt)
                            : "—"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No refund has been issued for this order.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Delivery & Logistics */}
        <TabsContent value="delivery" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Delivery Address
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <p>{order.deliveryAddress.fullName}</p>
              <p className="text-muted-foreground">{order.deliveryAddress.phoneNumber}</p>
              <p className="text-muted-foreground">{order.deliveryAddress.address}</p>
              {order.deliveryAddress.landmark && (
                <p className="text-muted-foreground">
                  Landmark: {order.deliveryAddress.landmark}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pickup Vendor</CardTitle>
            </CardHeader>
            <CardContent>
              {order.pickupVendor ? (
                <div className="text-sm space-y-1">
                  <p className="font-medium">{order.pickupVendor.businessName}</p>
                  <p className="text-muted-foreground">{order.pickupVendor.address}</p>
                  <p className="text-muted-foreground">
                    Phone: {order.pickupVendor.phoneNumber}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No pickup vendor selected yet
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Logistics Status
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="font-medium">Provider</p>
                  <p className="text-muted-foreground">
                    {order.deliveryProvider || "In-house"}
                  </p>
                </div>
                <div>
                  <p className="font-medium">External Delivery ID</p>
                  <p className="text-muted-foreground">
                    {order.externalDeliveryId || "—"}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Tracking ID</p>
                  <p className="text-muted-foreground">
                    {order.externalTrackingId || "—"}
                  </p>
                </div>
              </div>
              {order.courierInfo && (
                <div>
                  <p className="font-medium">Courier Info</p>
                  <pre className="text-xs text-muted-foreground bg-muted/50 p-2 rounded overflow-x-auto">
                    {JSON.stringify(order.courierInfo, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Assigned Agent</CardTitle>
            </CardHeader>
            <CardContent>
              {order.assignedAgent ? (
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium">{order.assignedAgent.name}</p>
                    <p className="text-muted-foreground">
                      Phone: {order.assignedAgent.phoneNumber}
                    </p>
                    <p className="text-muted-foreground">
                      Email: {order.assignedAgent.email}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const message = `🚚 ORDER UPDATE 🚚\n\nOrder: ${order.orderNumber}\nCustomer: ${order.customer.name}\nStatus: ${order.status.replace(/_/g, " ").toUpperCase()}\n\nPlease check the admin panel for full details.`;
                      const url = `https://wa.me/${order.assignedAgent?.phoneNumber.replace(/\s+/g, "")}?text=${encodeURIComponent(message)}`;
                      window.open(url, "_blank");
                    }}
                    className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Send WhatsApp
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No agent assigned yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* History */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <HistoryIcon className="h-4 w-4" />
                Status Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <p className="text-sm text-muted-foreground">Loading history...</p>
              ) : history && history.length > 0 ? (
                <div className="space-y-4">
                  {history.map((entry) => (
                    <div key={entry.id} className="flex gap-3 text-sm">
                      <div className="w-2 h-2 mt-1.5 rounded-full bg-primary shrink-0" />
                      <div>
                        <p className="font-medium">{entry.description}</p>
                        <p className="text-muted-foreground">
                          {formatDateTime(entry.performedAt)} · {entry.performedBy}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No status changes recorded yet.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {confirmDialogOpen && (
        <ConfirmOrderVendorDialog
          open={confirmDialogOpen}
          onOpenChange={setConfirmDialogOpen}
          orderNumber={order.orderNumber}
          vendors={vendors}
          selectedVendorId={selectedVendorId}
          onVendorChange={setSelectedVendorId}
          onConfirm={handleConfirmOrder}
          isPending={updateStatusMutation.isPending}
        />
      )}
    </div>
  );
}

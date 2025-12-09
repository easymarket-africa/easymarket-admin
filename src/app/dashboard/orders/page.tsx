"use client";

// Force dynamic rendering
export const dynamic = "force-dynamic";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Filter,
  Eye,
  MessageCircle,
  CheckSquare,
  Square,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { OrderDetailsModal } from "@/components/order-details-modal";
import { WhatsAppShareModal } from "@/components/whatsapp-share-modal";
import {
  useOrders,
  useAssignAgent,
  useUpdateOrderStatus,
  useUpdatePaymentStatus,
} from "@/hooks/use-orders";
import { useAvailableAgents } from "@/hooks/use-agents";
import { TableSkeleton } from "@/components/loading-states";
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
    case "on_the_way":
      return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700";
    case "delivered":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-200 dark:border-green-700";
    case "cancelled":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 border-red-200 dark:border-red-700";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300 border-gray-200 dark:border-gray-700";
  }
};

const getPaymentStatusColor = (paymentStatus: Order["paymentStatus"]) => {
  switch (paymentStatus) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700";
    case "paid":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-200 dark:border-green-700";
    case "successful":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700";
    case "failed":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 border-red-200 dark:border-red-700";
    case "refunded":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300 border-amber-200 dark:border-amber-700";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300 border-gray-200 dark:border-gray-700";
  }
};

export default function OrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [whatsappOrder, setWhatsappOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrders, setSelectedOrders] = useState<Set<number>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);

  // API hooks
  const {
    data: ordersData,
    isLoading: ordersLoading,
    error: ordersError,
    refetch: refetchOrders,
  } = useOrders({
    search: searchTerm || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const { data: agentsData } = useAvailableAgents();
  const assignAgentMutation = useAssignAgent();
  const updateStatusMutation = useUpdateOrderStatus();
  const updatePaymentStatusMutation = useUpdatePaymentStatus();

  const orders = ordersData?.orders || [];
  const agents = Array.isArray(agentsData?.agents) ? agentsData.agents : [];

  const handleAssignAgent = async (orderId: number, agentId: number) => {
    try {
      await assignAgentMutation.mutateAsync({
        id: orderId,
        data: { agentId: agentId },
      });
    } catch {
      // Error is handled by the mutation hook
    }
  };

  const handleSelectOrder = (orderId: number) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };

  const handleSelectAll = () => {
    if (selectedOrders.size === orders.length) {
      setSelectedOrders(new Set());
      setShowBulkActions(false);
    } else {
      setSelectedOrders(new Set(orders.map((order: Order) => order.id)));
      setShowBulkActions(true);
    }
  };

  const handleBulkStatusUpdate = (status: string) => {
    selectedOrders.forEach((orderId) => {
      updateStatusMutation.mutate({
        id: orderId,
        data: { status },
      });
    });
    setSelectedOrders(new Set());
    setShowBulkActions(false);
  };

  const handleBulkPaymentStatusUpdate = (paymentStatus: string) => {
    selectedOrders.forEach((orderId) => {
      updatePaymentStatusMutation.mutate({
        id: orderId,
        data: { paymentStatus },
      });
    });
    setSelectedOrders(new Set());
    setShowBulkActions(false);
  };

  if (ordersError) {
    return (
      <ErrorDisplay
        error={ordersError}
        onRetry={() => refetchOrders()}
        title="Failed to load orders"
        description="There was an error loading the orders data. Please try again."
      />
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">
            Manage and track all customer orders
          </p>
        </div>
      </div>

      {/* Bulk Actions */}
      {showBulkActions && (
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {selectedOrders.size} order
                  {selectedOrders.size > 1 ? "s" : ""} selected
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Select onValueChange={handleBulkStatusUpdate}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Update Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="confirmed">Confirm</SelectItem>
                    <SelectItem value="preparing">Preparing</SelectItem>
                    <SelectItem value="ready_for_delivery">
                      Ready for Delivery
                    </SelectItem>
                    <SelectItem value="on_the_way">On the Way</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                  </SelectContent>
                </Select>
                <Select onValueChange={handleBulkPaymentStatusUpdate}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Update Payment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Mark as Paid</SelectItem>
                    <SelectItem value="successful">
                      Mark as Successful
                    </SelectItem>
                    <SelectItem value="failed">Mark as Failed</SelectItem>
                    <SelectItem value="refunded">Mark as Refunded</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedOrders(new Set());
                    setShowBulkActions(false);
                  }}
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
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
        </CardHeader>
        <CardContent>
          {ordersLoading ? (
            <TableSkeleton />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSelectAll}
                      className="h-8 w-8 p-0"
                    >
                      {selectedOrders.size === orders.length ? (
                        <CheckSquare className="h-4 w-4" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order: Order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSelectOrder(order.id)}
                        className="h-8 w-8 p-0"
                      >
                        {selectedOrders.has(order.id) ? (
                          <CheckSquare className="h-4 w-4" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className="font-medium">
                      {order.orderNumber}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.customer.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {order.customer.phoneNumber}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {order.items.length} item
                        {order.items.length > 1 ? "s" : ""}
                      </div>
                    </TableCell>
                    <TableCell>
                      ₦{parseFloat(order.total).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={order.status}
                        onValueChange={(value: string) =>
                          updateStatusMutation.mutate({
                            id: order.id,
                            data: { status: value },
                          })
                        }
                        disabled={updateStatusMutation.isPending}
                      >
                        <SelectTrigger
                          className={`w-[140px] ${getStatusColor(
                            order.status
                          )}`}
                        >
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
                    </TableCell>
                    <TableCell>
                      <Select
                        value={order.paymentStatus}
                        onValueChange={(value: string) =>
                          updatePaymentStatusMutation.mutate({
                            id: order.id,
                            data: { paymentStatus: value },
                          })
                        }
                        disabled={updatePaymentStatusMutation.isPending}
                      >
                        <SelectTrigger
                          className={`w-[120px] ${getPaymentStatusColor(
                            order.paymentStatus
                          )}`}
                        >
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
                    </TableCell>
                    <TableCell>
                      {order.assignedAgent ? (
                        <div className="text-sm">
                          {order.assignedAgent.name}
                        </div>
                      ) : (
                        <Select
                          onValueChange={(value: string) =>
                            handleAssignAgent(order.id, parseInt(value))
                          }
                          disabled={assignAgentMutation.isPending}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Assign agent" />
                          </SelectTrigger>
                          <SelectContent>
                            {agents
                              .filter((agent) => agent.isAvailable)
                              .map((agent) => (
                                <SelectItem
                                  key={agent.id}
                                  value={agent.id.toString()}
                                >
                                  {agent.fullName}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedOrder(order)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>View order details</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setWhatsappOrder(order)}
                                className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                              >
                                <MessageCircle className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Send WhatsApp message to agent</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          open={!!selectedOrder}
          onOpenChange={() => setSelectedOrder(null)}
        />
      )}

      {whatsappOrder && (
        <WhatsAppShareModal
          order={whatsappOrder}
          open={!!whatsappOrder}
          onOpenChange={() => setWhatsappOrder(null)}
        />
      )}
    </div>
  );
}

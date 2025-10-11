"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Search, Filter, Eye, MessageCircle } from "lucide-react";
import { OrderDetailsModal } from "@/components/order-details-modal";
import { WhatsAppShareModal } from "@/components/whatsapp-share-modal";
import { useOrders, useAssignAgent } from "@/hooks/use-orders";
import { useAgents } from "@/hooks/use-agents";
import { TableSkeleton } from "@/components/loading-states";
import { ErrorDisplay, ErrorAlert } from "@/components/error-display";
import { Order } from "@/types/api";

const getStatusColor = (status: Order["status"]) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    case "confirmed":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    case "preparing":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
    case "ready_for_delivery":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
    case "on_the_way":
      return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300";
    case "delivered":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "cancelled":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  }
};

export default function OrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [whatsappOrder, setWhatsappOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

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

  const { data: agentsData } = useAgents({ status: "active" });
  const assignAgentMutation = useAssignAgent();

  const orders = (ordersData as any)?.orders || [];
  const agents = agentsData?.data || [];

  const handleAssignAgent = async (orderId: number, agentId: number) => {
    try {
      await assignAgentMutation.mutateAsync({
        id: orderId,
        data: { agentId },
      });
    } catch (error) {
      // Error is handled by the mutation hook
    }
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
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order: any) => (
                  <TableRow key={order.id}>
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
                      <Badge className={getStatusColor(order.status)}>
                        {order.status.replace("_", " ")}
                      </Badge>
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setWhatsappOrder(order)}
                          className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </Button>
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
          order={selectedOrder as any}
          open={!!selectedOrder}
          onOpenChange={() => setSelectedOrder(null)}
        />
      )}

      {whatsappOrder && (
        <WhatsAppShareModal
          order={whatsappOrder as any}
          open={!!whatsappOrder}
          onOpenChange={() => setWhatsappOrder(null)}
        />
      )}
    </div>
  );
}

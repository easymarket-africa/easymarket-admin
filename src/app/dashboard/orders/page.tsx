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

// Type definitions
interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Customer {
  name: string;
  phone: string;
  email: string;
}

interface Agent {
  id: string;
  name: string;
  status?: string;
}

interface Order {
  id: string;
  customer: Customer;
  items: OrderItem[];
  total: number;
  status: "pending" | "preparing" | "on_the_way" | "delivered";
  agent: Agent | null;
  address: string;
  createdAt: string;
}

// Mock data
const orders: Order[] = [
  {
    id: "ORD-001",
    customer: {
      name: "John Doe",
      phone: "+234 801 234 5678",
      email: "john@example.com",
    },
    items: [
      { name: "Fresh Tomatoes", quantity: 2, price: 500 },
      { name: "Onions", quantity: 1, price: 300 },
    ],
    total: 800,
    status: "pending",
    agent: null,
    address: "123 Lagos Street, Victoria Island, Lagos",
    createdAt: "2024-01-15T10:30:00Z",
  },
  {
    id: "ORD-002",
    customer: {
      name: "Jane Smith",
      phone: "+234 802 345 6789",
      email: "jane@example.com",
    },
    items: [
      { name: "Rice", quantity: 1, price: 1200 },
      { name: "Beans", quantity: 1, price: 800 },
    ],
    total: 2000,
    status: "preparing",
    agent: { id: "AGT-001", name: "Mike Johnson" },
    address: "456 Abuja Road, Garki, Abuja",
    createdAt: "2024-01-15T11:15:00Z",
  },
  {
    id: "ORD-003",
    customer: {
      name: "David Wilson",
      phone: "+234 803 456 7890",
      email: "david@example.com",
    },
    items: [{ name: "Chicken", quantity: 1, price: 2500 }],
    total: 2500,
    status: "on_the_way",
    agent: { id: "AGT-002", name: "Sarah Adams" },
    address: "789 Port Harcourt Street, GRA, Port Harcourt",
    createdAt: "2024-01-15T09:45:00Z",
  },
];

const agents: Agent[] = [
  { id: "AGT-001", name: "Mike Johnson", status: "available" },
  { id: "AGT-002", name: "Sarah Adams", status: "busy" },
  { id: "AGT-003", name: "Peter Brown", status: "available" },
];

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

export default function OrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [whatsappOrder, setWhatsappOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleAssignAgent = (orderId: string, agentId: string) => {
    // Handle agent assignment logic
    console.log(`Assigning agent ${agentId} to order ${orderId}`);
  };

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
                <SelectItem value="preparing">Preparing</SelectItem>
                <SelectItem value="on_the_way">On the Way</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
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
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.customer.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {order.customer.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {order.items.length} item
                      {order.items.length > 1 ? "s" : ""}
                    </div>
                  </TableCell>
                  <TableCell>₦{order.total.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {order.agent ? (
                      <div className="text-sm">{order.agent.name}</div>
                    ) : (
                      <Select
                        onValueChange={(value: string) =>
                          handleAssignAgent(order.id, value)
                        }
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Assign agent" />
                        </SelectTrigger>
                        <SelectContent>
                          {agents
                            .filter((agent) => agent.status === "available")
                            .map((agent) => (
                              <SelectItem key={agent.id} value={agent.id}>
                                {agent.name}
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

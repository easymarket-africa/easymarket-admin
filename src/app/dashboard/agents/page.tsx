"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Plus, Phone, Edit, Trash2 } from "lucide-react";

// Mock data
const agents = [
  {
    id: "AGT-001",
    name: "Mike Johnson",
    phone: "+234 801 234 5678",
    email: "mike@freshmarket.com",
    status: "available",
    activeOrders: 0,
    totalOrders: 45,
    rating: 4.8,
    joinedAt: "2024-01-01",
  },
  {
    id: "AGT-002",
    name: "Sarah Adams",
    phone: "+234 802 345 6789",
    email: "sarah@freshmarket.com",
    status: "busy",
    activeOrders: 2,
    totalOrders: 67,
    rating: 4.9,
    joinedAt: "2023-12-15",
  },
  {
    id: "AGT-003",
    name: "Peter Brown",
    phone: "+234 803 456 7890",
    email: "peter@freshmarket.com",
    status: "available",
    activeOrders: 1,
    totalOrders: 23,
    rating: 4.6,
    joinedAt: "2024-01-10",
  },
  {
    id: "AGT-004",
    name: "Lisa Wilson",
    phone: "+234 804 567 8901",
    email: "lisa@freshmarket.com",
    status: "offline",
    activeOrders: 0,
    totalOrders: 89,
    rating: 4.7,
    joinedAt: "2023-11-20",
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "available":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "busy":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    case "offline":
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  }
};

export default function AgentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredAgents = agents.filter(
    (agent) =>
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.phone.includes(searchTerm) ||
      agent.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agents</h1>
          <p className="text-muted-foreground">
            Manage delivery agents and their assignments
          </p>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Agent
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Agent</DialogTitle>
              <DialogDescription>
                Create a new delivery agent account
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="Enter agent's full name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" placeholder="+234 xxx xxx xxxx" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="agent@freshmarket.com"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={() => setIsAddModalOpen(false)}>
                  Add Agent
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agents.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {agents.filter((a) => a.status === "available").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Busy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {agents.filter((a) => a.status === "busy").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {agents.filter((a) => a.status === "offline").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search agents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Active Orders</TableHead>
                <TableHead>Total Orders</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAgents.map((agent) => (
                <TableRow key={agent.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{agent.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {agent.id}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm">{agent.phone}</div>
                      <div className="text-sm text-muted-foreground">
                        {agent.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(agent.status)}>
                      {agent.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{agent.activeOrders}</TableCell>
                  <TableCell>{agent.totalOrders}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <span className="text-sm font-medium">
                        {agent.rating}
                      </span>
                      <span className="text-yellow-400 ml-1">★</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`tel:${agent.phone}`)}
                      >
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive bg-transparent"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

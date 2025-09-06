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
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, Phone, Edit, Trash2, Store, MapPin } from "lucide-react";

// Mock data
const vendors = [
  {
    id: "VND-001",
    name: "Fresh Farms Market",
    category: "Grocery",
    phone: "+234 801 234 5678",
    email: "contact@freshfarms.com",
    address: "123 Market Street, Victoria Island, Lagos",
    status: "active",
    products: 45,
    totalOrders: 234,
    rating: 4.8,
    joinedAt: "2023-11-15",
  },
  {
    id: "VND-002",
    name: "Organic Delights",
    category: "Organic Foods",
    phone: "+234 802 345 6789",
    email: "info@organicdelights.com",
    address: "456 Green Avenue, Ikoyi, Lagos",
    status: "active",
    products: 32,
    totalOrders: 189,
    rating: 4.9,
    joinedAt: "2023-12-01",
  },
  {
    id: "VND-003",
    name: "Spice World",
    category: "Spices & Herbs",
    phone: "+234 803 456 7890",
    email: "orders@spiceworld.com",
    address: "789 Spice Lane, Surulere, Lagos",
    status: "pending",
    products: 28,
    totalOrders: 156,
    rating: 4.6,
    joinedAt: "2024-01-10",
  },
  {
    id: "VND-004",
    name: "Meat Masters",
    category: "Meat & Poultry",
    phone: "+234 804 567 8901",
    email: "sales@meatmasters.com",
    address: "321 Butcher Street, Ikeja, Lagos",
    status: "suspended",
    products: 18,
    totalOrders: 98,
    rating: 4.3,
    joinedAt: "2023-10-20",
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "pending":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    case "suspended":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  }
};

export default function VendorsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredVendors = vendors.filter(
    (vendor) =>
      vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.phone.includes(searchTerm) ||
      vendor.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vendors</h1>
          <p className="text-muted-foreground">
            Manage vendor partnerships and product suppliers
          </p>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Vendor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Vendor</DialogTitle>
              <DialogDescription>
                Register a new vendor partner
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="vendor-name">Business Name</Label>
                <Input id="vendor-name" placeholder="Enter business name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vendor-category">Category</Label>
                <Input
                  id="vendor-category"
                  placeholder="e.g., Grocery, Organic Foods"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vendor-phone">Phone Number</Label>
                <Input id="vendor-phone" placeholder="+234 xxx xxx xxxx" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vendor-email">Email Address</Label>
                <Input
                  id="vendor-email"
                  type="email"
                  placeholder="contact@vendor.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vendor-address">Address</Label>
                <Textarea
                  id="vendor-address"
                  placeholder="Enter full business address"
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
                  Add Vendor
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
            <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vendors.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {vendors.filter((v) => v.status === "active").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {vendors.filter((v) => v.status === "pending").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vendors.reduce((sum, v) => sum + v.products, 0)}
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
                placeholder="Search vendors..."
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
                <TableHead>Vendor</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVendors.map((vendor) => (
                <TableRow key={vendor.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{vendor.name}</div>
                      <div className="text-sm text-muted-foreground flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {vendor.address.split(",")[0]}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{vendor.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm">{vendor.phone}</div>
                      <div className="text-sm text-muted-foreground">
                        {vendor.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(vendor.status)}>
                      {vendor.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{vendor.products}</TableCell>
                  <TableCell>{vendor.totalOrders}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <span className="text-sm font-medium">
                        {vendor.rating}
                      </span>
                      <span className="text-yellow-400 ml-1">★</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`tel:${vendor.phone}`)}
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

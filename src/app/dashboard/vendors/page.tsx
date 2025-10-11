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
import {
  useVendors,
  useVendorMetrics,
  useCreateVendor,
  useUpdateVendor,
  useDeleteVendor,
} from "@/hooks/use-vendors";
import { TableSkeleton, StatsCardSkeleton } from "@/components/loading-states";
import { ErrorDisplay, ErrorAlert } from "@/components/error-display";
import { CreateVendorRequest, UpdateVendorRequest } from "@/types/api";

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
  const [editingVendor, setEditingVendor] = useState<any>(null);

  // API hooks
  const {
    data: vendorsData,
    isLoading: vendorsLoading,
    error: vendorsError,
    refetch: refetchVendors,
  } = useVendors({
    search: searchTerm || undefined,
  });

  const {
    data: metricsData,
    isLoading: metricsLoading,
    error: metricsError,
  } = useVendorMetrics();

  const createVendorMutation = useCreateVendor();
  const updateVendorMutation = useUpdateVendor();
  const deleteVendorMutation = useDeleteVendor();

  const vendors = vendorsData?.data || [];
  const metrics = metricsData || {
    totalVendors: 0,
    activeVendors: 0,
    pendingVendors: 0,
    totalProducts: 0,
  };

  const handleCreateVendor = async (formData: CreateVendorRequest) => {
    try {
      await createVendorMutation.mutateAsync(formData);
      setIsAddModalOpen(false);
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  const handleUpdateVendor = async (
    id: number,
    formData: UpdateVendorRequest
  ) => {
    try {
      await updateVendorMutation.mutateAsync({ id, data: formData });
      setEditingVendor(null);
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  const handleDeleteVendor = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this vendor?")) {
      try {
        await deleteVendorMutation.mutateAsync(id);
      } catch (error) {
        // Error is handled by the mutation hook
      }
    }
  };

  if (vendorsError) {
    return (
      <ErrorDisplay
        error={vendorsError}
        onRetry={() => refetchVendors()}
        title="Failed to load vendors"
        description="There was an error loading the vendors data. Please try again."
      />
    );
  }

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
            <VendorForm
              onSubmit={handleCreateVendor}
              isLoading={createVendorMutation.isPending}
              onCancel={() => setIsAddModalOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {metricsLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatsCardSkeleton key={i} />)
        ) : metricsError ? (
          <div className="col-span-4">
            <ErrorAlert error={metricsError} />
          </div>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Vendors
                </CardTitle>
                <Store className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalVendors}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {metrics.activeVendors}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {metrics.pendingVendors}
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
                  {metrics.totalProducts}
                </div>
              </CardContent>
            </Card>
          </>
        )}
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
          {vendorsLoading ? (
            <TableSkeleton />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendors.map((vendor) => (
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
                        <div className="text-sm">{vendor.phoneNumber}</div>
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
                    <TableCell>{vendor.productsCount}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <span className="text-sm font-medium">
                          {vendor.rating.toFixed(1)}
                        </span>
                        <span className="text-yellow-400 ml-1">★</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            window.open(`tel:${vendor.phoneNumber}`)
                          }
                        >
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingVendor(vendor)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive bg-transparent"
                          onClick={() => handleDeleteVendor(vendor.id)}
                          disabled={deleteVendorMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* Edit Vendor Dialog */}
      {editingVendor && (
        <Dialog
          open={!!editingVendor}
          onOpenChange={() => setEditingVendor(null)}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Vendor</DialogTitle>
              <DialogDescription>Update vendor information</DialogDescription>
            </DialogHeader>
            <VendorForm
              initialData={editingVendor}
              onSubmit={(data) => handleUpdateVendor(editingVendor.id, data)}
              isLoading={updateVendorMutation.isPending}
              onCancel={() => setEditingVendor(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Vendor Form Component
interface VendorFormProps {
  initialData?: any;
  onSubmit: (data: CreateVendorRequest | UpdateVendorRequest) => void;
  isLoading: boolean;
  onCancel: () => void;
}

function VendorForm({
  initialData,
  onSubmit,
  isLoading,
  onCancel,
}: VendorFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    category: initialData?.category || "",
    phoneNumber: initialData?.phoneNumber || "",
    email: initialData?.email || "",
    address: initialData?.address || "",
    description: initialData?.description || "",
    taxId: initialData?.taxId || "",
    bankAccount: initialData?.bankAccount || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Business Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Input
          id="category"
          value={formData.category}
          onChange={(e) =>
            setFormData({ ...formData, category: e.target.value })
          }
          placeholder="e.g., Grocery, Organic Foods"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input
            id="phoneNumber"
            value={formData.phoneNumber}
            onChange={(e) =>
              setFormData({ ...formData, phoneNumber: e.target.value })
            }
            placeholder="+234 xxx xxx xxxx"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            placeholder="contact@vendor.com"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) =>
            setFormData({ ...formData, address: e.target.value })
          }
          placeholder="Enter full business address"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Brief description of the business"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="taxId">Tax ID</Label>
          <Input
            id="taxId"
            value={formData.taxId}
            onChange={(e) =>
              setFormData({ ...formData, taxId: e.target.value })
            }
            placeholder="Tax identification number"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bankAccount">Bank Account</Label>
          <Input
            id="bankAccount"
            value={formData.bankAccount}
            onChange={(e) =>
              setFormData({ ...formData, bankAccount: e.target.value })
            }
            placeholder="Bank account number"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? "Saving..."
            : initialData
            ? "Update Vendor"
            : "Add Vendor"}
        </Button>
      </div>
    </form>
  );
}

"use client";

// Force dynamic rendering
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import Image from "next/image";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Upload,
  Download,
  Package,
  DollarSign,
  // Eye, // Unused
  // EyeOff, // Unused
} from "lucide-react";
import {
  useProducts,
  useProductMetrics,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useBulkUploadProducts,
  useProductCategories,
} from "@/hooks/use-products";
import { useVendors } from "@/hooks/use-vendors";
import { TableSkeleton, StatsCardSkeleton } from "@/components/loading-states";
import { ErrorDisplay, ErrorAlert } from "@/components/error-display";
import {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  VendorDetails,
  ExtendedError,
} from "@/types/api";

// Default product image
const defaultProductImage = "/placeholder-product.png";

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "inactive":
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    case "out_of_stock":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  }
};

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // API hooks
  const {
    data: productsData,
    isLoading: productsLoading,
    error: productsError,
    refetch: refetchProducts,
  } = useProducts({
    search: searchTerm || undefined,
    category: categoryFilter === "all" ? undefined : categoryFilter,
  });

  const {
    data: metricsData,
    isLoading: metricsLoading,
    error: metricsError,
  } = useProductMetrics();

  const { data: categoriesData } = useProductCategories();
  const { data: vendorsData } = useVendors();

  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();
  const bulkUploadMutation = useBulkUploadProducts();

  const products = productsData?.products || [];
  const metrics = metricsData || {
    totalProducts: 0,
    activeProducts: 0,
    outOfStock: 0,
    totalValue: 0,
  };
  const categories = Array.isArray(categoriesData) ? categoriesData : [];
  const vendors = vendorsData?.vendors || [];

  const handleCreateProduct = async (formData: CreateProductRequest) => {
    try {
      await createProductMutation.mutateAsync(formData);
      setIsAddModalOpen(false);
    } catch (error: unknown) {
      // Error is handled by the mutation hook, but we can also handle it here as backup
      console.error("Product creation error in handler:", error);
      const errorMessage =
        (error as Error)?.message ||
        (error as ExtendedError)?.response?.data?.message ||
        "Failed to create product";
      toast.error(errorMessage);
    }
  };

  const handleUpdateProduct = async (
    id: number,
    formData: UpdateProductRequest
  ) => {
    try {
      await updateProductMutation.mutateAsync({ id, data: formData });
      setEditingProduct(null);
    } catch (error: unknown) {
      // Error is handled by the mutation hook, but we can also handle it here as backup
      console.error("Product update error in handler:", error);
      const errorMessage =
        (error as Error)?.message ||
        (error as ExtendedError)?.response?.data?.message ||
        "Failed to update product";
      toast.error(errorMessage);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProductMutation.mutateAsync(id);
      } catch (error: unknown) {
        // Error is handled by the mutation hook, but we can also handle it here as backup
        console.error("Product deletion error in handler:", error);
        const errorMessage =
          (error as Error)?.message ||
          (error as ExtendedError)?.response?.data?.message ||
          "Failed to delete product";
        toast.error(errorMessage);
      }
    }
  };

  const handleBulkUpload = async (file: File) => {
    try {
      await bulkUploadMutation.mutateAsync(file);
      setIsExcelModalOpen(false);
    } catch (error: unknown) {
      // Error is handled by the mutation hook, but we can also handle it here as backup
      console.error("Product bulk upload error in handler:", error);
      const errorMessage =
        (error as Error)?.message ||
        (error as ExtendedError)?.response?.data?.message ||
        "Failed to upload products";
      toast.error(errorMessage);
    }
  };

  const handleDownloadTemplate = () => {
    // Create CSV template
    const headers = [
      "name",
      "description",
      "category",
      "price",
      "unit",
      "stockQuantity",
      "sku",
      "weight",
      "dimensions",
      "tags",
      "isFeatured",
      "isActive",
      "vendorId",
    ];
    const csvContent =
      headers.join(",") +
      "\n" +
      "Sample Product,Sample description,Vegetables,500,kg,100,SKU-001,1.0,10x10x5 cm,fresh;organic,true,true,1";

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "products_template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Show toast notifications for data fetching errors
  useEffect(() => {
    if (productsError) {
      const errorMessage = productsError?.message || "Failed to load products";
      toast.error(errorMessage);
    }
  }, [productsError]);

  useEffect(() => {
    if (metricsError) {
      const errorMessage =
        metricsError?.message || "Failed to load product metrics";
      toast.error(errorMessage);
    }
  }, [metricsError]);

  if (productsError) {
    return (
      <ErrorDisplay
        error={productsError}
        onRetry={() => refetchProducts()}
        title="Failed to load products"
        description="There was an error loading the products data. Please try again."
      />
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">
            Manage products displayed in the mobile app
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isExcelModalOpen} onOpenChange={setIsExcelModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Bulk Upload
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Bulk Upload Products</DialogTitle>
                <DialogDescription>
                  Upload products using Excel/CSV file
                </DialogDescription>
              </DialogHeader>
              <BulkUploadForm
                onUpload={handleBulkUpload}
                onDownloadTemplate={handleDownloadTemplate}
                isLoading={bulkUploadMutation.isPending}
                onCancel={() => setIsExcelModalOpen(false)}
              />
            </DialogContent>
          </Dialog>
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
                <DialogDescription>
                  Create a new product for the mobile app
                </DialogDescription>
              </DialogHeader>
              <ProductForm
                categories={categories}
                vendors={vendors}
                onSubmit={(data) =>
                  handleCreateProduct(data as CreateProductRequest)
                }
                isLoading={createProductMutation.isPending}
                onCancel={() => setIsAddModalOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
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
                  Total Products
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics.totalProducts}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {metrics.activeProducts}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Out of Stock
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {metrics.outOfStock}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Value
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₦{metrics.totalValue.toLocaleString()}
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
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {productsLoading ? (
            <TableSkeleton />
          ) : !isClient ? (
            <TableSkeleton />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product: Product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Image
                          src={product.imageUrl || defaultProductImage}
                          alt={product.name}
                          width={40}
                          height={40}
                          className="rounded-md object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = defaultProductImage;
                          }}
                        />
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">
                            SKU: {product.sku}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{product.category}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {product.vendor?.name || "N/A"}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        ₦{parseFloat(product.price).toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        per {product.unit}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div
                        className={`font-medium ${
                          product.stockQuantity === 0 ? "text-red-600" : ""
                        }`}
                      >
                        {product.stockQuantity} {product.unit}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={getStatusColor(
                          product.isActive ? "active" : "inactive"
                        )}
                      >
                        {product.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingProduct(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive bg-transparent"
                          onClick={() => handleDeleteProduct(product.id)}
                          disabled={deleteProductMutation.isPending}
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

      {/* Edit Product Dialog */}
      {editingProduct && (
        <Dialog
          open={!!editingProduct}
          onOpenChange={() => setEditingProduct(null)}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
              <DialogDescription>Update product information</DialogDescription>
            </DialogHeader>
            <ProductForm
              initialData={editingProduct}
              categories={categories}
              vendors={vendors}
              onSubmit={(data) => handleUpdateProduct(editingProduct.id, data)}
              isLoading={updateProductMutation.isPending}
              onCancel={() => setEditingProduct(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Product Form Component
interface ProductFormProps {
  initialData?: Product;
  categories: string[];
  vendors: VendorDetails[];
  onSubmit: (data: CreateProductRequest | UpdateProductRequest) => void;
  isLoading: boolean;
  onCancel: () => void;
}

function ProductForm({
  initialData,
  categories,
  vendors,
  onSubmit,
  isLoading,
  onCancel,
}: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    category: initialData?.category || "",
    price: initialData?.price || "0",
    unit: initialData?.unit || "",
    stockQuantity: initialData?.stockQuantity || 0,
    sku: initialData?.sku || "",
    weight: initialData?.weight || 0,
    dimensions: initialData?.dimensions || "",
    tags: initialData?.tags?.join(", ") || "",
    isFeatured: initialData?.isFeatured || false,
    isActive: initialData?.isActive ?? true,
    vendorId: initialData?.vendor?.id || 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      price: parseFloat(formData.price),
      tags: formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    };
    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Product Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.category}
            onValueChange={(value) =>
              setFormData({ ...formData, category: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="vendor">Vendor</Label>
          <Select
            value={formData.vendorId.toString()}
            onValueChange={(value) =>
              setFormData({ ...formData, vendorId: parseInt(value) })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select vendor" />
            </SelectTrigger>
            <SelectContent>
              {vendors.map((vendor) => (
                <SelectItem key={vendor.id} value={vendor.id.toString()}>
                  {vendor.businessName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price (₦)</Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: e.target.value })
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="unit">Unit</Label>
          <Input
            id="unit"
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            placeholder="kg, piece, etc."
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="stock">Stock Quantity</Label>
          <Input
            id="stock"
            type="number"
            value={formData.stockQuantity}
            onChange={(e) =>
              setFormData({
                ...formData,
                stockQuantity: parseInt(e.target.value),
              })
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sku">SKU</Label>
          <Input
            id="sku"
            value={formData.sku}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">Tags (comma-separated)</Label>
        <Input
          id="tags"
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          placeholder="fresh, organic, premium"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? "Saving..."
            : initialData
            ? "Update Product"
            : "Add Product"}
        </Button>
      </div>
    </form>
  );
}

// Bulk Upload Form Component
interface BulkUploadFormProps {
  onUpload: (file: File) => void;
  onDownloadTemplate: () => void;
  isLoading: boolean;
  onCancel: () => void;
}

function BulkUploadForm({
  onUpload,
  onDownloadTemplate,
  isLoading,
  onCancel,
}: BulkUploadFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFile) {
      onUpload(selectedFile);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Download Template</Label>
        <Button
          type="button"
          variant="outline"
          onClick={onDownloadTemplate}
          className="w-full bg-transparent"
        >
          <Download className="mr-2 h-4 w-4" />
          Download Excel Template
        </Button>
      </div>
      <div className="space-y-2">
        <Label htmlFor="excel-file">Upload File</Label>
        <Input
          id="excel-file"
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileChange}
          required
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading || !selectedFile}>
          {isLoading ? "Uploading..." : "Upload Products"}
        </Button>
      </div>
    </form>
  );
}

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
import { Pagination } from "@/components/ui/pagination";
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

// No fallback image - show placeholder icon instead

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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter]);

  // API hooks
  const {
    data: productsData,
    isLoading: productsLoading,
    error: productsError,
    refetch: refetchProducts,
  } = useProducts({
    search: searchTerm || undefined,
    category: categoryFilter === "all" ? undefined : categoryFilter,
    page: currentPage,
    limit: pageSize,
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
  const totalItems = productsData?.total || 0;
  const totalPages = productsData?.totalPages || 1;
  const metrics = metricsData || {
    totalProducts: 0,
    activeProducts: 0,
    outOfStock: 0,
    totalValue: 0,
  };
  const categories = Array.isArray(categoriesData) ? categoriesData : [];
  const vendors = vendorsData?.vendors || [];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of table when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when page size changes
  };

  const handleCreateProduct = async (
    formData: CreateProductRequest | UpdateProductRequest | FormData
  ) => {
    try {
      // In create context, we only accept CreateProductRequest or FormData
      // UpdateProductRequest should not be passed here, but we handle it for type safety
      if (formData instanceof FormData) {
        await createProductMutation.mutateAsync(formData);
      } else {
        // Type guard: UpdateProductRequest has optional fields, CreateProductRequest has required fields
        // For create, we expect all required fields, so we cast to CreateProductRequest
        await createProductMutation.mutateAsync(
          formData as CreateProductRequest
        );
      }
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
    formData: UpdateProductRequest | FormData
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
                onSubmit={(data) => {
                  handleCreateProduct(data);
                }}
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
                        {product.imageUrl ? (
                          <Image
                            src={product.imageUrl}
                            alt={product.name}
                            width={40}
                            height={40}
                            className="rounded-md object-cover"
                            onError={(e) => {
                              // Hide image on error, show placeholder instead
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                              const placeholder = target.nextElementSibling;
                              if (placeholder) {
                                (placeholder as HTMLElement).style.display =
                                  "flex";
                              }
                            }}
                          />
                        ) : null}
                        <div
                          className={`w-10 h-10 rounded-md bg-muted flex items-center justify-center ${
                            product.imageUrl ? "hidden" : ""
                          }`}
                        >
                          <Package className="h-5 w-5 text-muted-foreground" />
                        </div>
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
          {!productsLoading && isClient && totalPages > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={totalItems}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              pageSizeOptions={[10, 20, 50, 100]}
            />
          )}
        </CardContent>
      </Card>

      {/* Edit Product Dialog */}
      {editingProduct && (
        <Dialog
          open={!!editingProduct}
          onOpenChange={() => setEditingProduct(null)}
        >
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
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
  onSubmit: (
    data: CreateProductRequest | UpdateProductRequest | FormData
  ) => void;
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
    weight: initialData?.weight?.toString() || "",
    dimensions: initialData?.dimensions || "",
    tags: initialData?.tags?.join(", ") || "",
    isFeatured: initialData?.isFeatured || false,
    isActive: initialData?.isActive ?? true,
    vendorId: initialData?.vendor?.id || 0,
    imageUrl: initialData?.imageUrl || "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.imageUrl || null
  );

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }
      setImageFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      // Clear URL input when file is selected
      setFormData({ ...formData, imageUrl: "" });
    }
  };

  const handleImageUrlChange = (url: string) => {
    setFormData({ ...formData, imageUrl: url });
    // Clear file when URL is entered
    setImageFile(null);
    setImagePreview(url || null);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setFormData({ ...formData, imageUrl: "" });
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Create FormData
    const formDataToSend = new FormData();

    // Add text fields
    if (formData.name) formDataToSend.append("name", formData.name);
    if (formData.description)
      formDataToSend.append("description", formData.description);
    if (formData.category) formDataToSend.append("category", formData.category);
    if (formData.price) formDataToSend.append("price", formData.price);
    if (formData.unit) formDataToSend.append("unit", formData.unit);
    if (formData.stockQuantity !== undefined)
      formDataToSend.append("stockQuantity", formData.stockQuantity.toString());
    if (formData.sku) formDataToSend.append("sku", formData.sku);
    if (formData.dimensions)
      formDataToSend.append("dimensions", formData.dimensions);
    if (formData.tags) formDataToSend.append("tags", formData.tags);
    if (formData.weight) formDataToSend.append("weight", formData.weight);
    formDataToSend.append("isFeatured", formData.isFeatured.toString());
    formDataToSend.append("isActive", formData.isActive.toString());

    // Handle vendorId
    if (formData.vendorId === 0 || !formData.vendorId) {
      formDataToSend.append("vendorId", "");
    } else {
      formDataToSend.append("vendorId", formData.vendorId.toString());
    }

    // Handle image: either file upload or URL
    if (imageFile) {
      // If file is selected, upload it as part of FormData
      formDataToSend.append("image", imageFile);
    } else if (formData.imageUrl && formData.imageUrl.trim() !== "") {
      // If URL is provided, send it
      formDataToSend.append("imageUrl", formData.imageUrl);
    }

    onSubmit(formDataToSend);
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

      {/* Image Upload/URL Section */}
      <div className="space-y-2">
        <Label htmlFor="image">Product Image</Label>
        <div className="space-y-3">
          {/* Image Preview */}
          {imagePreview && (
            <div className="relative inline-block">
              <Image
                src={imagePreview}
                alt="Product preview"
                width={128}
                height={128}
                className="h-32 w-32 rounded-md object-cover border"
                unoptimized={imagePreview.startsWith("data:")}
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                onClick={handleRemoveImage}
              >
                ×
              </Button>
            </div>
          )}

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="image-file">Upload Image File</Label>
            <Input
              id="image-file"
              type="file"
              accept="image/*"
              onChange={handleImageFileChange}
              className="cursor-pointer"
            />
            <p className="text-xs text-muted-foreground">
              Max size: 5MB. Supported formats: JPG, PNG, WebP
            </p>
          </div>

          {/* OR Divider */}
          <div className="flex items-center gap-2">
            <div className="flex-1 border-t"></div>
            <span className="text-sm text-muted-foreground">OR</span>
            <div className="flex-1 border-t"></div>
          </div>

          {/* URL Input */}
          <div className="space-y-2">
            <Label htmlFor="image-url">Image URL</Label>
            <Input
              id="image-url"
              type="url"
              value={formData.imageUrl}
              onChange={(e) => handleImageUrlChange(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
            <p className="text-xs text-muted-foreground">
              Enter a direct URL to an image
            </p>
          </div>
        </div>
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
                stockQuantity: parseInt(e.target.value) || 0,
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

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="weight">Weight (kg)</Label>
          <Input
            id="weight"
            type="number"
            step="0.01"
            min="0"
            value={formData.weight}
            onChange={(e) =>
              setFormData({ ...formData, weight: e.target.value })
            }
            placeholder="Optional"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dimensions">Dimensions</Label>
          <Input
            id="dimensions"
            value={formData.dimensions}
            onChange={(e) =>
              setFormData({ ...formData, dimensions: e.target.value })
            }
            placeholder="Optional"
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

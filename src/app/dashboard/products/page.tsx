"use client";

import { useState } from "react";
import Image from "next/image"; // Add this import
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
  Eye,
  EyeOff,
} from "lucide-react";

// Import images properly
import rice from "../../../../public/premium-rice.png";
import tomatoes from "../../../../public/fresh-tomatoes.png";
import spinach from "../../../../public/organic-spinach.png";
import pepper from "../../../../public/black-pepper-pile.webp";

// Mock data - Fixed image references
const products = [
  {
    id: "PRD-001",
    name: "Fresh Tomatoes",
    category: "Vegetables",
    vendor: "Fresh Farms Market",
    price: 500,
    stock: 150,
    unit: "kg",
    status: "active",
    description: "Fresh organic tomatoes from local farms",
    image: tomatoes, // This is now a StaticImageData object
    createdAt: "2024-01-10",
  },
  {
    id: "PRD-002",
    name: "Premium Rice",
    category: "Grains",
    vendor: "Organic Delights",
    price: 1200,
    stock: 80,
    unit: "kg",
    status: "active",
    description: "High-quality premium rice, perfect for all meals",
    image: rice,
    createdAt: "2024-01-08",
  },
  {
    id: "PRD-003",
    name: "Organic Spinach",
    category: "Vegetables",
    vendor: "Organic Delights",
    price: 300,
    stock: 0,
    unit: "bunch",
    status: "out_of_stock",
    description: "Fresh organic spinach leaves",
    image: spinach, 
    createdAt: "2024-01-05",
  },
  {
    id: "PRD-004",
    name: "Black Pepper",
    category: "Spices",
    vendor: "Spice World",
    price: 800,
    stock: 45,
    unit: "100g",
    status: "inactive",
    description: "Premium black pepper powder",
    image: pepper, // Use imported pepper object
    createdAt: "2024-01-03",
  },
];

const categories = [
  "All",
  "Vegetables",
  "Fruits",
  "Grains",
  "Spices",
  "Dairy",
  "Meat",
  "Beverages",
];
const vendors = [
  "Fresh Farms Market",
  "Organic Delights",
  "Spice World",
  "Meat Masters",
];

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
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "All" || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleDownloadTemplate = () => {
    // Create CSV template
    const headers = [
      "name",
      "category",
      "vendor",
      "price",
      "stock",
      "unit",
      "description",
      "status",
    ];
    const csvContent =
      headers.join(",") +
      "\n" +
      "Sample Product,Vegetables,Fresh Farms Market,500,100,kg,Sample description,active";

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "products_template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

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
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Download Template</Label>
                  <Button
                    variant="outline"
                    onClick={handleDownloadTemplate}
                    className="w-full bg-transparent"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Excel Template
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="excel-file">Upload File</Label>
                  <Input id="excel-file" type="file" accept=".csv,.xlsx,.xls" />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsExcelModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={() => setIsExcelModalOpen(false)}>
                    Upload Products
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
                <DialogDescription>
                  Create a new product for the mobile app
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="product-name">Product Name</Label>
                  <Input id="product-name" placeholder="Enter product name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product-category">Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.slice(1).map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product-vendor">Vendor</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      {vendors.map((vendor) => (
                        <SelectItem key={vendor} value={vendor}>
                          {vendor}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="product-price">Price (₦)</Label>
                    <Input id="product-price" type="number" placeholder="0" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product-unit">Unit</Label>
                    <Input id="product-unit" placeholder="kg, piece, etc." />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product-stock">Stock Quantity</Label>
                  <Input id="product-stock" type="number" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product-description">Description</Label>
                  <Textarea
                    id="product-description"
                    placeholder="Product description"
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
                    Add Product
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Products
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
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
              {products.filter((p) => p.status === "active").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {products.filter((p) => p.status === "out_of_stock").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₦
              {products
                .reduce((sum, p) => sum + p.price * p.stock, 0)
                .toLocaleString()}
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
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {/* Replace img with Next.js Image component */}
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={40}
                        height={40}
                        className="rounded-md object-cover"
                      />
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {product.id}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{product.category}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">{product.vendor}</TableCell>
                  <TableCell>
                    <div className="font-medium">
                      ₦{product.price.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      per {product.unit}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div
                      className={`font-medium ${
                        product.stock === 0 ? "text-red-600" : ""
                      }`}
                    >
                      {product.stock} {product.unit}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(product.status)}>
                      {product.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        {product.status === "active" ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
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

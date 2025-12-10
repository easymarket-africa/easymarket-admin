"use client";

// Force dynamic rendering
export const dynamic = "force-dynamic";

import { useState } from "react";
import { toast } from "sonner";
import Image from "next/image";
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/hooks/use-categories";
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
  Search,
  Plus,
  Edit,
  Trash2,
  Tags,
  Image as ImageIcon,
  Palette,
  Hash,
  Loader2,
} from "lucide-react";
import { TableSkeleton, StatsCardSkeleton } from "@/components/loading-states";
import { ErrorDisplay } from "@/components/error-display";

// Import types from API types
import {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "@/types/api";

// No fallback image - show placeholder icon instead

const getStatusColor = (isActive: boolean) => {
  return isActive
    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
    : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
};

export default function CategoriesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // API hooks
  const {
    data: categoriesData,
    isLoading,
    error,
    refetch: refetchCategories,
  } = useCategories();

  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();

  const categories = categoriesData?.categories || [];

  // Create category handler
  const handleCreateCategory = async (formData: CreateCategoryRequest) => {
    try {
      await createCategoryMutation.mutateAsync(formData);
      toast.success("Category created successfully");
      setIsAddModalOpen(false);
    } catch (error: unknown) {
      const errorMessage =
        (error as Error)?.message || "Failed to create category";
      toast.error(errorMessage);
    }
  };

  // Update category handler
  const handleUpdateCategory = async (
    id: number,
    formData: UpdateCategoryRequest
  ) => {
    try {
      await updateCategoryMutation.mutateAsync({ id, data: formData });
      toast.success("Category updated successfully");
      setEditingCategory(null);
    } catch (error: unknown) {
      const errorMessage =
        (error as Error)?.message || "Failed to update category";
      toast.error(errorMessage);
    }
  };

  // Delete category handler
  const handleDeleteCategory = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this category?")) {
      return;
    }

    try {
      await deleteCategoryMutation.mutateAsync(id);
      toast.success("Category deleted successfully");
    } catch (error: unknown) {
      const errorMessage =
        (error as Error)?.message || "Failed to delete category";
      toast.error(errorMessage);
    }
  };

  // Filter categories based on search term
  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (category.description &&
        category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Calculate metrics
  const metrics = {
    totalCategories: categories.length,
    activeCategories: categories.filter((c) => c.isActive).length,
    inactiveCategories: categories.filter((c) => !c.isActive).length,
  };

  if (error) {
    return (
      <ErrorDisplay
        error={error}
        onRetry={() => refetchCategories()}
        title="Failed to load categories"
        description="There was an error loading the categories data. Please try again."
      />
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">
            Manage product categories displayed in the mobile app
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Category</DialogTitle>
                <DialogDescription>
                  Create a new product category for the mobile app
                </DialogDescription>
              </DialogHeader>
              <CategoryForm
                onSubmit={(data) =>
                  handleCreateCategory(data as CreateCategoryRequest)
                }
                isLoading={createCategoryMutation.isPending}
                onCancel={() => setIsAddModalOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <StatsCardSkeleton key={i} />)
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Categories
                </CardTitle>
                <Tags className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics.totalCategories}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {metrics.activeCategories}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Inactive Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-600">
                  {metrics.inactiveCategories}
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
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Sort Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((category: Category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          {category.imageUrl ? (
                            <Image
                              src={category.imageUrl}
                              alt={category.name}
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
                              category.imageUrl ? "hidden" : ""
                            }`}
                          >
                            <Tags className="h-5 w-5 text-muted-foreground" />
                          </div>
                          {category.color && (
                            <div
                              className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white"
                              style={{ backgroundColor: category.color }}
                            />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{category.name}</div>
                          {category.icon && (
                            <div className="text-sm text-muted-foreground">
                              Icon: {category.icon}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate">
                        {category.description || "No description"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        <Hash className="w-3 h-3 mr-1" />
                        {category.sortOrder}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(category.isActive)}>
                        {category.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingCategory(category)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive bg-transparent"
                          onClick={() => handleDeleteCategory(category.id)}
                          disabled={deleteCategoryMutation.isPending}
                        >
                          {deleteCategoryMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
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

      {/* Edit Category Dialog */}
      {editingCategory && (
        <Dialog
          open={!!editingCategory}
          onOpenChange={() => setEditingCategory(null)}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
              <DialogDescription>Update category information</DialogDescription>
            </DialogHeader>
            <CategoryForm
              initialData={editingCategory}
              onSubmit={(data) =>
                handleUpdateCategory(editingCategory.id, data)
              }
              isLoading={updateCategoryMutation.isPending}
              onCancel={() => setEditingCategory(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Category Form Component
interface CategoryFormProps {
  initialData?: Category;
  onSubmit: (data: CreateCategoryRequest | UpdateCategoryRequest) => void;
  isLoading: boolean;
  onCancel: () => void;
}

function CategoryForm({
  initialData,
  onSubmit,
  isLoading,
  onCancel,
}: CategoryFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    imageUrl: initialData?.imageUrl || "",
    isActive: initialData?.isActive ?? true,
    sortOrder: initialData?.sortOrder || 0,
    color: initialData?.color || "",
    icon: initialData?.icon || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      sortOrder: parseInt(formData.sortOrder.toString()),
    };
    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Category Name</Label>
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
          placeholder="Brief description of the category"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="imageUrl">Image URL</Label>
        <div className="flex gap-2">
          <Input
            id="imageUrl"
            value={formData.imageUrl}
            onChange={(e) =>
              setFormData({ ...formData, imageUrl: e.target.value })
            }
            placeholder="https://example.com/image.png"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const url = prompt("Enter image URL:");
              if (url) {
                setFormData({ ...formData, imageUrl: url });
              }
            }}
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="sortOrder">Sort Order</Label>
          <Input
            id="sortOrder"
            type="number"
            value={formData.sortOrder}
            onChange={(e) =>
              setFormData({
                ...formData,
                sortOrder: parseInt(e.target.value) || 0,
              })
            }
            min="0"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="color">Color (Hex)</Label>
          <div className="flex gap-2">
            <Input
              id="color"
              value={formData.color}
              onChange={(e) =>
                setFormData({ ...formData, color: e.target.value })
              }
              placeholder="#4CAF50"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const color = prompt("Enter color (hex code):");
                if (color) {
                  setFormData({ ...formData, color: color });
                }
              }}
            >
              <Palette className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="icon">Icon (Emoji or Text)</Label>
        <Input
          id="icon"
          value={formData.icon}
          onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
          placeholder="🥦 or icon-name"
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) =>
            setFormData({ ...formData, isActive: e.target.checked })
          }
          className="rounded"
        />
        <Label htmlFor="isActive">Active</Label>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? "Saving..."
            : initialData
            ? "Update Category"
            : "Add Category"}
        </Button>
      </div>
    </form>
  );
}

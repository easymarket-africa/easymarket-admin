"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productsService } from "@/services/products.service";
import { queryKeys } from "@/lib/query-client";
import {
  Product,
  ProductFilters,
  CreateProductRequest,
  UpdateProductRequest,
} from "@/types/api";
import { toast } from "sonner";

/**
 * Products Hooks
 * Provides React Query hooks for product operations
 * Following Single Responsibility Principle
 */

/**
 * Hook to get products list with filters
 */
export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: queryKeys.products.list(filters),
    queryFn: () => productsService.getProducts(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to get product details by ID
 */
export function useProduct(id: number) {
  return useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: () => productsService.getProductById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to get product metrics
 */
export function useProductMetrics() {
  return useQuery({
    queryKey: queryKeys.products.metrics(),
    queryFn: productsService.getProductMetrics,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to get product categories
 */
export function useProductCategories() {
  return useQuery({
    queryKey: [...queryKeys.products.all, "categories"],
    queryFn: productsService.getCategories,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Hook to get product history
 */
export function useProductHistory(id: number) {
  return useQuery({
    queryKey: [...queryKeys.products.detail(id), "history"],
    queryFn: () => productsService.getProductHistory(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook for creating product
 */
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductRequest) =>
      productsService.createProduct(data),
    onSuccess: (newProduct: Product) => {
      // Invalidate products list to refresh
      queryClient.invalidateQueries({
        queryKey: queryKeys.products.lists(),
      });

      // Invalidate metrics
      queryClient.invalidateQueries({
        queryKey: queryKeys.products.metrics(),
      });

      // Invalidate vendors list to refresh product counts
      queryClient.invalidateQueries({
        queryKey: queryKeys.vendors.lists(),
      });

      toast.success("Product created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create product");
    },
  });
}

/**
 * Hook for updating product
 */
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateProductRequest }) =>
      productsService.updateProduct(id, data),
    onSuccess: (updatedProduct: Product) => {
      // Update the specific product in cache
      queryClient.setQueryData(
        queryKeys.products.detail(updatedProduct.id),
        updatedProduct
      );

      // Invalidate products list to refresh
      queryClient.invalidateQueries({
        queryKey: queryKeys.products.lists(),
      });

      // Invalidate metrics
      queryClient.invalidateQueries({
        queryKey: queryKeys.products.metrics(),
      });

      toast.success("Product updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update product");
    },
  });
}

/**
 * Hook for deleting product
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => productsService.deleteProduct(id),
    onSuccess: (_, deletedId) => {
      // Remove the product from cache
      queryClient.removeQueries({
        queryKey: queryKeys.products.detail(deletedId),
      });

      // Invalidate products list to refresh
      queryClient.invalidateQueries({
        queryKey: queryKeys.products.lists(),
      });

      // Invalidate metrics
      queryClient.invalidateQueries({
        queryKey: queryKeys.products.metrics(),
      });

      // Invalidate vendors list to refresh product counts
      queryClient.invalidateQueries({
        queryKey: queryKeys.vendors.lists(),
      });

      toast.success("Product deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete product");
    },
  });
}

/**
 * Hook for bulk uploading products
 */
export function useBulkUploadProducts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => productsService.bulkUploadProducts(file),
    onSuccess: (result) => {
      // Invalidate products list to refresh
      queryClient.invalidateQueries({
        queryKey: queryKeys.products.lists(),
      });

      // Invalidate metrics
      queryClient.invalidateQueries({
        queryKey: queryKeys.products.metrics(),
      });

      // Invalidate vendors list to refresh product counts
      queryClient.invalidateQueries({
        queryKey: queryKeys.vendors.lists(),
      });

      if (result.errorCount > 0) {
        toast.warning(
          `Bulk upload completed with ${result.successCount} successes and ${result.errorCount} errors`
        );
      } else {
        toast.success(`Successfully uploaded ${result.successCount} products`);
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to upload products");
    },
  });
}

/**
 * Hook for duplicating product
 */
export function useDuplicateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => productsService.duplicateProduct(id),
    onSuccess: (newProduct: Product) => {
      // Invalidate products list to refresh
      queryClient.invalidateQueries({
        queryKey: queryKeys.products.lists(),
      });

      // Invalidate metrics
      queryClient.invalidateQueries({
        queryKey: queryKeys.products.metrics(),
      });

      toast.success("Product duplicated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to duplicate product");
    },
  });
}

/**
 * Hook for updating stock quantity
 */
export function useUpdateStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, quantity }: { id: number; quantity: number }) =>
      productsService.updateStock(id, quantity),
    onSuccess: (updatedProduct: Product) => {
      // Update the specific product in cache
      queryClient.setQueryData(
        queryKeys.products.detail(updatedProduct.id),
        updatedProduct
      );

      // Invalidate products list to refresh
      queryClient.invalidateQueries({
        queryKey: queryKeys.products.lists(),
      });

      // Invalidate metrics
      queryClient.invalidateQueries({
        queryKey: queryKeys.products.metrics(),
      });

      toast.success("Stock quantity updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update stock quantity");
    },
  });
}

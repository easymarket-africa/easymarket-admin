"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { vendorsService } from "@/services/vendors.service";
import { queryKeys } from "@/lib/query-client";
import {
  VendorDetails,
  VendorFilters,
  CreateVendorRequest,
  UpdateVendorRequest,
} from "@/types/api";
import { toast } from "sonner";

/**
 * Vendors Hooks
 * Provides React Query hooks for vendor operations
 * Following Single Responsibility Principle
 */

/**
 * Hook to get vendors list with filters
 */
export function useVendors(filters: VendorFilters = {}) {
  return useQuery({
    queryKey: queryKeys.vendors.list(filters),
    queryFn: () => vendorsService.getVendors(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to get vendor details by ID
 */
export function useVendor(id: number) {
  return useQuery({
    queryKey: queryKeys.vendors.detail(id),
    queryFn: () => vendorsService.getVendorById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to get vendor metrics
 */
export function useVendorMetrics() {
  return useQuery({
    queryKey: queryKeys.vendors.metrics(),
    queryFn: vendorsService.getVendorMetrics,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to get vendor's products
 */
export function useVendorProducts(id: number) {
  return useQuery({
    queryKey: [...queryKeys.vendors.detail(id), "products"],
    queryFn: () => vendorsService.getVendorProducts(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to get vendor's orders
 */
export function useVendorOrders(id: number) {
  return useQuery({
    queryKey: [...queryKeys.vendors.detail(id), "orders"],
    queryFn: () => vendorsService.getVendorOrders(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for creating vendor
 */
export function useCreateVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateVendorRequest) =>
      vendorsService.createVendor(data),
    onSuccess: (newVendor: VendorDetails) => {
      // Invalidate vendors list to refresh
      queryClient.invalidateQueries({
        queryKey: queryKeys.vendors.lists(),
      });

      // Invalidate metrics
      queryClient.invalidateQueries({
        queryKey: queryKeys.vendors.metrics(),
      });

      toast.success("Vendor created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create vendor");
    },
  });
}

/**
 * Hook for updating vendor
 */
export function useUpdateVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateVendorRequest }) =>
      vendorsService.updateVendor(id, data),
    onSuccess: (updatedVendor: VendorDetails) => {
      // Update the specific vendor in cache
      queryClient.setQueryData(
        queryKeys.vendors.detail(updatedVendor.id),
        updatedVendor
      );

      // Invalidate vendors list to refresh
      queryClient.invalidateQueries({
        queryKey: queryKeys.vendors.lists(),
      });

      // Invalidate metrics
      queryClient.invalidateQueries({
        queryKey: queryKeys.vendors.metrics(),
      });

      toast.success("Vendor updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update vendor");
    },
  });
}

/**
 * Hook for deleting vendor
 */
export function useDeleteVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => vendorsService.deleteVendor(id),
    onSuccess: (_, deletedId) => {
      // Remove the vendor from cache
      queryClient.removeQueries({
        queryKey: queryKeys.vendors.detail(deletedId),
      });

      // Invalidate vendors list to refresh
      queryClient.invalidateQueries({
        queryKey: queryKeys.vendors.lists(),
      });

      // Invalidate metrics
      queryClient.invalidateQueries({
        queryKey: queryKeys.vendors.metrics(),
      });

      // Invalidate products list to refresh vendor information
      queryClient.invalidateQueries({
        queryKey: queryKeys.products.lists(),
      });

      toast.success("Vendor deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete vendor");
    },
  });
}

/**
 * Hook for approving vendor
 */
export function useApproveVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => vendorsService.approveVendor(id),
    onSuccess: (updatedVendor: VendorDetails) => {
      // Update the specific vendor in cache
      queryClient.setQueryData(
        queryKeys.vendors.detail(updatedVendor.id),
        updatedVendor
      );

      // Invalidate vendors list to refresh
      queryClient.invalidateQueries({
        queryKey: queryKeys.vendors.lists(),
      });

      // Invalidate metrics
      queryClient.invalidateQueries({
        queryKey: queryKeys.vendors.metrics(),
      });

      toast.success("Vendor approved successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to approve vendor");
    },
  });
}

/**
 * Hook for suspending vendor
 */
export function useSuspendVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      vendorsService.suspendVendor(id, reason),
    onSuccess: (updatedVendor: VendorDetails) => {
      // Update the specific vendor in cache
      queryClient.setQueryData(
        queryKeys.vendors.detail(updatedVendor.id),
        updatedVendor
      );

      // Invalidate vendors list to refresh
      queryClient.invalidateQueries({
        queryKey: queryKeys.vendors.lists(),
      });

      // Invalidate metrics
      queryClient.invalidateQueries({
        queryKey: queryKeys.vendors.metrics(),
      });

      // Invalidate products list to refresh vendor status
      queryClient.invalidateQueries({
        queryKey: queryKeys.products.lists(),
      });

      toast.success("Vendor suspended successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to suspend vendor");
    },
  });
}

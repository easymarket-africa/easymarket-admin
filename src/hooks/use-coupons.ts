"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { couponsService } from "@/services/coupons.service";
import { queryKeys } from "@/lib/query-client";
import {
  CouponFilters,
  CreateCouponRequest,
  ExtendedError,
  TerminateCouponRequest,
  UpdateCouponRequest,
} from "@/types/api";
import { toast } from "sonner";

function extractErrorMessage(error: Error, fallback: string): string {
  return (
    error?.message ||
    (error as ExtendedError)?.response?.data?.message ||
    fallback
  );
}

export function useCoupons(filters: CouponFilters = {}) {
  return useQuery({
    queryKey: queryKeys.coupons.list(filters),
    queryFn: () => couponsService.getCoupons(filters),
    staleTime: 30 * 1000,
  });
}

export function useCoupon(id: number) {
  return useQuery({
    queryKey: queryKeys.coupons.detail(id),
    queryFn: () => couponsService.getCouponById(id),
    enabled: !!id,
  });
}

export function useCouponRedemptions(id: number) {
  return useQuery({
    queryKey: queryKeys.coupons.redemptions(id),
    queryFn: () => couponsService.getRedemptions(id),
    enabled: !!id,
  });
}

export function useCreateCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCouponRequest) => couponsService.createCoupon(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.coupons.lists() });
      toast.success("Coupon created");
    },
    onError: (error: Error) => {
      toast.error(extractErrorMessage(error, "Failed to create coupon"));
    },
  });
}

export function useUpdateCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCouponRequest }) =>
      couponsService.updateCoupon(id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.coupons.detail(updated.id), updated);
      queryClient.invalidateQueries({ queryKey: queryKeys.coupons.lists() });
      toast.success("Coupon updated");
    },
    onError: (error: Error) => {
      toast.error(extractErrorMessage(error, "Failed to update coupon"));
    },
  });
}

export function useDeleteCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => couponsService.deleteCoupon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.coupons.lists() });
      toast.success("Coupon deleted");
    },
    onError: (error: Error) => {
      toast.error(extractErrorMessage(error, "Failed to delete coupon"));
    },
  });
}

export function useTerminateCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data?: TerminateCouponRequest }) =>
      couponsService.terminateCoupon(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.coupons.lists() });
      toast.success("Coupon deactivated");
    },
    onError: (error: Error) => {
      toast.error(extractErrorMessage(error, "Failed to deactivate coupon"));
    },
  });
}

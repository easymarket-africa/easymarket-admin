"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ordersService } from "@/services/orders.service";
import { queryKeys } from "@/lib/query-client";
import {
  Order,
  OrderFilters,
  UpdateOrderStatusRequest,
  AssignAgentRequest,
  CancelOrderRequest,
} from "@/types/api";
import { toast } from "sonner";

/**
 * Orders Hooks
 * Provides React Query hooks for order operations
 * Following Single Responsibility Principle
 */

/**
 * Hook to get orders list with filters
 */
export function useOrders(filters: OrderFilters = {}) {
  return useQuery({
    queryKey: queryKeys.orders.list(filters),
    queryFn: () => ordersService.getOrders(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to get order details by ID
 */
export function useOrder(id: number) {
  return useQuery({
    queryKey: queryKeys.orders.detail(id),
    queryFn: () => ordersService.getOrderById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to get order history
 */
export function useOrderHistory(id: number) {
  return useQuery({
    queryKey: [...queryKeys.orders.detail(id), "history"],
    queryFn: () => ordersService.getOrderHistory(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook for updating order status
 */
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateOrderStatusRequest;
    }) => ordersService.updateOrderStatus(id, data),
    onSuccess: (updatedOrder: Order) => {
      // Update the specific order in cache
      queryClient.setQueryData(
        queryKeys.orders.detail(updatedOrder.id),
        updatedOrder
      );

      // Invalidate orders list to refresh
      queryClient.invalidateQueries({
        queryKey: queryKeys.orders.lists(),
      });

      toast.success("Order status updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update order status");
    },
  });
}

/**
 * Hook for assigning agent to order
 */
export function useAssignAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: AssignAgentRequest }) =>
      ordersService.assignAgent(id, data),
    onSuccess: (updatedOrder: Order) => {
      // Update the specific order in cache
      queryClient.setQueryData(
        queryKeys.orders.detail(updatedOrder.id),
        updatedOrder
      );

      // Invalidate orders list to refresh
      queryClient.invalidateQueries({
        queryKey: queryKeys.orders.lists(),
      });

      // Invalidate agents list to refresh availability
      queryClient.invalidateQueries({
        queryKey: queryKeys.agents.lists(),
      });

      toast.success("Agent assigned successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to assign agent");
    },
  });
}

/**
 * Hook for canceling order
 */
export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CancelOrderRequest }) =>
      ordersService.cancelOrder(id, data),
    onSuccess: (updatedOrder: Order) => {
      // Update the specific order in cache
      queryClient.setQueryData(
        queryKeys.orders.detail(updatedOrder.id),
        updatedOrder
      );

      // Invalidate orders list to refresh
      queryClient.invalidateQueries({
        queryKey: queryKeys.orders.lists(),
      });

      toast.success("Order cancelled successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to cancel order");
    },
  });
}

/**
 * Hook for processing refund
 */
export function useProcessRefund() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: { reason: string; amount?: number };
    }) => ordersService.processRefund(id, data),
    onSuccess: (updatedOrder: Order) => {
      // Update the specific order in cache
      queryClient.setQueryData(
        queryKeys.orders.detail(updatedOrder.id),
        updatedOrder
      );

      // Invalidate orders list to refresh
      queryClient.invalidateQueries({
        queryKey: queryKeys.orders.lists(),
      });

      toast.success("Refund processed successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to process refund");
    },
  });
}

/**
 * Hook for updating delivery address
 */
export function useUpdateDeliveryAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: { street: string; city: string; state: string; country: string };
    }) => ordersService.updateDeliveryAddress(id, data),
    onSuccess: (updatedOrder: Order) => {
      // Update the specific order in cache
      queryClient.setQueryData(
        queryKeys.orders.detail(updatedOrder.id),
        updatedOrder
      );

      toast.success("Delivery address updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update delivery address");
    },
  });
}

/**
 * Hook for updating customer information
 */
export function useUpdateCustomerInfo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: { name?: string; email?: string; phoneNumber?: string };
    }) => ordersService.updateCustomerInfo(id, data),
    onSuccess: (updatedOrder: Order) => {
      // Update the specific order in cache
      queryClient.setQueryData(
        queryKeys.orders.detail(updatedOrder.id),
        updatedOrder
      );

      toast.success("Customer information updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update customer information");
    },
  });
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "@/services/analytics.service";
import { queryKeys } from "@/lib/query-client";
import { AnalyticsFilters } from "@/types/api";

/**
 * Analytics Hooks
 * Provides React Query hooks for analytics operations
 * Following Single Responsibility Principle
 */

/**
 * Hook to get analytics overview
 */
export function useAnalyticsOverview(filters: AnalyticsFilters = {}) {
  return useQuery({
    queryKey: queryKeys.analytics.overview(filters),
    queryFn: () => analyticsService.getAnalyticsOverview(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to get revenue trends
 */
export function useRevenueTrends(filters: AnalyticsFilters = {}) {
  return useQuery({
    queryKey: [...queryKeys.analytics.all, "revenue-trends", filters],
    queryFn: () => analyticsService.getRevenueTrends(filters),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to get order trends
 */
export function useOrderTrends(filters: AnalyticsFilters = {}) {
  return useQuery({
    queryKey: [...queryKeys.analytics.all, "order-trends", filters],
    queryFn: () => analyticsService.getOrderTrends(filters),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to get agent performance analytics
 */
export function useAgentPerformance(filters: AnalyticsFilters = {}) {
  return useQuery({
    queryKey: [...queryKeys.analytics.all, "agent-performance", filters],
    queryFn: () => analyticsService.getAgentPerformance(filters),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to get product performance analytics
 */
export function useProductPerformance(filters: AnalyticsFilters = {}) {
  return useQuery({
    queryKey: [...queryKeys.analytics.all, "product-performance", filters],
    queryFn: () => analyticsService.getProductPerformance(filters),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

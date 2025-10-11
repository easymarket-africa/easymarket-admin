import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "@/types/api";

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time: 5 minutes
      staleTime: 5 * 60 * 1000,
      // Cache time: 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry failed requests 3 times
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors (client errors)
        if (error instanceof Error && "response" in error) {
          const apiError = error as ApiError;
          if (apiError.code && apiError.code.startsWith("4")) {
            return false;
          }
        }
        return failureCount < 3;
      },
      // Retry delay with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus
      refetchOnWindowFocus: false,
      // Refetch on reconnect
      refetchOnReconnect: true,
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
      // Retry delay
      retryDelay: 1000,
    },
  },
});

// Query keys factory for consistent key management
export const queryKeys = {
  // Authentication
  auth: {
    user: ["auth", "user"] as const,
  },

  // Orders
  orders: {
    all: ["orders"] as const,
    lists: () => [...queryKeys.orders.all, "list"] as const,
    list: (filters: Record<string, any>) =>
      [...queryKeys.orders.lists(), filters] as const,
    details: () => [...queryKeys.orders.all, "detail"] as const,
    detail: (id: number) => [...queryKeys.orders.details(), id] as const,
  },

  // Products
  products: {
    all: ["products"] as const,
    lists: () => [...queryKeys.products.all, "list"] as const,
    list: (filters: Record<string, any>) =>
      [...queryKeys.products.lists(), filters] as const,
    details: () => [...queryKeys.products.all, "detail"] as const,
    detail: (id: number) => [...queryKeys.products.details(), id] as const,
    metrics: () => [...queryKeys.products.all, "metrics"] as const,
  },

  // Agents
  agents: {
    all: ["agents"] as const,
    lists: () => [...queryKeys.agents.all, "list"] as const,
    list: (filters: Record<string, any>) =>
      [...queryKeys.agents.lists(), filters] as const,
    details: () => [...queryKeys.agents.all, "detail"] as const,
    detail: (id: number) => [...queryKeys.agents.details(), id] as const,
    metrics: () => [...queryKeys.agents.all, "metrics"] as const,
  },

  // Vendors
  vendors: {
    all: ["vendors"] as const,
    lists: () => [...queryKeys.vendors.all, "list"] as const,
    list: (filters: Record<string, any>) =>
      [...queryKeys.vendors.lists(), filters] as const,
    details: () => [...queryKeys.vendors.all, "detail"] as const,
    detail: (id: number) => [...queryKeys.vendors.details(), id] as const,
    metrics: () => [...queryKeys.vendors.all, "metrics"] as const,
  },

  // Analytics
  analytics: {
    all: ["analytics"] as const,
    overview: (filters: Record<string, any>) =>
      [...queryKeys.analytics.all, "overview", filters] as const,
  },

  // Settings
  settings: {
    all: ["settings"] as const,
    general: () => [...queryKeys.settings.all, "general"] as const,
    notifications: () => [...queryKeys.settings.all, "notifications"] as const,
    security: () => [...queryKeys.settings.all, "security"] as const,
    integrations: () => [...queryKeys.settings.all, "integrations"] as const,
    billing: () => [...queryKeys.settings.all, "billing"] as const,
  },

  // WhatsApp
  whatsapp: {
    all: ["whatsapp"] as const,
    groups: () => [...queryKeys.whatsapp.all, "groups"] as const,
  },
};

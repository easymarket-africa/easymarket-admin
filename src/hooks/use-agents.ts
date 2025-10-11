"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { agentsService } from "@/services/agents.service";
import { queryKeys } from "@/lib/query-client";
import {
  AgentDetails,
  AgentFilters,
  CreateAgentRequest,
  UpdateAgentRequest,
} from "@/types/api";
import { toast } from "sonner";

/**
 * Agents Hooks
 * Provides React Query hooks for agent operations
 * Following Single Responsibility Principle
 */

/**
 * Hook to get agents list with filters
 */
export function useAgents(filters: AgentFilters = {}) {
  return useQuery({
    queryKey: queryKeys.agents.list(filters),
    queryFn: () => agentsService.getAgents(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to get agent details by ID
 */
export function useAgent(id: number) {
  return useQuery({
    queryKey: queryKeys.agents.detail(id),
    queryFn: () => agentsService.getAgentById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to get available agents (public endpoint)
 */
export function useAvailableAgents() {
  return useQuery({
    queryKey: [...queryKeys.agents.lists(), "available"],
    queryFn: () => agentsService.getAvailableAgents(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to get agent metrics
 */
export function useAgentMetrics() {
  return useQuery({
    queryKey: queryKeys.agents.metrics(),
    queryFn: () => agentsService.getAgentMetrics(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to get agent's order history
 */
export function useAgentOrders(id: number) {
  return useQuery({
    queryKey: [...queryKeys.agents.detail(id), "orders"],
    queryFn: () => agentsService.getAgentOrders(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for creating agent
 */
export function useCreateAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAgentRequest) => agentsService.createAgent(data),
    onSuccess: (newAgent: AgentDetails) => {
      // Invalidate agents list to refresh
      queryClient.invalidateQueries({
        queryKey: queryKeys.agents.lists(),
      });

      // Invalidate metrics
      queryClient.invalidateQueries({
        queryKey: queryKeys.agents.metrics(),
      });

      toast.success("Agent created successfully");
    },
    onError: (error: any) => {
      console.error("Agent creation error:", error);
      const errorMessage =
        error?.message ||
        error?.response?.data?.message ||
        "Failed to create agent";
      toast.error(errorMessage);
    },
  });
}

/**
 * Hook for updating agent
 */
export function useUpdateAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateAgentRequest }) =>
      agentsService.updateAgent(id, data),
    onSuccess: (updatedAgent: AgentDetails) => {
      // Update the specific agent in cache
      queryClient.setQueryData(
        queryKeys.agents.detail(updatedAgent.id),
        updatedAgent
      );

      // Invalidate agents list to refresh
      queryClient.invalidateQueries({
        queryKey: queryKeys.agents.lists(),
      });

      // Invalidate metrics
      queryClient.invalidateQueries({
        queryKey: queryKeys.agents.metrics(),
      });

      toast.success("Agent updated successfully");
    },
    onError: (error: any) => {
      console.error("Agent update error:", error);
      const errorMessage =
        error?.message ||
        error?.response?.data?.message ||
        "Failed to update agent";
      toast.error(errorMessage);
    },
  });
}

/**
 * Hook for deleting agent
 */
export function useDeleteAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => agentsService.deleteAgent(id),
    onSuccess: (_, deletedId) => {
      // Remove the agent from cache
      queryClient.removeQueries({
        queryKey: queryKeys.agents.detail(deletedId),
      });

      // Invalidate agents list to refresh
      queryClient.invalidateQueries({
        queryKey: queryKeys.agents.lists(),
      });

      // Invalidate metrics
      queryClient.invalidateQueries({
        queryKey: queryKeys.agents.metrics(),
      });

      toast.success("Agent deleted successfully");
    },
    onError: (error: any) => {
      console.error("Agent deletion error:", error);
      const errorMessage =
        error?.message ||
        error?.response?.data?.message ||
        "Failed to delete agent";
      toast.error(errorMessage);
    },
  });
}

/**
 * Hook for suspending agent
 */
export function useSuspendAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      agentsService.suspendAgent(id, reason),
    onSuccess: (updatedAgent: AgentDetails) => {
      // Update the specific agent in cache
      queryClient.setQueryData(
        queryKeys.agents.detail(updatedAgent.id),
        updatedAgent
      );

      // Invalidate agents list to refresh
      queryClient.invalidateQueries({
        queryKey: queryKeys.agents.lists(),
      });

      // Invalidate metrics
      queryClient.invalidateQueries({
        queryKey: queryKeys.agents.metrics(),
      });

      toast.success("Agent suspended successfully");
    },
    onError: (error: any) => {
      console.error("Agent suspension error:", error);
      const errorMessage =
        error?.message ||
        error?.response?.data?.message ||
        "Failed to suspend agent";
      toast.error(errorMessage);
    },
  });
}

/**
 * Hook for activating agent
 */
export function useActivateAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => agentsService.activateAgent(id),
    onSuccess: (updatedAgent: AgentDetails) => {
      // Update the specific agent in cache
      queryClient.setQueryData(
        queryKeys.agents.detail(updatedAgent.id),
        updatedAgent
      );

      // Invalidate agents list to refresh
      queryClient.invalidateQueries({
        queryKey: queryKeys.agents.lists(),
      });

      // Invalidate metrics
      queryClient.invalidateQueries({
        queryKey: queryKeys.agents.metrics(),
      });

      toast.success("Agent activated successfully");
    },
    onError: (error: any) => {
      console.error("Agent activation error:", error);
      const errorMessage =
        error?.message ||
        error?.response?.data?.message ||
        "Failed to activate agent";
      toast.error(errorMessage);
    },
  });
}

/**
 * Hook for updating agent rating
 */
export function useUpdateAgentRating() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, rating }: { id: number; rating: number }) =>
      agentsService.updateAgentRating(id, rating),
    onSuccess: (updatedAgent: AgentDetails) => {
      // Update the specific agent in cache
      queryClient.setQueryData(
        queryKeys.agents.detail(updatedAgent.id),
        updatedAgent
      );

      // Invalidate agents list to refresh
      queryClient.invalidateQueries({
        queryKey: queryKeys.agents.lists(),
      });

      toast.success("Agent rating updated successfully");
    },
    onError: (error: any) => {
      console.error("Agent rating update error:", error);
      const errorMessage =
        error?.message ||
        error?.response?.data?.message ||
        "Failed to update agent rating";
      toast.error(errorMessage);
    },
  });
}

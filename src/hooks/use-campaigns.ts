"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { campaignsService } from "@/services/campaigns.service";
import { queryKeys } from "@/lib/query-client";
import {
  CampaignFilters,
  CreateCampaignRequest,
  ExtendedError,
  UpdateCampaignTriggerRequest,
} from "@/types/api";
import { toast } from "sonner";

/**
 * Campaign Hooks
 * React Query hooks for campaign operations, following the same
 * single-responsibility pattern as use-vendors.ts.
 */

export function useCampaigns(filters: CampaignFilters = {}) {
  return useQuery({
    queryKey: queryKeys.campaigns.list(filters),
    queryFn: () => campaignsService.getCampaigns(filters),
    staleTime: 30 * 1000, // campaigns can be actively sending — refresh often
    refetchInterval: 15 * 1000,
  });
}

export function useCampaign(id: number) {
  return useQuery({
    queryKey: queryKeys.campaigns.detail(id),
    queryFn: () => campaignsService.getCampaignById(id),
    enabled: !!id,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "sending" || status === "queued" ? 5000 : false;
    },
  });
}

export function useCampaignRecipients(id: number, page = 1, limit = 50) {
  return useQuery({
    queryKey: [...queryKeys.campaigns.recipients(id), page, limit],
    queryFn: () => campaignsService.getCampaignRecipients(id, page, limit),
    enabled: !!id,
  });
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCampaignRequest) =>
      campaignsService.createCampaign(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.lists() });
      toast.success("Campaign created");
    },
    onError: (error: Error) => {
      const errorMessage =
        error?.message ||
        (error as ExtendedError)?.response?.data?.message ||
        "Failed to create campaign";
      toast.error(errorMessage);
    },
  });
}

export function useCancelCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => campaignsService.cancelCampaign(id),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.campaigns.detail(updated.id), updated);
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.lists() });
      toast.success("Campaign cancelled");
    },
    onError: (error: Error) => {
      const errorMessage =
        error?.message ||
        (error as ExtendedError)?.response?.data?.message ||
        "Failed to cancel campaign";
      toast.error(errorMessage);
    },
  });
}

export function useCampaignTriggers() {
  return useQuery({
    queryKey: queryKeys.campaigns.triggers(),
    queryFn: () => campaignsService.getTriggers(),
  });
}

export function useUpdateCampaignTrigger() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateCampaignTriggerRequest;
    }) => campaignsService.updateTrigger(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.triggers() });
      toast.success("Trigger updated");
    },
    onError: (error: Error) => {
      const errorMessage =
        error?.message ||
        (error as ExtendedError)?.response?.data?.message ||
        "Failed to update trigger";
      toast.error(errorMessage);
    },
  });
}

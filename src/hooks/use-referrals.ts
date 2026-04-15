"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-client";
import { referralsService } from "@/services/referrals.service";
import {
  CreateReferralCodeRequest,
  ReferralCode,
  ReferralCodeFilters,
  ReferralRewardFilters,
  ReferralUsageFilters,
  UpdateReferralCodeRequest,
} from "@/types/api";
import { toast } from "sonner";

export function useReferralCodes(filters: ReferralCodeFilters = {}) {
  return useQuery({
    queryKey: queryKeys.referrals.codeList(filters),
    queryFn: () => referralsService.getReferralCodes(filters),
    staleTime: 2 * 60 * 1000,
  });
}

export function useReferralUsages(filters: ReferralUsageFilters = {}) {
  return useQuery({
    queryKey: queryKeys.referrals.usageList(filters),
    queryFn: () => referralsService.getReferralUsages(filters),
    staleTime: 2 * 60 * 1000,
  });
}

export function useReferralRewards(filters: ReferralRewardFilters = {}) {
  return useQuery({
    queryKey: queryKeys.referrals.rewardList(filters),
    queryFn: () => referralsService.getReferralRewards(filters),
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateReferralCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReferralCodeRequest) =>
      referralsService.createReferralCode(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.referrals.codes() });
      toast.success("Referral code created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create referral code");
    },
  });
}

export function useUpdateReferralCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateReferralCodeRequest;
    }) => referralsService.updateReferralCode(id, data),
    onSuccess: (updated: ReferralCode) => {
      queryClient.setQueryData(
        queryKeys.referrals.codeList({}),
        (prev: { data?: ReferralCode[] } | undefined) => {
          if (!prev?.data) {
            return prev;
          }
          return {
            ...prev,
            data: prev.data.map((code: ReferralCode) =>
              code.id === updated.id ? updated : code
            ),
          };
        }
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.referrals.codes() });
      toast.success("Referral code updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update referral code");
    },
  });
}

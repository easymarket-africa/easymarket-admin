"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { whatsappService } from "@/services/whatsapp.service";
import { queryKeys } from "@/lib/query-client";
import {
  WhatsAppGroup,
  CreateWhatsAppGroupRequest,
  UpdateWhatsAppGroupRequest,
  SendWhatsAppMessageRequest,
} from "@/types/api";
import { toast } from "sonner";

/**
 * WhatsApp Hooks
 * Provides React Query hooks for WhatsApp operations
 * Following Single Responsibility Principle
 */

/**
 * Hook to get WhatsApp groups
 */
export function useWhatsAppGroups() {
  return useQuery({
    queryKey: queryKeys.whatsapp.groups(),
    queryFn: whatsappService.getGroups,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to get group messages
 */
export function useGroupMessages(
  groupId: number,
  filters: { page?: number; limit?: number } = {}
) {
  return useQuery({
    queryKey: [...queryKeys.whatsapp.groups(), groupId, "messages", filters],
    queryFn: () => whatsappService.getGroupMessages(groupId, filters),
    enabled: !!groupId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to get message status
 */
export function useMessageStatus(messageId: string) {
  return useQuery({
    queryKey: [...queryKeys.whatsapp.all, "messages", messageId, "status"],
    queryFn: () => whatsappService.getMessageStatus(messageId),
    enabled: !!messageId,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
}

/**
 * Hook for creating WhatsApp group
 */
export function useCreateWhatsAppGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateWhatsAppGroupRequest) =>
      whatsappService.createGroup(data),
    onSuccess: (newGroup: WhatsAppGroup) => {
      // Invalidate groups list to refresh
      queryClient.invalidateQueries({
        queryKey: queryKeys.whatsapp.groups(),
      });

      toast.success("WhatsApp group created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create WhatsApp group");
    },
  });
}

/**
 * Hook for updating WhatsApp group
 */
export function useUpdateWhatsAppGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateWhatsAppGroupRequest;
    }) => whatsappService.updateGroup(id, data),
    onSuccess: (updatedGroup: WhatsAppGroup) => {
      // Update the specific group in cache
      queryClient.setQueryData(
        [...queryKeys.whatsapp.groups(), updatedGroup.id],
        updatedGroup
      );

      // Invalidate groups list to refresh
      queryClient.invalidateQueries({
        queryKey: queryKeys.whatsapp.groups(),
      });

      toast.success("WhatsApp group updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update WhatsApp group");
    },
  });
}

/**
 * Hook for deleting WhatsApp group
 */
export function useDeleteWhatsAppGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => whatsappService.deleteGroup(id),
    onSuccess: (_, deletedId) => {
      // Remove the group from cache
      queryClient.removeQueries({
        queryKey: [...queryKeys.whatsapp.groups(), deletedId],
      });

      // Invalidate groups list to refresh
      queryClient.invalidateQueries({
        queryKey: queryKeys.whatsapp.groups(),
      });

      toast.success("WhatsApp group deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete WhatsApp group");
    },
  });
}

/**
 * Hook for sending WhatsApp message
 */
export function useSendWhatsAppMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SendWhatsAppMessageRequest) =>
      whatsappService.sendMessage(data),
    onSuccess: (result) => {
      // Invalidate group messages to refresh
      if (result.messageId) {
        queryClient.invalidateQueries({
          queryKey: [...queryKeys.whatsapp.groups(), "messages"],
        });
      }

      toast.success("WhatsApp message sent successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to send WhatsApp message");
    },
  });
}

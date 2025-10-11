"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { settingsService } from "@/services/settings.service";
import { queryKeys } from "@/lib/query-client";
import {
  GeneralSettings,
  NotificationSettings,
  SecuritySettings,
  IntegrationSettings,
  BillingSettings,
} from "@/types/api";
import { toast } from "sonner";

/**
 * Settings Hooks
 * Provides React Query hooks for settings operations
 * Following Single Responsibility Principle
 */

// General Settings Hooks
export function useGeneralSettings() {
  return useQuery({
    queryKey: queryKeys.settings.general(),
    queryFn: () => settingsService.getGeneralSettings(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useUpdateGeneralSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<GeneralSettings>) =>
      settingsService.updateGeneralSettings(data),
    onSuccess: (updatedSettings: GeneralSettings) => {
      queryClient.setQueryData(queryKeys.settings.general(), updatedSettings);
      toast.success("General settings updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update general settings");
    },
  });
}

// Notification Settings Hooks
export function useNotificationSettings() {
  return useQuery({
    queryKey: queryKeys.settings.notifications(),
    queryFn: () => settingsService.getNotificationSettings(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useUpdateNotificationSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<NotificationSettings>) =>
      settingsService.updateNotificationSettings(data),
    onSuccess: (updatedSettings: NotificationSettings) => {
      queryClient.setQueryData(
        queryKeys.settings.notifications(),
        updatedSettings
      );
      toast.success("Notification settings updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update notification settings");
    },
  });
}

// Security Settings Hooks
export function useSecuritySettings() {
  return useQuery({
    queryKey: queryKeys.settings.security(),
    queryFn: () => settingsService.getSecuritySettings(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useUpdateSecuritySettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<SecuritySettings>) =>
      settingsService.updateSecuritySettings(data),
    onSuccess: (updatedSettings: SecuritySettings) => {
      queryClient.setQueryData(queryKeys.settings.security(), updatedSettings);
      toast.success("Security settings updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update security settings");
    },
  });
}

// Integration Settings Hooks
export function useIntegrationSettings() {
  return useQuery({
    queryKey: queryKeys.settings.integrations(),
    queryFn: () => settingsService.getIntegrationSettings(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useUpdateIntegrationSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<IntegrationSettings>) =>
      settingsService.updateIntegrationSettings(data),
    onSuccess: (updatedSettings: IntegrationSettings) => {
      queryClient.setQueryData(
        queryKeys.settings.integrations(),
        updatedSettings
      );
      toast.success("Integration settings updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update integration settings");
    },
  });
}

// Billing Settings Hooks
export function useBillingSettings() {
  return useQuery({
    queryKey: queryKeys.settings.billing(),
    queryFn: () => settingsService.getBillingSettings(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useUpdateBillingSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<BillingSettings>) =>
      settingsService.updateBillingSettings(data),
    onSuccess: (updatedSettings: BillingSettings) => {
      queryClient.setQueryData(queryKeys.settings.billing(), updatedSettings);
      toast.success("Billing settings updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update billing settings");
    },
  });
}

// Backup Settings Hooks
export function useBackupSettings() {
  return useQuery({
    queryKey: [...queryKeys.settings.all, "backup"],
    queryFn: () => settingsService.getBackupSettings(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateBackup() {
  return useMutation({
    mutationFn: () => settingsService.createBackup(),
    onSuccess: (result) => {
      toast.success(
        `Backup created successfully. Backup ID: ${result.backupId}`
      );
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create backup");
    },
  });
}

// System Logs Hooks
export function useSystemLogs(
  filters: { page?: number; limit?: number; level?: string } = {}
) {
  return useQuery({
    queryKey: [...queryKeys.settings.all, "logs", filters],
    queryFn: () => settingsService.getSystemLogs(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Maintenance Mode Hooks
export function useToggleMaintenanceMode() {
  return useMutation({
    mutationFn: (enabled: boolean) =>
      settingsService.toggleMaintenanceMode(enabled),
    onSuccess: (result) => {
      const message = result.maintenanceMode
        ? "Maintenance mode enabled"
        : "Maintenance mode disabled";
      toast.success(message);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to toggle maintenance mode");
    },
  });
}

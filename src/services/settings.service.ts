import { apiClient } from "@/lib/api-client";
import {
  GeneralSettings,
  NotificationSettings,
  SecuritySettings,
  IntegrationSettings,
  BillingSettings,
  BackupSettings,
  SystemLog,
} from "@/types/api";

/**
 * Settings Service
 * Handles all settings-related API calls
 * Following Single Responsibility Principle
 */
export class SettingsService {
  private readonly basePath = "/admin/settings";

  // General Settings
  async getGeneralSettings(): Promise<GeneralSettings> {
    return apiClient.get<GeneralSettings>(`${this.basePath}/general`);
  }

  async updateGeneralSettings(
    data: Partial<GeneralSettings>
  ): Promise<GeneralSettings> {
    return apiClient.put<GeneralSettings>(`${this.basePath}/general`, data);
  }

  // Notification Settings
  async getNotificationSettings(): Promise<NotificationSettings> {
    return apiClient.get<NotificationSettings>(
      `${this.basePath}/notifications`
    );
  }

  async updateNotificationSettings(
    data: Partial<NotificationSettings>
  ): Promise<NotificationSettings> {
    return apiClient.put<NotificationSettings>(
      `${this.basePath}/notifications`,
      data
    );
  }

  // Security Settings
  async getSecuritySettings(): Promise<SecuritySettings> {
    return apiClient.get<SecuritySettings>(`${this.basePath}/security`);
  }

  async updateSecuritySettings(
    data: Partial<SecuritySettings>
  ): Promise<SecuritySettings> {
    return apiClient.put<SecuritySettings>(`${this.basePath}/security`, data);
  }

  // Integration Settings
  async getIntegrationSettings(): Promise<IntegrationSettings> {
    return apiClient.get<IntegrationSettings>(`${this.basePath}/integrations`);
  }

  async updateIntegrationSettings(
    data: Partial<IntegrationSettings>
  ): Promise<IntegrationSettings> {
    return apiClient.put<IntegrationSettings>(
      `${this.basePath}/integrations`,
      data
    );
  }

  // Billing Settings
  async getBillingSettings(): Promise<BillingSettings> {
    return apiClient.get<BillingSettings>(`${this.basePath}/billing`);
  }

  async updateBillingSettings(
    data: Partial<BillingSettings>
  ): Promise<BillingSettings> {
    return apiClient.put<BillingSettings>(`${this.basePath}/billing`, data);
  }

  // Backup Settings
  async getBackupSettings(): Promise<BackupSettings> {
    return apiClient.get<BackupSettings>(`${this.basePath}/backup`);
  }

  async createBackup(): Promise<{ message: string; backupId: string }> {
    return apiClient.post<{ message: string; backupId: string }>(
      `${this.basePath}/backup/create`
    );
  }

  // System Logs
  async getSystemLogs(
    filters: { page?: number; limit?: number; level?: string } = {}
  ): Promise<SystemLog[]> {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const url = queryString
      ? `${this.basePath}/logs?${queryString}`
      : `${this.basePath}/logs`;

    return apiClient.get<SystemLog[]>(url);
  }

  // Maintenance Mode
  async toggleMaintenanceMode(
    enabled: boolean
  ): Promise<{ message: string; maintenanceMode: boolean }> {
    return apiClient.post<{ message: string; maintenanceMode: boolean }>(
      `${this.basePath}/maintenance`,
      { enabled }
    );
  }
}

// Export singleton instance
export const settingsService = new SettingsService();

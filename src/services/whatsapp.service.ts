import { apiClient } from "@/lib/api-client";
import {
  WhatsAppGroup,
  CreateWhatsAppGroupRequest,
  UpdateWhatsAppGroupRequest,
  SendWhatsAppMessageRequest,
  SendWhatsAppMessageResponse,
} from "@/types/api";

/**
 * WhatsApp Service
 * Handles all WhatsApp-related API calls
 * Following Single Responsibility Principle
 */
export class WhatsAppService {
  private readonly basePath = "/admin/whatsapp";

  /**
   * Get all WhatsApp groups
   */
  async getGroups(): Promise<WhatsAppGroup[]> {
    return apiClient.get<WhatsAppGroup[]>(`${this.basePath}/groups`);
  }

  /**
   * Create new WhatsApp group
   */
  async createGroup(data: CreateWhatsAppGroupRequest): Promise<WhatsAppGroup> {
    return apiClient.post<WhatsAppGroup>(`${this.basePath}/groups`, data);
  }

  /**
   * Update existing WhatsApp group
   */
  async updateGroup(
    id: number,
    data: UpdateWhatsAppGroupRequest
  ): Promise<WhatsAppGroup> {
    return apiClient.put<WhatsAppGroup>(`${this.basePath}/groups/${id}`, data);
  }

  /**
   * Delete WhatsApp group
   */
  async deleteGroup(id: number): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(
      `${this.basePath}/groups/${id}`
    );
  }

  /**
   * Send WhatsApp message to group
   */
  async sendMessage(
    data: SendWhatsAppMessageRequest
  ): Promise<SendWhatsAppMessageResponse> {
    return apiClient.post<SendWhatsAppMessageResponse>(
      `${this.basePath}/send-message`,
      data
    );
  }

  /**
   * Get group message history
   */
  async getGroupMessages(
    groupId: number,
    filters: { page?: number; limit?: number } = {}
  ): Promise<any> {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const url = queryString
      ? `${this.basePath}/groups/${groupId}/messages?${queryString}`
      : `${this.basePath}/groups/${groupId}/messages`;

    return apiClient.get<any>(url);
  }

  /**
   * Get message delivery status
   */
  async getMessageStatus(messageId: string): Promise<any> {
    return apiClient.get<any>(`${this.basePath}/messages/${messageId}/status`);
  }
}

// Export singleton instance
export const whatsappService = new WhatsAppService();

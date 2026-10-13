import { apiClient } from "@/lib/api-client";
import {
  Campaign,
  CampaignFilters,
  CampaignListResponse,
  CampaignRecipientsResponse,
  CampaignTrigger,
  CreateCampaignRequest,
  UpdateCampaignTriggerRequest,
} from "@/types/api";

/**
 * Campaigns Service
 * Handles all push-notification-campaign API calls
 * Following Single Responsibility Principle
 */
export class CampaignsService {
  private readonly basePath = "/admin/campaigns";

  async getCampaigns(
    filters: CampaignFilters = {}
  ): Promise<CampaignListResponse> {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const url = queryString ? `${this.basePath}?${queryString}` : this.basePath;

    return apiClient.get<CampaignListResponse>(url);
  }

  async getCampaignById(id: number): Promise<Campaign> {
    return apiClient.get<Campaign>(`${this.basePath}/${id}`);
  }

  async createCampaign(data: CreateCampaignRequest): Promise<Campaign> {
    return apiClient.post<Campaign>(this.basePath, data);
  }

  async cancelCampaign(id: number): Promise<Campaign> {
    return apiClient.post<Campaign>(`${this.basePath}/${id}/cancel`);
  }

  async getCampaignRecipients(
    id: number,
    page = 1,
    limit = 50
  ): Promise<CampaignRecipientsResponse> {
    return apiClient.get<CampaignRecipientsResponse>(
      `${this.basePath}/${id}/recipients?page=${page}&limit=${limit}`
    );
  }

  async getTriggers(): Promise<CampaignTrigger[]> {
    return apiClient.get<CampaignTrigger[]>(`${this.basePath}/triggers/list`);
  }

  async updateTrigger(
    id: number,
    data: UpdateCampaignTriggerRequest
  ): Promise<CampaignTrigger> {
    return apiClient.put<CampaignTrigger>(
      `${this.basePath}/triggers/${id}`,
      data
    );
  }
}

export const campaignsService = new CampaignsService();

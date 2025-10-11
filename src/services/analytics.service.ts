import { apiClient } from "@/lib/api-client";
import { AnalyticsOverview, AnalyticsFilters } from "@/types/api";

/**
 * Analytics Service
 * Handles all analytics-related API calls
 * Following Single Responsibility Principle
 */
export class AnalyticsService {
  private readonly basePath = "/admin/analytics";

  /**
   * Get analytics overview
   */
  async getAnalyticsOverview(
    filters: AnalyticsFilters = {}
  ): Promise<AnalyticsOverview> {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const url = queryString
      ? `${this.basePath}/overview?${queryString}`
      : `${this.basePath}/overview`;

    return apiClient.get<AnalyticsOverview>(url);
  }

  /**
   * Get revenue trends
   */
  async getRevenueTrends(filters: AnalyticsFilters = {}): Promise<any> {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const url = queryString
      ? `${this.basePath}/revenue/trends?${queryString}`
      : `${this.basePath}/revenue/trends`;

    return apiClient.get<any>(url);
  }

  /**
   * Get order trends
   */
  async getOrderTrends(filters: AnalyticsFilters = {}): Promise<any> {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const url = queryString
      ? `${this.basePath}/orders/trends?${queryString}`
      : `${this.basePath}/orders/trends`;

    return apiClient.get<any>(url);
  }

  /**
   * Get agent performance analytics
   */
  async getAgentPerformance(filters: AnalyticsFilters = {}): Promise<any> {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const url = queryString
      ? `${this.basePath}/agents/performance?${queryString}`
      : `${this.basePath}/agents/performance`;

    return apiClient.get<any>(url);
  }

  /**
   * Get product performance analytics
   */
  async getProductPerformance(filters: AnalyticsFilters = {}): Promise<any> {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const url = queryString
      ? `${this.basePath}/products/performance?${queryString}`
      : `${this.basePath}/products/performance`;

    return apiClient.get<any>(url);
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();

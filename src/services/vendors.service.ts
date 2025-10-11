import { apiClient } from "@/lib/api-client";
import {
  VendorDetails,
  VendorFilters,
  VendorMetrics,
  PaginatedResponse,
  CreateVendorRequest,
  UpdateVendorRequest,
} from "@/types/api";

/**
 * Vendors Service
 * Handles all vendor-related API calls
 * Following Single Responsibility Principle
 */
export class VendorsService {
  private readonly basePath = "/admin/vendors";

  /**
   * Get all vendors with filtering and pagination
   */
  async getVendors(
    filters: VendorFilters = {}
  ): Promise<PaginatedResponse<VendorDetails>> {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const url = queryString ? `${this.basePath}?${queryString}` : this.basePath;

    return apiClient.get<PaginatedResponse<VendorDetails>>(url);
  }

  /**
   * Get vendor details by ID
   */
  async getVendorById(id: number): Promise<VendorDetails> {
    return apiClient.get<VendorDetails>(`${this.basePath}/${id}`);
  }

  /**
   * Get vendor metrics
   */
  async getVendorMetrics(): Promise<VendorMetrics> {
    return apiClient.get<VendorMetrics>(`${this.basePath}/metrics`);
  }

  /**
   * Create new vendor
   */
  async createVendor(data: CreateVendorRequest): Promise<VendorDetails> {
    return apiClient.post<VendorDetails>(this.basePath, data);
  }

  /**
   * Update existing vendor
   */
  async updateVendor(
    id: number,
    data: UpdateVendorRequest
  ): Promise<VendorDetails> {
    return apiClient.put<VendorDetails>(`${this.basePath}/${id}`, data);
  }

  /**
   * Delete vendor
   */
  async deleteVendor(id: number): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`${this.basePath}/${id}`);
  }

  /**
   * Get vendor's products
   */
  async getVendorProducts(id: number): Promise<any[]> {
    return apiClient.get<any[]>(`${this.basePath}/${id}/products`);
  }

  /**
   * Get vendor's orders
   */
  async getVendorOrders(id: number): Promise<any[]> {
    return apiClient.get<any[]>(`${this.basePath}/${id}/orders`);
  }

  /**
   * Approve vendor
   */
  async approveVendor(id: number): Promise<VendorDetails> {
    return apiClient.post<VendorDetails>(`${this.basePath}/${id}/approve`);
  }

  /**
   * Suspend vendor
   */
  async suspendVendor(id: number, reason: string): Promise<VendorDetails> {
    return apiClient.post<VendorDetails>(`${this.basePath}/${id}/suspend`, {
      reason,
    });
  }
}

// Export singleton instance
export const vendorsService = new VendorsService();

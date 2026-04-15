import { apiClient } from "@/lib/api-client";
import { AdminUsersResponse } from "@/types/api";

export type AdminUsersQuery = {
  page?: number;
  limit?: number;
  search?: string;
};

export class AdminUsersService {
  private readonly basePath = "/admin/users";

  async getUsers(params: AdminUsersQuery = {}): Promise<AdminUsersResponse> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, String(value));
      }
    });
    const qs = searchParams.toString();
    const url = qs ? `${this.basePath}?${qs}` : this.basePath;
    return apiClient.get<AdminUsersResponse>(url);
  }
}

export const adminUsersService = new AdminUsersService();

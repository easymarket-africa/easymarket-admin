import { apiClient } from "@/lib/api-client";
import {
  Coupon,
  CouponFilters,
  CouponRedemption,
  CreateCouponRequest,
  UpdateCouponRequest,
  TerminateCouponRequest,
} from "@/types/api";

export class CouponsService {
  private readonly basePath = "/promos";

  async getCoupons(filters: CouponFilters = {}): Promise<Coupon[]> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });
    const queryString = params.toString();
    const url = queryString ? `${this.basePath}?${queryString}` : this.basePath;
    return apiClient.get<Coupon[]>(url);
  }

  async getCouponById(id: number): Promise<Coupon> {
    return apiClient.get<Coupon>(`${this.basePath}/${id}`);
  }

  async createCoupon(data: CreateCouponRequest): Promise<Coupon> {
    return apiClient.post<Coupon>(this.basePath, data);
  }

  async updateCoupon(id: number, data: UpdateCouponRequest): Promise<Coupon> {
    return apiClient.put<Coupon>(`${this.basePath}/${id}`, data);
  }

  async deleteCoupon(id: number): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`${this.basePath}/${id}`);
  }

  async terminateCoupon(
    id: number,
    data: TerminateCouponRequest = {}
  ): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(
      `${this.basePath}/${id}/terminate`,
      data
    );
  }

  async getRedemptions(id: number): Promise<CouponRedemption[]> {
    return apiClient.get<CouponRedemption[]>(`${this.basePath}/${id}/redemptions`);
  }
}

export const couponsService = new CouponsService();

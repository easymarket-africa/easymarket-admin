import { apiClient } from "@/lib/api-client";
import {
  CreateReferralCodeRequest,
  ReferralCode,
  ReferralCodeFilters,
  ReferralCodesResponse,
  ReferralReward,
  ReferralRewardFilters,
  ReferralRewardsResponse,
  ReferralUsage,
  ReferralUsageFilters,
  ReferralUsagesResponse,
  UpdateReferralCodeRequest,
} from "@/types/api";

/**
 * Referrals Service
 * Handles all referral-related API calls
 */
export class ReferralsService {
  private readonly basePath = "/referrals";

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
  }

  private buildQueryParams(
    filters:
      | ReferralCodeFilters
      | ReferralUsageFilters
      | ReferralRewardFilters = {}
  ): string {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });

    return params.toString();
  }

  private normalizeCode(code: Partial<ReferralCode>): ReferralCode {
    return {
      id: Number(code.id || 0),
      code: String(code.code || ""),
      ownerId: Number(code.ownerId || 0),
      ownerName: code.ownerName,
      type: (code.type || "USER") as ReferralCode["type"],
      discountType: (code.discountType || "PERCENTAGE") as ReferralCode["discountType"],
      discountValue: Number(code.discountValue || 0),
      maxUsage:
        code.maxUsage === null || code.maxUsage === undefined
          ? null
          : Number(code.maxUsage),
      usageCount: Number(code.usageCount || 0),
      isActive: Boolean(code.isActive),
      expiresAt: code.expiresAt || null,
      createdAt: String(code.createdAt || new Date().toISOString()),
    };
  }

  private normalizeUsage(usage: Partial<ReferralUsage>): ReferralUsage {
    return {
      id: Number(usage.id || 0),
      referralCodeId: Number(usage.referralCodeId || 0),
      referralCode: usage.referralCode,
      usedByUserId: Number(usage.usedByUserId || 0),
      usedByUserName: usage.usedByUserName,
      orderId: Number(usage.orderId || 0),
      discountApplied: Number(usage.discountApplied || 0),
      rewardGrantedToReferrer: Number(usage.rewardGrantedToReferrer || 0),
      createdAt: String(usage.createdAt || new Date().toISOString()),
    };
  }

  private normalizeReward(reward: Partial<ReferralReward>): ReferralReward {
    return {
      id: Number(reward.id || 0),
      userId: Number(reward.userId || 0),
      userName: reward.userName,
      totalEarned: Number(reward.totalEarned || 0),
      totalRedeemed: Number(reward.totalRedeemed || 0),
      balance: Number(reward.balance || 0),
      lastUpdated: reward.lastUpdated,
    };
  }

  async getReferralCodes(
    filters: ReferralCodeFilters = {}
  ): Promise<ReferralCodesResponse> {
    const queryString = this.buildQueryParams(filters);
    const url = queryString ? `${this.basePath}?${queryString}` : this.basePath;

    const response = await apiClient.get<unknown>(url);
    const responseObject = this.isRecord(response) ? response : {};
    const rawCodes =
      (Array.isArray(responseObject.data) ? responseObject.data : undefined) ||
      (Array.isArray(responseObject.codes) ? responseObject.codes : []) ||
      [];

    return {
      ...responseObject,
      data: (Array.isArray(rawCodes) ? rawCodes : []).map((code) =>
        this.normalizeCode(code)
      ),
      total: Number(responseObject.total || 0),
      page: Number(responseObject.page || filters.page || 1),
      limit: Number(responseObject.limit || filters.limit || 10),
      totalPages: Number(
        responseObject.totalPages ||
          Math.ceil(
            Number(responseObject.total || 0) /
              Number(responseObject.limit || filters.limit || 10)
          )
      ),
    };
  }

  async createReferralCode(
    data: CreateReferralCodeRequest
  ): Promise<ReferralCode> {
    const response = await apiClient.post<Partial<ReferralCode>>(this.basePath, data);
    return this.normalizeCode(response);
  }

  async updateReferralCode(
    id: number,
    data: UpdateReferralCodeRequest
  ): Promise<ReferralCode> {
    const response = await apiClient.patch<Partial<ReferralCode>>(
      `${this.basePath}/${id}`,
      data
    );
    return this.normalizeCode(response);
  }

  async getReferralUsages(
    filters: ReferralUsageFilters = {}
  ): Promise<ReferralUsagesResponse> {
    const queryString = this.buildQueryParams(filters);
    const url = queryString
      ? `${this.basePath}/usages?${queryString}`
      : `${this.basePath}/usages`;

    const response = await apiClient.get<unknown>(url);
    const responseObject = this.isRecord(response) ? response : {};
    const rawUsages =
      (Array.isArray(responseObject.data) ? responseObject.data : undefined) ||
      (Array.isArray(responseObject.usages) ? responseObject.usages : []) ||
      [];

    return {
      ...responseObject,
      data: (Array.isArray(rawUsages) ? rawUsages : []).map((usage) =>
        this.normalizeUsage(usage)
      ),
      total: Number(responseObject.total || 0),
      page: Number(responseObject.page || filters.page || 1),
      limit: Number(responseObject.limit || filters.limit || 10),
      totalPages: Number(
        responseObject.totalPages ||
          Math.ceil(
            Number(responseObject.total || 0) /
              Number(responseObject.limit || filters.limit || 10)
          )
      ),
    };
  }

  async getReferralRewards(
    filters: ReferralRewardFilters = {}
  ): Promise<ReferralRewardsResponse> {
    const queryString = this.buildQueryParams(filters);
    const url = queryString
      ? `${this.basePath}/rewards?${queryString}`
      : `${this.basePath}/rewards`;

    const response = await apiClient.get<unknown>(url);
    const responseObject = this.isRecord(response) ? response : {};
    const rawRewards =
      (Array.isArray(responseObject.data) ? responseObject.data : undefined) ||
      (Array.isArray(responseObject.rewards) ? responseObject.rewards : []) ||
      [];

    return {
      ...responseObject,
      data: (Array.isArray(rawRewards) ? rawRewards : []).map((reward) =>
        this.normalizeReward(reward)
      ),
      total: Number(responseObject.total || 0),
      page: Number(responseObject.page || filters.page || 1),
      limit: Number(responseObject.limit || filters.limit || 10),
      totalPages: Number(
        responseObject.totalPages ||
          Math.ceil(
            Number(responseObject.total || 0) /
              Number(responseObject.limit || filters.limit || 10)
          )
      ),
    };
  }
}

export const referralsService = new ReferralsService();

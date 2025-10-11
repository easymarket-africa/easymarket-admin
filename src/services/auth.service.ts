import { apiClient } from "@/lib/api-client";
import { LoginRequest, LoginResponse } from "@/types/api";

/**
 * Authentication Service
 * Handles all authentication-related API calls
 * Following Single Responsibility Principle
 */
export class AuthService {
  private readonly basePath = "/admin/auth";

  /**
   * Login user with email and password
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>(`${this.basePath}/login`, credentials);
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    return apiClient.post<void>(`${this.basePath}/logout`);
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>(`${this.basePath}/refresh`);
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<LoginResponse["user"]> {
    return apiClient.get<LoginResponse["user"]>(`${this.basePath}/me`);
  }

  /**
   * Change user password
   */
  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<void> {
    return apiClient.put<void>(`${this.basePath}/change-password`, data);
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    return apiClient.post<void>(`${this.basePath}/forgot-password`, { email });
  }

  /**
   * Reset password with token
   */
  async resetPassword(data: {
    token: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<void> {
    return apiClient.post<void>(`${this.basePath}/reset-password`, data);
  }
}

// Export singleton instance
export const authService = new AuthService();

import { apiClient } from "@/lib/api-client";
import {
  LoginRequest,
  LoginResponse,
  RefreshTokenResponse,
  SessionResponse,
  ChangePasswordRequest,
  UpdateProfileRequest,
  UpdateProfileResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  VerifyEmailRequest,
  VerifyEmailResponse,
  ResendVerificationRequest,
  ResendVerificationResponse,
  Admin,
} from "@/types/api";

/**
 * Authentication Service
 * Handles all admin authentication-related API calls
 * Following Single Responsibility Principle
 */
export class AuthService {
  private readonly basePath = "/admin/auth";

  /**
   * Admin login with email and password
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>(`${this.basePath}/login`, credentials);
  }

  /**
   * Admin logout - invalidate tokens
   */
  async logout(): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(`${this.basePath}/logout`);
  }

  /**
   * Refresh admin access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    // Backend expects refreshToken as a direct field, not in an object
    return apiClient.post<RefreshTokenResponse>(`${this.basePath}/refresh`, {
      refreshToken,
    });
  }

  /**
   * Get current admin session information
   */
  async getSession(): Promise<SessionResponse> {
    return apiClient.get<SessionResponse>(`${this.basePath}/session`);
  }

  /**
   * Get current admin profile (alias for getSession for backward compatibility)
   */
  async getCurrentUser(): Promise<Admin> {
    const session = await this.getSession();
    return session.admin;
  }

  /**
   * Change admin password
   */
  async changePassword(
    data: ChangePasswordRequest
  ): Promise<{ message: string }> {
    return apiClient.put<{ message: string }>(
      `${this.basePath}/change-password`,
      data
    );
  }

  /**
   * Update admin profile information
   */
  async updateProfile(
    data: UpdateProfileRequest
  ): Promise<UpdateProfileResponse> {
    return apiClient.put<UpdateProfileResponse>(
      `${this.basePath}/profile`,
      data
    );
  }

  /**
   * Request password reset - send reset code to email
   */
  async requestPasswordReset(
    data: ForgotPasswordRequest
  ): Promise<ForgotPasswordResponse> {
    return apiClient.post<ForgotPasswordResponse>(
      "/auth/forgot-password",
      data
    );
  }

  /**
   * Reset password with code received via email
   */
  async resetPassword(
    data: ResetPasswordRequest
  ): Promise<ResetPasswordResponse> {
    return apiClient.post<ResetPasswordResponse>("/auth/reset-password", data);
  }

  /**
   * Verify email with code received via email
   */
  async verifyEmail(data: VerifyEmailRequest): Promise<VerifyEmailResponse> {
    return apiClient.post<VerifyEmailResponse>("/auth/verify-email", data);
  }

  /**
   * Resend verification email
   */
  async resendVerification(
    data: ResendVerificationRequest
  ): Promise<ResendVerificationResponse> {
    return apiClient.post<ResendVerificationResponse>(
      "/auth/resend-verification",
      data
    );
  }
}

// Export singleton instance
export const authService = new AuthService();

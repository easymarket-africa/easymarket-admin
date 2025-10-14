"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import { queryKeys } from "@/lib/query-client";
import { tokenManager } from "@/lib/api-client";
import {
  LoginRequest,
  LoginResponse,
  Admin,
  ChangePasswordRequest,
  UpdateProfileRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
  ResendVerificationRequest,
} from "@/types/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

/**
 * Authentication Hooks
 * Provides React Query hooks for authentication operations
 * Following Single Responsibility Principle
 */

/**
 * Hook to get current admin user
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.auth.user,
    queryFn: () => authService.getCurrentUser(),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: tokenManager.isAuthenticated(),
  });
}

/**
 * Hook to get current admin session
 */
export function useCurrentSession() {
  return useQuery({
    queryKey: queryKeys.auth.session,
    queryFn: () => authService.getSession(),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: tokenManager.isAuthenticated(),
  });
}

/**
 * Hook for admin login mutation
 */
export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (credentials: LoginRequest) => authService.login(credentials),
    onSuccess: (data: LoginResponse) => {
      // Store tokens in localStorage
      tokenManager.setTokens(data.accessToken, data.refreshToken);

      // Store admin data
      localStorage.setItem("admin_data", JSON.stringify(data.admin));

      // Update query cache
      queryClient.setQueryData(queryKeys.auth.user, data.admin);

      // Show success message
      toast.success("Login successful!");

      // Redirect to dashboard
      router.push("/dashboard");
    },
    onError: (
      error: Error & { requiresVerification?: boolean },
      variables: LoginRequest
    ) => {
      // Debug logging
      console.log("Login error:", error);
      console.log("requiresVerification:", error.requiresVerification);

      // Check if email verification is required
      if (error.requiresVerification === true) {
        // Store email for verification
        localStorage.setItem("pending_verification_email", variables.email);

        // Show info message
        toast.info("Please check your email for verification code");

        // Redirect to email verification page
        router.push("/verify-email");
      } else {
        toast.error(error.message || "Login failed");
      }
    },
  });
}

/**
 * Hook for admin logout mutation
 */
export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      // Clear tokens and admin data from localStorage
      tokenManager.clearTokens();

      // Clear all query cache
      queryClient.clear();

      // Show success message
      toast.success("Logged out successfully");

      // Redirect to login
      router.push("/login");
    },
    onError: (error: Error) => {
      // Even if logout fails on server, clear local data
      tokenManager.clearTokens();
      queryClient.clear();
      router.push("/login");
      toast.error(error.message || "Logout failed");
    },
  });
}

/**
 * Hook for admin password change mutation
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) =>
      authService.changePassword(data),
    onSuccess: () => {
      toast.success("Password changed successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to change password");
    },
  });
}

/**
 * Hook for admin profile update mutation
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => authService.updateProfile(data),
    onSuccess: (response) => {
      // Update admin data in cache
      queryClient.setQueryData(queryKeys.auth.user, response.admin);

      // Update admin data in localStorage
      localStorage.setItem("admin_data", JSON.stringify(response.admin));

      toast.success("Profile updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });
}

/**
 * Hook for password reset request mutation
 */
export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: (data: ForgotPasswordRequest) =>
      authService.requestPasswordReset(data),
    onSuccess: () => {
      toast.success("Password reset code sent to your email");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send reset code");
    },
  });
}

/**
 * Hook for password reset mutation
 */
export function useResetPassword() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: ResetPasswordRequest) => authService.resetPassword(data),
    onSuccess: () => {
      toast.success("Password reset successfully");
      router.push("/login");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to reset password");
    },
  });
}

/**
 * Hook for token refresh mutation
 */
export function useRefreshToken() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (refreshToken: string) =>
      authService.refreshToken(refreshToken),
    onSuccess: (data) => {
      // Update tokens in localStorage
      tokenManager.setTokens(data.accessToken, data.refreshToken);
    },
    onError: () => {
      // If refresh fails, logout user
      tokenManager.clearTokens();
      queryClient.clear();
      window.location.href = "/login";
    },
  });
}

/**
 * Hook to check if user is authenticated
 */
export function useIsAuthenticated() {
  return tokenManager.isAuthenticated();
}

/**
 * Hook to get stored admin data
 */
export function useStoredAdminData(): Admin | null {
  if (typeof window === "undefined") return null;

  try {
    const adminData = localStorage.getItem("admin_data");
    return adminData ? JSON.parse(adminData) : null;
  } catch {
    return null;
  }
}

/**
 * Hook for email verification mutation
 */
export function useVerifyEmail() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: VerifyEmailRequest) => authService.verifyEmail(data),
    onSuccess: (data) => {
      // Store tokens in localStorage
      tokenManager.setTokens(data.accessToken, data.refreshToken);

      // Store admin data
      localStorage.setItem("admin_data", JSON.stringify(data.admin));

      // Clear pending verification email
      localStorage.removeItem("pending_verification_email");

      // Update query cache
      queryClient.setQueryData(queryKeys.auth.user, data.admin);

      // Show success message
      toast.success("Email verified successfully!");

      // Redirect to dashboard
      router.push("/dashboard");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Email verification failed");
    },
  });
}

/**
 * Hook for resending verification email
 */
export function useResendVerification() {
  return useMutation({
    mutationFn: (data: ResendVerificationRequest) =>
      authService.resendVerification(data),
    onSuccess: () => {
      toast.success("Verification email sent!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send verification email");
    },
  });
}

/**
 * Hook to get pending verification email
 */
export function usePendingVerificationEmail(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("pending_verification_email");
}

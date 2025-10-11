"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import { queryKeys } from "@/lib/query-client";
import { LoginRequest, LoginResponse } from "@/types/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

/**
 * Authentication Hooks
 * Provides React Query hooks for authentication operations
 * Following Single Responsibility Principle
 */

/**
 * Hook to get current user
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.auth.user,
    queryFn: authService.getCurrentUser,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for login mutation
 */
export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (credentials: LoginRequest) => authService.login(credentials),
    onSuccess: (data: LoginResponse) => {
      // Store token in localStorage
      localStorage.setItem("auth_token", data.token);

      // Update query cache
      queryClient.setQueryData(queryKeys.auth.user, data.user);

      // Show success message
      toast.success("Login successful!");

      // Redirect to dashboard
      router.push("/dashboard");
    },
    onError: (error: any) => {
      toast.error(error.message || "Login failed");
    },
  });
}

/**
 * Hook for logout mutation
 */
export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      // Clear token from localStorage
      localStorage.removeItem("auth_token");

      // Clear all query cache
      queryClient.clear();

      // Show success message
      toast.success("Logged out successfully");

      // Redirect to login
      router.push("/login");
    },
    onError: (error: any) => {
      // Even if logout fails on server, clear local data
      localStorage.removeItem("auth_token");
      queryClient.clear();
      router.push("/login");
      toast.error(error.message || "Logout failed");
    },
  });
}

/**
 * Hook for password change mutation
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: (data: {
      currentPassword: string;
      newPassword: string;
      confirmPassword: string;
    }) => authService.changePassword(data),
    onSuccess: () => {
      toast.success("Password changed successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to change password");
    },
  });
}

/**
 * Hook for password reset request mutation
 */
export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: (email: string) => authService.requestPasswordReset(email),
    onSuccess: () => {
      toast.success("Password reset email sent");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to send reset email");
    },
  });
}

/**
 * Hook for password reset mutation
 */
export function useResetPassword() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: {
      token: string;
      newPassword: string;
      confirmPassword: string;
    }) => authService.resetPassword(data),
    onSuccess: () => {
      toast.success("Password reset successfully");
      router.push("/login");
    },
    onError: (error: any) => {
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
    mutationFn: authService.refreshToken,
    onSuccess: (data: LoginResponse) => {
      // Update token in localStorage
      localStorage.setItem("auth_token", data.token);

      // Update user data in cache
      queryClient.setQueryData(queryKeys.auth.user, data.user);
    },
    onError: () => {
      // If refresh fails, logout user
      localStorage.removeItem("auth_token");
      queryClient.clear();
      window.location.href = "/login";
    },
  });
}

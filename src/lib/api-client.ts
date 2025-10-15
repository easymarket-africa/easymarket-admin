import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { ApiError } from "@/types/api";

// SSR-safe safeLocalStorage utilities
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(key);
  },
  setItem: (key: string, value: string): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem(key, value);
  },
  removeItem: (key: string): void => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(key);
  },
  clear: (): void => {
    if (typeof window === "undefined") return;
    localStorage.clear();
  },
};

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const API_TIMEOUT = 30000; // 30 seconds

// Create axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = safeLocalStorage.getItem("access_token");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    const apiError: ApiError = {
      message:
        error.response?.data?.message ||
        error.message ||
        "An unexpected error occurred",
      code: error.response?.data?.code || error.code,
      details: error.response?.data?.details,
      requiresVerification: error.response?.data?.requiresVerification,
    };

    // Handle specific HTTP status codes
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest._retryCount < 2
    ) {
      originalRequest._retry = true;
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;

      const refreshToken = safeLocalStorage.getItem("refresh_token");

      if (refreshToken) {
        try {
          // Import authService dynamically to avoid circular dependency
          const { authService } = await import("@/services/auth.service");
          const response = await authService.refreshToken(refreshToken);

          // Update tokens in safeLocalStorage
          safeLocalStorage.setItem("access_token", response.accessToken);
          safeLocalStorage.setItem("refresh_token", response.refreshToken);

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${response.accessToken}`;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
          // Refresh failed, clear tokens and redirect to login
          safeLocalStorage.removeItem("access_token");
          safeLocalStorage.removeItem("refresh_token");
          safeLocalStorage.removeItem("admin_data");

          // Only redirect if we're not already on the login page
          if (window.location.pathname !== "/login") {
            window.location.href = "/login";
          }
        }
      } else {
        // No refresh token, clear all auth data and redirect
        safeLocalStorage.removeItem("access_token");
        safeLocalStorage.removeItem("refresh_token");
        safeLocalStorage.removeItem("admin_data");

        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(apiError);
  }
);

// Generic API methods
export class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axiosInstance;
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async patch<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  // File upload method
  async upload<T>(
    url: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<T> {
    const formData = new FormData();
    formData.append("file", file);

    const config: AxiosRequestConfig = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(progress);
        }
      },
    };

    const response = await this.client.post<T>(url, formData, config);
    return response.data;
  }
}

// Token management utilities
export const tokenManager = {
  setTokens: (accessToken: string, refreshToken: string) => {
    safeLocalStorage.setItem("access_token", accessToken);
    safeLocalStorage.setItem("refresh_token", refreshToken);
  },

  getAccessToken: () => safeLocalStorage.getItem("access_token"),
  getRefreshToken: () => safeLocalStorage.getItem("refresh_token"),

  clearTokens: () => {
    safeLocalStorage.removeItem("access_token");
    safeLocalStorage.removeItem("refresh_token");
    safeLocalStorage.removeItem("admin_data");
  },

  isAuthenticated: () => {
    if (typeof window === "undefined") return false;
    const accessToken = safeLocalStorage.getItem("access_token");
    const refreshToken = safeLocalStorage.getItem("refresh_token");
    return !!(accessToken && refreshToken);
  },
};

// Export singleton instance
export const apiClient = new ApiClient();

// Export the axios instance for direct use if needed
export { axiosInstance };

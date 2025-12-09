import { apiClient } from "@/lib/api-client";
import {
  Product,
  ProductFilters,
  ProductMetrics,
  ProductsResponse,
  CreateProductRequest,
  UpdateProductRequest,
  BulkUploadResponse,
  ProductHistoryEntry,
} from "@/types/api";

/**
 * Products Service
 * Handles all product-related API calls
 * Following Single Responsibility Principle
 */
export class ProductsService {
  private readonly basePath = "/admin/products";

  /**
   * Get all products with filtering and pagination
   */
  async getProducts(filters: ProductFilters = {}): Promise<ProductsResponse> {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const url = queryString ? `${this.basePath}?${queryString}` : this.basePath;

    return apiClient.get<ProductsResponse>(url);
  }

  /**
   * Get product details by ID
   */
  async getProductById(id: number): Promise<Product> {
    return apiClient.get<Product>(`${this.basePath}/${id}`);
  }

  /**
   * Get product statistics overview
   */
  async getProductMetrics(): Promise<ProductMetrics> {
    return apiClient.get<ProductMetrics>(`${this.basePath}/metrics`);
  }

  /**
   * Create new product (supports FormData for image uploads)
   */
  async createProduct(data: CreateProductRequest | FormData): Promise<Product> {
    if (data instanceof FormData) {
      return apiClient.postForm<Product>(this.basePath, data);
    }
    return apiClient.post<Product>(this.basePath, data);
  }

  /**
   * Update existing product (supports FormData for image uploads)
   */
  async updateProduct(
    id: number,
    data: UpdateProductRequest | FormData
  ): Promise<Product> {
    const formData =
      data instanceof FormData ? data : this.convertToFormData(data);

    return apiClient.putForm<Product>(`${this.basePath}/${id}`, formData);
  }

  private convertToFormData(data: UpdateProductRequest): FormData {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((item) => formData.append(key, item.toString()));
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    return formData;
  }

  /**
   * Delete product
   */
  async deleteProduct(id: number): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`${this.basePath}/${id}`);
  }

  /**
   * Bulk upload products from Excel file
   */
  async bulkUploadProducts(file: File): Promise<BulkUploadResponse> {
    return apiClient.upload<BulkUploadResponse>(
      `${this.basePath}/bulk-upload`,
      file
    );
  }

  /**
   * Get product change history
   */
  async getProductHistory(id: number): Promise<ProductHistoryEntry[]> {
    return apiClient.get<ProductHistoryEntry[]>(
      `${this.basePath}/${id}/history`
    );
  }

  /**
   * Duplicate product
   */
  async duplicateProduct(id: number): Promise<Product> {
    return apiClient.post<Product>(`${this.basePath}/${id}/duplicate`);
  }

  /**
   * Update stock quantity
   */
  async updateStock(id: number, quantity: number): Promise<Product> {
    return apiClient.put<Product>(`${this.basePath}/${id}/stock`, { quantity });
  }

  /**
   * Get all product categories
   */
  async getCategories(): Promise<string[]> {
    const response = await apiClient.get<{
      categories: { name: string }[];
      total: number;
    }>("/admin/categories");
    return response.categories?.map((category) => category.name) || [];
  }
}

// Export singleton instance
export const productsService = new ProductsService();

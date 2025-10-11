import { apiClient } from "@/lib/api-client";
import {
  Product,
  ProductFilters,
  ProductMetrics,
  PaginatedResponse,
  CreateProductRequest,
  UpdateProductRequest,
  BulkUploadResponse,
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
  async getProducts(
    filters: ProductFilters = {}
  ): Promise<PaginatedResponse<Product>> {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const url = queryString ? `${this.basePath}?${queryString}` : this.basePath;

    return apiClient.get<PaginatedResponse<Product>>(url);
  }

  /**
   * Get product details by ID
   */
  async getProductById(id: number): Promise<Product> {
    return apiClient.get<Product>(`${this.basePath}/${id}`);
  }

  /**
   * Get product metrics
   */
  async getProductMetrics(): Promise<ProductMetrics> {
    return apiClient.get<ProductMetrics>(`${this.basePath}/metrics`);
  }

  /**
   * Create new product
   */
  async createProduct(data: CreateProductRequest): Promise<Product> {
    return apiClient.post<Product>(this.basePath, data);
  }

  /**
   * Update existing product
   */
  async updateProduct(
    id: number,
    data: UpdateProductRequest
  ): Promise<Product> {
    return apiClient.put<Product>(`${this.basePath}/${id}`, data);
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
  async getProductHistory(id: number): Promise<any[]> {
    return apiClient.get<any[]>(`${this.basePath}/${id}/history`);
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
    return apiClient.get<string[]>(`${this.basePath}/categories`);
  }
}

// Export singleton instance
export const productsService = new ProductsService();

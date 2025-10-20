import { apiClient } from "@/lib/api-client";
import {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "@/types/api";

/**
 * Categories Service
 * Handles all category-related API calls
 */
export class CategoriesService {
  private readonly basePath = "/admin/categories";

  /**
   * Get all categories
   */
  async getCategories(): Promise<{ categories: Category[]; total: number }> {
    return apiClient.get<{ categories: Category[]; total: number }>(
      this.basePath
    );
  }

  /**
   * Create new category
   */
  async createCategory(data: CreateCategoryRequest): Promise<Category> {
    return apiClient.post<Category>(this.basePath, data);
  }

  /**
   * Update existing category
   */
  async updateCategory(
    id: number,
    data: UpdateCategoryRequest
  ): Promise<Category> {
    return apiClient.put<Category>(`${this.basePath}/${id}`, data);
  }

  /**
   * Delete category
   */
  async deleteCategory(id: number): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`${this.basePath}/${id}`);
  }
}

// Export singleton instance
export const categoriesService = new CategoriesService();


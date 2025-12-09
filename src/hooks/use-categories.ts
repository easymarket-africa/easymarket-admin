import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoriesService } from "@/services/categories.service";
import { CreateCategoryRequest, UpdateCategoryRequest } from "@/types/api";

// Query keys for categories
export const queryKeys = {
  categories: {
    all: ["categories"] as const,
    lists: () => [...queryKeys.categories.all, "list"] as const,
    list: (filters: Record<string, unknown>) =>
      [...queryKeys.categories.lists(), { filters }] as const,
    details: () => [...queryKeys.categories.all, "detail"] as const,
    detail: (id: number) => [...queryKeys.categories.details(), id] as const,
  },
};

/**
 * Hook to get all categories
 */
export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories.lists(),
    queryFn: () => categoriesService.getCategories(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to create a new category
 */
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoryRequest) =>
      categoriesService.createCategory(data),
    onSuccess: () => {
      // Invalidate and refetch categories list
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.lists() });
    },
  });
}

/**
 * Hook to update a category
 */
export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCategoryRequest }) =>
      categoriesService.updateCategory(id, data),
    onSuccess: (_, variables) => {
      // Invalidate and refetch categories list
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.lists() });
      // Invalidate specific category detail if it exists
      queryClient.invalidateQueries({
        queryKey: queryKeys.categories.detail(variables.id),
      });
    },
  });
}

/**
 * Hook to delete a category
 */
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => categoriesService.deleteCategory(id),
    onSuccess: (_, id) => {
      // Invalidate and refetch categories list
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.lists() });
      // Remove specific category detail from cache
      queryClient.removeQueries({ queryKey: queryKeys.categories.detail(id) });
    },
  });
}

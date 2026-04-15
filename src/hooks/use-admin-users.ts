"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-client";
import {
  adminUsersService,
  AdminUsersQuery,
} from "@/services/admin-users.service";

export function useAdminUsers(
  params: AdminUsersQuery,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: queryKeys.adminUsers.list(params as Record<string, unknown>),
    queryFn: () => adminUsersService.getUsers(params),
    staleTime: 2 * 60 * 1000,
    enabled: options?.enabled ?? true,
  });
}

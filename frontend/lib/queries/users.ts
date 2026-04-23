import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/lib/axiosInstance';
import { API_PATHS } from '@/lib/apiPaths';

// Query Keys
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters?: any) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

// Types
export type UserRole = 'ADMIN' | 'DONOR' | 'STAFF';

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  createdAt: string;
}

// Fetch all users
export function useUsers(filters?: { role?: UserRole; search?: string }) {
  return useQuery({
    queryKey: userKeys.list(filters),
    queryFn: async () => {
      const response = await axiosInstance.get<{ status: string; data: User[] }>(
        API_PATHS.USER.GET_ALL,
        { params: filters }
      );
      return response.data.data;
    },
  });
}

// Fetch single user
export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: async () => {
      const response = await axiosInstance.get<{ status: string; data: User }>(
        API_PATHS.USER.GET_BY_ID(id)
      );
      return response.data.data;
    },
    enabled: !!id,
  });
}

// Update user
export function useUpdateUser(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<User>) => {
      const response = await axiosInstance.put<{ status: string; data: User }>(
        API_PATHS.USER.UPDATE(id),
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
    },
  });
}

// Delete user
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosInstance.delete(API_PATHS.USER.DELETE(id));
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

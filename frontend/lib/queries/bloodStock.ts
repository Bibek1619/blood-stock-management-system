import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/lib/axiosInstance';
import { API_PATHS } from '@/lib/apiPaths';

// Types
export interface BloodPack {
  id: string;
  packCode: string;
  bloodGroup: string;
  donorId: string | null;
  collectionDate: string;
  expiryDate: string;
  status: 'AVAILABLE' | 'USED' | 'EXPIRED' | 'RESERVED';
  storageLocation: string | null;
  createdAt: string;
  updatedAt: string;
  donor?: {
    id: string;
    user: {
      name: string;
      phone: string;
    };
  } | null;
}

export interface BloodStockSummary {
  bloodGroup: string;
  available: number;
  used: number;
  expired: number;
  total: number;
}

// Query Keys
export const bloodStockKeys = {
  all: ['bloodStock'] as const,
  lists: () => [...bloodStockKeys.all, 'list'] as const,
  list: (filters?: Record<string, any>) => [...bloodStockKeys.lists(), filters] as const,
  summary: () => [...bloodStockKeys.all, 'summary'] as const,
  detail: (id: string) => [...bloodStockKeys.all, 'detail', id] as const,
};

/**
 * Hook to fetch all blood packs with optional filters
 */
export function useBloodPacks(filters?: { bloodGroup?: string; status?: string }) {
  return useQuery({
    queryKey: bloodStockKeys.list(filters),
    queryFn: async () => {
      const response = await axiosInstance.get<{ status: string; data: BloodPack[] }>(
        API_PATHS.BLOOD_PACK.GET_ALL,
        { params: filters }
      );
      return response.data.data;
    },
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Hook to fetch blood stock summary (grouped by blood group)
 */
export function useBloodStockSummary() {
  return useQuery({
    queryKey: bloodStockKeys.summary(),
    queryFn: async () => {
      const response = await axiosInstance.get<{ status: string; data: BloodStockSummary[] }>(
        API_PATHS.BLOOD_STOCK.GET_SUMMARY
      );
      return response.data.data;
    },
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Hook to fetch a single blood pack by ID
 */
export function useBloodPack(id: string) {
  return useQuery({
    queryKey: bloodStockKeys.detail(id),
    queryFn: async () => {
      const response = await axiosInstance.get<{ status: string; data: BloodPack }>(
        API_PATHS.BLOOD_PACK.GET_BY_ID(id)
      );
      return response.data.data;
    },
    enabled: !!id,
  });
}

/**
 * Hook to update blood pack status
 */
export function useUpdateBloodPackStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await axiosInstance.put<{ status: string; data: BloodPack }>(
        API_PATHS.BLOOD_PACK.UPDATE(id),
        { status }
      );
      return response.data.data;
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: bloodStockKeys.lists() });
      queryClient.invalidateQueries({ queryKey: bloodStockKeys.summary() });
    },
  });
}

/**
 * Hook to delete a blood pack
 */
export function useDeleteBloodPack() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosInstance.delete(
        API_PATHS.BLOOD_PACK.DELETE(id)
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bloodStockKeys.lists() });
      queryClient.invalidateQueries({ queryKey: bloodStockKeys.summary() });
    },
  });
}

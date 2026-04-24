import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/lib/axiosInstance';
import { API_PATHS } from '@/lib/apiPaths';

// Query Keys
export const bloodPackKeys = {
  all: ['bloodPacks'] as const,
  lists: () => [...bloodPackKeys.all, 'list'] as const,
  list: (filters?: any) => [...bloodPackKeys.lists(), filters] as const,
  details: () => [...bloodPackKeys.all, 'detail'] as const,
  detail: (id: string) => [...bloodPackKeys.details(), id] as const,
  byBloodGroup: (bloodGroup: string) => [...bloodPackKeys.all, 'bloodGroup', bloodGroup] as const,
};

// Types
export interface BloodPack {
  id: string;
  packCode: string;
  bloodGroup: string;
  donorId?: string;
  collectionDate: string;
  expiryDate: string;
  status: 'AVAILABLE' | 'USED' | 'EXPIRED' | 'RESERVED';
  storageLocation?: string;
  createdAt: string;
  updatedAt: string;
  donor?: {
    id: string;
    userId: string;
    bloodGroup: string;
    user: {
      id: string;
      name: string;
      email: string;
      phone: string;
    };
  };
}

interface CreateBloodPackData {
  packCode?: string;
  bloodGroup: string;
  donorId?: string;
  collectionDate: string;
  expiryDate: string;
  status?: 'AVAILABLE' | 'USED' | 'EXPIRED' | 'RESERVED';
  storageLocation?: string;
}

// Fetch all blood packs
export function useBloodPacks(filters?: any) {
  return useQuery({
    queryKey: bloodPackKeys.list(filters),
    queryFn: async () => {
      const response = await axiosInstance.get<{ status: string; data: BloodPack[] }>(
        API_PATHS.BLOOD_PACK.GET_ALL,
        { params: filters }
      );
      return response.data.data;
    },
  });
}

// Fetch blood packs by blood group
export function useBloodPacksByGroup(bloodGroup: string, status?: string) {
  return useQuery({
    queryKey: bloodPackKeys.byBloodGroup(bloodGroup),
    queryFn: async () => {
      const response = await axiosInstance.get<{ status: string; data: BloodPack[] }>(
        API_PATHS.BLOOD_PACK.GET_ALL,
        { params: { bloodGroup, ...(status && { status }) } }
      );
      return response.data.data;
    },
    enabled: !!bloodGroup,
  });
}

// Fetch single blood pack
export function useBloodPack(id: string) {
  return useQuery({
    queryKey: bloodPackKeys.detail(id),
    queryFn: async () => {
      const response = await axiosInstance.get<{ status: string; data: BloodPack }>(
        API_PATHS.BLOOD_PACK.GET_BY_ID(id)
      );
      return response.data.data;
    },
    enabled: !!id,
  });
}

// Create blood pack
export function useCreateBloodPack() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateBloodPackData) => {
      const response = await axiosInstance.post<{ status: string; data: BloodPack }>(
        API_PATHS.BLOOD_PACK.CREATE,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bloodPackKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['bloodStock'] });
    },
  });
}

// Update blood pack
export function useUpdateBloodPack(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<CreateBloodPackData>) => {
      const response = await axiosInstance.put<{ status: string; data: BloodPack }>(
        API_PATHS.BLOOD_PACK.UPDATE(id),
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bloodPackKeys.lists() });
      queryClient.invalidateQueries({ queryKey: bloodPackKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: ['bloodStock'] });
    },
  });
}

// Update blood pack status
export function useUpdateBloodPackStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await axiosInstance.put<{ status: string; data: BloodPack }>(
        API_PATHS.BLOOD_PACK.UPDATE(id),
        { status }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bloodPackKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['bloodStock'] });
    },
  });
}

// Delete blood pack
export function useDeleteBloodPack() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosInstance.delete(API_PATHS.BLOOD_PACK.DELETE(id));
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bloodPackKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['bloodStock'] });
    },
  });
}
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/lib/axiosInstance';
import { API_PATHS } from '@/lib/apiPaths';

// Query Keys
export const donationKeys = {
  all: ['donations'] as const,
  lists: () => [...donationKeys.all, 'list'] as const,
  list: (filters?: any) => [...donationKeys.lists(), filters] as const,
  details: () => [...donationKeys.all, 'detail'] as const,
  detail: (id: string) => [...donationKeys.details(), id] as const,
  byUser: (userId: string) => [...donationKeys.all, 'user', userId] as const,
  byDonor: (donorId: string) => [...donationKeys.all, 'donor', donorId] as const,
};

// Types
interface Donation {
  id: string;
  userId: string;
  donorId?: string;
  bloodGroup: string;
  units: number;
  donationDate: string;
  location: string;
  donationType: 'PERSON' | 'ORGANIZATION';
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'REJECTED';
  notes?: string;
  contact?: string;
  storageLocation?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  bloodPacks?: {
    id: string;
    packCode: string;
    status: string;
  }[];
}

interface CreateDonationData {
  userId: string;
  bloodGroup: string;
  units?: number;
  location: string;
  donationType?: 'PERSON' | 'ORGANIZATION';
  status?: string;
  notes?: string;
  contact?: string;
}

// Fetch all donations with pagination
export function useDonations(filters?: any, page?: number, limit?: number) {
  const shouldPaginate = page !== undefined || limit !== undefined;
  const actualPage = page || 1;
  const actualLimit = limit || 20;

  return useQuery({
    queryKey: donationKeys.list({ ...filters, ...(shouldPaginate && { page: actualPage, limit: actualLimit }) }),
    queryFn: async () => {
      const params = shouldPaginate 
        ? { ...filters, page: actualPage, limit: actualLimit }
        : filters;
      
      const response = await axiosInstance.get<{ status: string; data: Donation[]; pagination?: any }>(
        API_PATHS.DONATION.GET_ALL,
        { params }
      );
      
      // If pagination is requested, return the full response
      if (shouldPaginate && response.data.pagination) {
        return {
          data: response.data.data,
          pagination: response.data.pagination,
        };
      }
      
      // Otherwise, return just the data for backward compatibility
      return response.data.data;
    },
  });
}

// Fetch donations by user ID
export function useDonationsByUser(userId: string) {
  return useQuery({
    queryKey: donationKeys.byUser(userId),
    queryFn: async () => {
      const response = await axiosInstance.get<{ status: string; data: Donation[] }>(
        API_PATHS.DONATION.GET_ALL,
        { params: { userId } }
      );
      return response.data.data;
    },
    enabled: !!userId,
  });
}

// Fetch donations by donor ID
export function useDonationsByDonor(donorId: string) {
  return useQuery({
    queryKey: donationKeys.byDonor(donorId),
    queryFn: async () => {
      const response = await axiosInstance.get<{ status: string; data: Donation[] }>(
        API_PATHS.DONATION.GET_ALL,
        { params: { donorId } }
      );
      return response.data.data;
    },
    enabled: !!donorId,
  });
}

// Fetch donations by event ID
export function useDonationsByEvent(eventId: string) {
  return useQuery({
    queryKey: [...donationKeys.all, 'event', eventId],
    queryFn: async () => {
      const response = await axiosInstance.get<{ status: string; data: Donation[] }>(
        API_PATHS.DONATION.GET_ALL,
        { params: { eventId } }
      );
      return response.data.data;
    },
    enabled: !!eventId,
  });
}

// Fetch single donation
export function useDonation(id: string) {
  return useQuery({
    queryKey: donationKeys.detail(id),
    queryFn: async () => {
      const response = await axiosInstance.get<{ status: string; data: Donation }>(
        API_PATHS.DONATION.GET_BY_ID(id)
      );
      return response.data.data;
    },
    enabled: !!id,
  });
}

// Create donation
export function useCreateDonation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateDonationData) => {
      const response = await axiosInstance.post<{ status: string; data: Donation }>(
        API_PATHS.DONATION.CREATE,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: donationKeys.lists() });
    },
  });
}

// Update donation
export function useUpdateDonation(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<CreateDonationData>) => {
      const response = await axiosInstance.put<{ status: string; data: Donation }>(
        API_PATHS.DONATION.UPDATE(id),
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: donationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: donationKeys.detail(id) });
    },
  });
}

// Delete donation
export function useDeleteDonation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosInstance.delete(
        API_PATHS.DONATION.DELETE(id)
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: donationKeys.lists() });
    },
  });
}

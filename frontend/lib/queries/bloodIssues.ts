import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/lib/axiosInstance';
import { API_PATHS } from '@/lib/apiPaths';

// Query Keys
export const bloodIssueKeys = {
  all: ['bloodIssues'] as const,
  lists: () => [...bloodIssueKeys.all, 'list'] as const,
  list: (filters?: any) => [...bloodIssueKeys.lists(), filters] as const,
  details: () => [...bloodIssueKeys.all, 'detail'] as const,
  detail: (id: string) => [...bloodIssueKeys.details(), id] as const,
};

// Types
export interface BloodIssue {
  id: string;
  issueCode: string;
  recipientName: string;
  recipientType: 'PERSON' | 'ORGANIZATION' | 'HOSPITAL';
  bloodGroup: string;
  unitsRequested: number;
  unitsIssued: number;
  contact: string;
  issueDate: string;
  issuedBy?: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  bloodPacksIssued?: {
    id: string;
    bloodPackId: string;
    bloodPack: {
      id: string;
      packCode: string;
      bloodGroup: string;
      collectionDate: string;
      expiryDate: string;
      status: string;
    };
  }[];
}

interface CreateBloodIssueData {
  issueCode?: string;
  recipientName: string;
  recipientType?: 'PERSON' | 'ORGANIZATION' | 'HOSPITAL';
  bloodGroup: string;
  unitsRequested: number;
  contact: string;
  issuedBy?: string;
  bloodPackIds: string[];
  notes?: string;
}

// Fetch all blood issues
export function useBloodIssues(filters?: any) {
  return useQuery({
    queryKey: bloodIssueKeys.list(filters),
    queryFn: async () => {
      const response = await axiosInstance.get<{ status: string; data: BloodIssue[] }>(
        API_PATHS.BLOOD_ISSUE.GET_ALL,
        { params: filters }
      );
      return response.data.data;
    },
  });
}

// Fetch single blood issue
export function useBloodIssue(id: string) {
  return useQuery({
    queryKey: bloodIssueKeys.detail(id),
    queryFn: async () => {
      const response = await axiosInstance.get<{ status: string; data: BloodIssue }>(
        API_PATHS.BLOOD_ISSUE.GET_BY_ID(id)
      );
      return response.data.data;
    },
    enabled: !!id,
  });
}

// Create blood issue
export function useCreateBloodIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateBloodIssueData) => {
      // Generate issue code if not provided
      const issueCode = data.issueCode || `ISS-${Date.now()}`;
      
      const response = await axiosInstance.post<{ status: string; data: BloodIssue }>(
        API_PATHS.BLOOD_ISSUE.CREATE,
        { ...data, issueCode }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bloodIssueKeys.lists() });
      // Also invalidate blood stock queries since issuing blood affects stock
      queryClient.invalidateQueries({ queryKey: ['bloodStock'] });
      queryClient.invalidateQueries({ queryKey: ['bloodPacks'] });
    },
  });
}

// Update blood issue
export function useUpdateBloodIssue(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<CreateBloodIssueData>) => {
      const response = await axiosInstance.put<{ status: string; data: BloodIssue }>(
        API_PATHS.BLOOD_ISSUE.UPDATE(id),
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bloodIssueKeys.lists() });
      queryClient.invalidateQueries({ queryKey: bloodIssueKeys.detail(id) });
    },
  });
}

// Delete blood issue
export function useDeleteBloodIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosInstance.delete(API_PATHS.BLOOD_ISSUE.DELETE(id));
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bloodIssueKeys.lists() });
    },
  });
}
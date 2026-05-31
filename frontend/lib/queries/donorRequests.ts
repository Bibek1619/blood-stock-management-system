import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

// Get auth token from localStorage
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Axios instance with auth
const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Types
export interface DonorRequest {
  id: string;
  userId: string;
  bloodGroup: string;
  donorType: string;
  location: string;
  city: string | null;
  address: string | null;
  dateOfBirth: string | null;
  latitude: number | null;
  longitude: number | null;
  lastDonationDate: string | null;
  totalDonations: number;
  isEligible: boolean;
  weight: number | null;
  medicalNotes: string | null;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  rejectionReason: string | null;
  verifiedAt: string | null;
  verifiedBy: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    createdAt: string;
    profilePicture?: string | null;
  };
}

// Get all pending donor requests
export const usePendingDonorRequests = () => {
  return useQuery({
    queryKey: ['donor-requests', 'pending'],
    queryFn: async () => {
      const { data } = await api.get('/api/donor-requests');
      return data.data as DonorRequest[];
    },
  });
};

// Get donor request by ID
export const useDonorRequest = (id: string) => {
  return useQuery({
    queryKey: ['donor-request', id],
    queryFn: async () => {
      const { data } = await api.get(`/api/donor-requests/${id}`);
      return data.data as DonorRequest;
    },
    enabled: !!id,
  });
};

// Approve donor request
export const useApproveDonorRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (donorId: string) => {
      const { data } = await api.post(`/api/donor-requests/${donorId}/approve`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donor-requests'] });
      queryClient.invalidateQueries({ queryKey: ['donor-request'] });
    },
  });
};

// Reject donor request
export const useRejectDonorRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ donorId, reason }: { donorId: string; reason: string }) => {
      const { data } = await api.post(`/api/donor-requests/${donorId}/reject`, { reason });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donor-requests'] });
      queryClient.invalidateQueries({ queryKey: ['donor-request'] });
    },
  });
};

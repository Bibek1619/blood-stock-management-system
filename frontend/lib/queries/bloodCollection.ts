import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/lib/axiosInstance';
import { API_PATHS } from '@/lib/apiPaths';

// Types
export interface BloodCollectionData {
  donorId?: string;
  donorName: string;
  donorPhone: string;
  donorEmail?: string;
  bloodGroup: string;
  location?: string;
  units: string;
  collectionDate: string;
  collectionLocation: string;
  storageLocation?: string;
  notes?: string;
}

export interface DonorSearchResult {
  id: string;
  userId: string;
  bloodGroup: string;
  location: string;
  totalDonations: number;
  lastDonationDate: string | null;
  isEligible: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    isVerified: boolean;
  };
}

// Query Keys
export const bloodCollectionKeys = {
  all: ['bloodCollection'] as const,
  searchDonors: (query: string) => [...bloodCollectionKeys.all, 'search', query] as const,
};

/**
 * Hook to search for donors
 */
export function useSearchDonors(query: string, enabled: boolean = false) {
  return useQuery({
    queryKey: bloodCollectionKeys.searchDonors(query),
    queryFn: async () => {
      const response = await axiosInstance.get<{ status: string; data: DonorSearchResult[] }>(
        API_PATHS.DONATION.SEARCH_DONORS,
        { params: { query } }
      );
      return response.data.data;
    },
    enabled: enabled && query.length >= 2, // Only search if query is at least 2 characters
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Hook to record blood collection
 */
export function useRecordBloodCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BloodCollectionData) => {
      const response = await axiosInstance.post<{
        status: string;
        message: string;
        data: any;
      }>(
        API_PATHS.DONATION.COLLECT,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['bloodStock'] });
      queryClient.invalidateQueries({ queryKey: ['donors'] });
      queryClient.invalidateQueries({ queryKey: ['donations'] });
    },
  });
}

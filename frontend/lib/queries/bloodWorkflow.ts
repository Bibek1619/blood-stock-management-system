import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/lib/axiosInstance';
import { API_PATHS } from '@/lib/apiPaths';

// ==================== Types ====================
export interface BloodCollection {
  id: string;
  bloodCode: string;
  donorId?: string;
  donorName: string;
  bloodGroup: string;
  quantityMl: number;
  collectionDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  remarks?: string;
  createdAt: string;
  updatedAt: string;
  donor?: any;
  bloodTest?: BloodTest;
  bloodStock?: BloodStock;
}

export interface BloodTest {
  id: string;
  bloodCollectionId: string;
  hiv: boolean;
  hepatitisB: boolean;
  hepatitisC: boolean;
  malaria: boolean;
  syphilis: boolean;
  testedBy?: string;
  testDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  description?: string;
  tester?: any;
}

export interface BloodStock {
  id: string;
  bloodCollectionId: string;
  bloodCode: string;
  bloodGroup: string;
  quantityMl: number;
  storedDate: string;
  expiryDate: string;
  status: 'AVAILABLE' | 'USED' | 'EXPIRED' | 'RESERVED';
  bloodCollection?: any;
}

export interface BloodIssue {
  id: string;
  issueCode: string;
  hospitalName: string;
  patientName: string;
  bloodGroup: string;
  quantityMl: number;
  issueDate: string;
  issuedBy?: string;
  remarks?: string;
  bloodStockItems?: any[];
}

// ==================== Query Keys ====================
export const bloodWorkflowKeys = {
  all: ['bloodWorkflow'] as const,
  collections: () => [...bloodWorkflowKeys.all, 'collections'] as const,
  collectionsPending: () => [...bloodWorkflowKeys.collections(), 'pending'] as const,
  collectionsApproved: () => [...bloodWorkflowKeys.collections(), 'approved'] as const,
  collectionsRejected: () => [...bloodWorkflowKeys.collections(), 'rejected'] as const,
  collection: (id: string) => [...bloodWorkflowKeys.collections(), id] as const,
  tests: () => [...bloodWorkflowKeys.all, 'tests'] as const,
  test: (collectionId: string) => [...bloodWorkflowKeys.tests(), collectionId] as const,
  stock: () => [...bloodWorkflowKeys.all, 'stock'] as const,
  stockSummary: () => [...bloodWorkflowKeys.stock(), 'summary'] as const,
  issues: () => [...bloodWorkflowKeys.all, 'issues'] as const,
  issue: (id: string) => [...bloodWorkflowKeys.issues(), id] as const,
};

// ==================== Blood Collection Hooks ====================

/**
 * Get all blood collections
 */
export function useBloodCollections(params?: any) {
  return useQuery({
    queryKey: [...bloodWorkflowKeys.collections(), params],
    queryFn: async () => {
      const response = await axiosInstance.get<{ status: string; data: BloodCollection[] }>(
        API_PATHS.BLOOD_WORKFLOW.GET_COLLECTIONS,
        { params }
      );
      return response.data.data;
    },
  });
}

/**
 * Get pending blood collections
 */
export function usePendingCollections() {
  return useQuery({
    queryKey: bloodWorkflowKeys.collectionsPending(),
    queryFn: async () => {
      const response = await axiosInstance.get<{ status: string; data: BloodCollection[] }>(
        API_PATHS.BLOOD_WORKFLOW.GET_PENDING_COLLECTIONS
      );
      return response.data.data;
    },
  });
}

/**
 * Get approved blood collections
 */
export function useApprovedCollections() {
  return useQuery({
    queryKey: bloodWorkflowKeys.collectionsApproved(),
    queryFn: async () => {
      const response = await axiosInstance.get<{ status: string; data: BloodCollection[] }>(
        API_PATHS.BLOOD_WORKFLOW.GET_APPROVED_COLLECTIONS
      );
      return response.data.data;
    },
  });
}

/**
 * Get rejected blood collections
 */
export function useRejectedCollections() {
  return useQuery({
    queryKey: bloodWorkflowKeys.collectionsRejected(),
    queryFn: async () => {
      const response = await axiosInstance.get<{ status: string; data: BloodCollection[] }>(
        API_PATHS.BLOOD_WORKFLOW.GET_REJECTED_COLLECTIONS
      );
      return response.data.data;
    },
  });
}

/**
 * Create blood collection
 */
export function useCreateBloodCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await axiosInstance.post(
        API_PATHS.BLOOD_WORKFLOW.CREATE_COLLECTION,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bloodWorkflowKeys.collections() });
    },
  });
}

/**
 * Update blood collection status
 */
export function useUpdateCollectionStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, remarks }: { id: string; status: string; remarks?: string }) => {
      const response = await axiosInstance.patch(
        API_PATHS.BLOOD_WORKFLOW.UPDATE_COLLECTION_STATUS(id),
        { status, remarks }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bloodWorkflowKeys.collections() });
    },
  });
}

// ==================== Blood Test Hooks ====================

/**
 * Get all blood tests
 */
export function useBloodTests(params?: any) {
  return useQuery({
    queryKey: [...bloodWorkflowKeys.tests(), params],
    queryFn: async () => {
      const response = await axiosInstance.get<{ status: string; data: BloodTest[] }>(
        API_PATHS.BLOOD_WORKFLOW.GET_ALL_TESTS,
        { params }
      );
      return response.data.data;
    },
  });
}

/**
 * Create or update blood test
 */
export function useCreateOrUpdateBloodTest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ collectionId, data }: { collectionId: string; data: any }) => {
      const response = await axiosInstance.post(
        API_PATHS.BLOOD_WORKFLOW.CREATE_OR_UPDATE_TEST(collectionId),
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bloodWorkflowKeys.tests() });
      queryClient.invalidateQueries({ queryKey: bloodWorkflowKeys.collections() });
    },
  });
}

// ==================== Blood Stock Hooks ====================

/**
 * Get blood stock
 */
export function useBloodStockWorkflow(params?: any) {
  return useQuery({
    queryKey: [...bloodWorkflowKeys.stock(), params],
    queryFn: async () => {
      const response = await axiosInstance.get<{ status: string; data: BloodStock[] }>(
        API_PATHS.BLOOD_WORKFLOW.GET_STOCK,
        { params }
      );
      return response.data.data;
    },
  });
}

/**
 * Get blood stock summary
 */
export function useBloodStockWorkflowSummary() {
  return useQuery({
    queryKey: bloodWorkflowKeys.stockSummary(),
    queryFn: async () => {
      const response = await axiosInstance.get<{ status: string; data: any[] }>(
        API_PATHS.BLOOD_WORKFLOW.GET_STOCK_SUMMARY
      );
      return response.data.data;
    },
  });
}

/**
 * Move approved blood to stock
 */
export function useMoveToStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bloodCollectionId: string) => {
      const response = await axiosInstance.post(
        API_PATHS.BLOOD_WORKFLOW.MOVE_TO_STOCK,
        { bloodCollectionId }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bloodWorkflowKeys.stock() });
      queryClient.invalidateQueries({ queryKey: bloodWorkflowKeys.collections() });
    },
  });
}

// ==================== Blood Issue Hooks ====================

/**
 * Get all blood issues
 */
export function useBloodIssuesWorkflow(params?: any) {
  return useQuery({
    queryKey: [...bloodWorkflowKeys.issues(), params],
    queryFn: async () => {
      const response = await axiosInstance.get<{ status: string; data: BloodIssue[] }>(
        API_PATHS.BLOOD_WORKFLOW.GET_ALL_ISSUES,
        { params }
      );
      return response.data.data;
    },
  });
}

/**
 * Issue blood from stock
 */
export function useIssueBlood() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await axiosInstance.post(
        API_PATHS.BLOOD_WORKFLOW.CREATE_ISSUE,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bloodWorkflowKeys.issues() });
      queryClient.invalidateQueries({ queryKey: bloodWorkflowKeys.stock() });
    },
  });
}

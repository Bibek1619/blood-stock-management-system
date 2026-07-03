/**
 * API Paths Configuration
 * Centralized API endpoint definitions for the Blood Bank Management System
 */

// Base URL from environment variable
export const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

/**
 * API Path Constants
 * Organized by feature domain
 */
export const API_PATHS = {
  /**
   * Authentication Endpoints
   */
  AUTH: {
    REGISTER: "/api/auth/register",
    LOGIN: "/api/auth/login",
    GET_PROFILE: "/api/auth/profile",
  },

  /**
   * Donor Management Endpoints
   */
  DONOR: {
    GET_ALL: "/api/donors",
    GET_BY_ID: (id: string) => `/api/donors/${id}`,
    CREATE: "/api/donors",
    UPDATE: (id: string) => `/api/donors/${id}`,
    DELETE: (id: string) => `/api/donors/${id}`,
  },

  /**
   * Donation Endpoints
   */
  DONATION: {
    GET_ALL: "/api/donations",
    GET_BY_ID: (id: string) => `/api/donations/${id}`,
    CREATE: "/api/donations",
    UPDATE: (id: string) => `/api/donations/${id}`,
    DELETE: (id: string) => `/api/donations/${id}`,
    COLLECT: "/api/donations/collect",
    BULK_COLLECT: "/api/donations/bulk-collect",
    SEARCH_DONORS: "/api/donations/search/donors",
    SEARCH_ORGANIZATIONS: "/api/donations/search/organizations",
  },

  /**
   * Blood Stock Endpoints
   */
  BLOOD_STOCK: {
    GET_SUMMARY: "/api/blood-stock/summary",
    GET_BY_GROUP: (bloodGroup: string) => `/api/blood-stock/${bloodGroup}`,
  },

  /**
   * Blood Pack Endpoints
   */
  BLOOD_PACK: {
    GET_ALL: "/api/blood-stock",
    GET_BY_ID: (id: string) => `/api/blood-stock/${id}`,
    CREATE: "/api/blood-stock",
    UPDATE: (id: string) => `/api/blood-stock/${id}`,
    DELETE: (id: string) => `/api/blood-stock/${id}`,
  },

  /**
   * Event Management Endpoints
   */
  EVENT: {
    GET_ALL: "/api/events",
    GET_BY_ID: (id: string) => `/api/events/${id}`,
    CREATE: "/api/events",
    UPDATE: (id: string) => `/api/events/${id}`,
    DELETE: (id: string) => `/api/events/${id}`,
    ADD_PARTICIPANT: (id: string) => `/api/events/${id}/participants`,
    ADD_VOLUNTEER: (id: string) => `/api/events/${id}/volunteers`,
  },

  /**
   * Certificate Endpoints
   */
  CERTIFICATE: {
    GET_ALL: "/api/certificates",
    GET_BY_ID: (id: string) => `/api/certificates/${id}`,
    CREATE: "/api/certificates",
    DELETE: (id: string) => `/api/certificates/${id}`,
  },

  /**
   * Blood Issue Endpoints
   */
  BLOOD_ISSUE: {
    GET_ALL: "/api/blood-issues",
    GET_BY_ID: (id: string) => `/api/blood-issues/${id}`,
    CREATE: "/api/blood-issues",
    UPDATE: (id: string) => `/api/blood-issues/${id}`,
    DELETE: (id: string) => `/api/blood-issues/${id}`,
  },

  /**
   * User Management Endpoints
   */
  USER: {
    GET_ALL: "/api/users",
    GET_BY_ID: (id: string) => `/api/users/${id}`,
    UPDATE: (id: string) => `/api/users/${id}`,
    DELETE: (id: string) => `/api/users/${id}`,
  },

  /**
   * Blood Workflow Endpoints
   */
  BLOOD_WORKFLOW: {
    // Blood Collection
    GET_COLLECTIONS: "/api/blood-workflow/collections",
    GET_PENDING_COLLECTIONS: "/api/blood-workflow/collections/pending",
    GET_APPROVED_COLLECTIONS: "/api/blood-workflow/collections/approved",
    GET_REJECTED_COLLECTIONS: "/api/blood-workflow/collections/rejected",
    GET_COLLECTION_BY_ID: (id: string) => `/api/blood-workflow/collections/${id}`,
    CREATE_COLLECTION: "/api/blood-workflow/collections",
    UPDATE_COLLECTION_STATUS: (id: string) => `/api/blood-workflow/collections/${id}/status`,
    DELETE_COLLECTION: (id: string) => `/api/blood-workflow/collections/${id}`,
    
    // Blood Test
    GET_ALL_TESTS: "/api/blood-workflow/tests",
    GET_TEST_BY_COLLECTION: (collectionId: string) => `/api/blood-workflow/tests/${collectionId}`,
    CREATE_OR_UPDATE_TEST: (collectionId: string) => `/api/blood-workflow/tests/${collectionId}`,
    
    // Blood Stock Workflow
    MOVE_TO_STOCK: "/api/blood-workflow/stock/move",
    GET_STOCK: "/api/blood-workflow/stock",
    GET_STOCK_SUMMARY: "/api/blood-workflow/stock/summary",
    
    // Blood Issue
    CREATE_ISSUE: "/api/blood-workflow/issues",
    GET_ALL_ISSUES: "/api/blood-workflow/issues",
    GET_ISSUE_BY_ID: (id: string) => `/api/blood-workflow/issues/${id}`,
  },
};

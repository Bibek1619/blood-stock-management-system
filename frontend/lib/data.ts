/**
 * Centralized Data Configuration
 * Types, constants, configurations, and utility functions for the Blood Bank Management System
 * 
 * Note: All mock data has been removed. Use API queries from lib/queries/ instead.
 */

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════

import { getCityCoordinates } from './geocoding';

export type BloodGroup = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
export { getCityCoordinates };
export type PackStatus = "Available" | "Used" | "Expired";
export type DonationType = "person" | "organization";
export type CertificateType = "donation" | "volunteer";

// Note: EventStatus type is defined in lib/queries/events.ts

export interface Donor {
  id: string;
  name: string;
  phone: string;
  email?: string;
  bloodGroup: BloodGroup;
  location: string;
  lastDonationDate: string;
  totalDonations: number;
  lat?: number;
  lng?: number;
}

export interface BloodPack {
  id: string;
  packCode: string;
  bloodGroup: BloodGroup;
  donorId: string;
  collectionDate: string;
  expiryDate: string;
  status: PackStatus;
}

export interface BloodEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  description?: string;
  status: string; // Use EventStatus from lib/queries/events.ts
  participants: string[];
  volunteers: string[];
}

export interface Certificate {
  id: string;
  type: CertificateType;
  recipientName: string;
  recipientId: string;
  eventTitle?: string;
  date: string;
  volunteerId?: string;
}

export interface Donation {
  id: string;
  donationType: DonationType;
  name: string;
  bloodGroup: BloodGroup;
  units: number;
  donationDate: string;
  location: string;
  contact?: string;
}

export interface BloodStock {
  bloodGroup: BloodGroup;
  units: number;
}

export interface StockByGroup {
  [key: string]: {
    available: number;
    used: number;
    expired: number;
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

export const BLOOD_GROUPS: BloodGroup[] = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export const LOW_STOCK_THRESHOLD = 5;
export const CRITICAL_STOCK_THRESHOLD = 3;

export const LOW_STOCK_GROUPS: BloodGroup[] = ["A-", "B-", "AB-", "O-"];

// Default map center (Pokhara, Nepal)
export const DEFAULT_MAP_CENTER = { lat: 28.2096, lng: 83.9856 };

// ═══════════════════════════════════════════════════════════════════════════
// STATUS CONFIGURATIONS
// ═══════════════════════════════════════════════════════════════════════════

export const PACK_STATUS_CONFIG = {
  Available: {
    dot: "#22c55e",
    bg: "rgba(21,128,61,0.08)",
    text: "#15803d",
    border: "rgba(21,128,61,0.25)",
  },
  Used: {
    dot: "#94a3b8",
    bg: "rgba(148,163,184,0.12)",
    text: "#64748b",
    border: "rgba(148,163,184,0.3)",
  },
  Expired: {
    dot: "#991B1B",
    bg: "rgba(127,29,29,0.07)",
    text: "#7F1D1D",
    border: "rgba(127,29,29,0.25)",
  },
};

// Note: Event status configuration moved to lib/eventStatusConfig.ts

// ═══════════════════════════════════════════════════════════════════════════
// MOCK DATA - REMOVED
// All mock data has been removed. Use API queries from lib/queries/ instead.
// ═══════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

export function getInitials(name: string | undefined | null): string {
  if (!name) return 'UN'; // Unknown
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getDonorTier(donations: number): {
  label: string;
  color: string;
  bg: string;
  border: string;
  styles?: string;
} {
  if (donations >= 7)
    return {
      label: "Platinum",
      color: "text-purple-700",
      bg: "bg-purple-50",
      border: "border-purple-200",
      styles: "text-purple-700 bg-purple-50 border-purple-200",
    };
  if (donations >= 5)
    return {
      label: "Gold",
      color: "text-amber-700",
      bg: "bg-amber-50",
      border: "border-amber-200",
      styles: "text-amber-700 bg-amber-50 border-amber-200",
    };
  if (donations >= 3)
    return {
      label: "Silver",
      color: "text-slate-700",
      bg: "bg-slate-50",
      border: "border-slate-200",
      styles: "text-slate-700 bg-slate-50 border-slate-200",
    };
  return {
    label: "Bronze",
    color: "text-amber-900",
    bg: "bg-amber-100",
    border: "border-amber-300",
    styles: "text-amber-900 bg-amber-100 border-amber-300",
  };
}

export function getStockByGroup(packs: BloodPack[]): StockByGroup {
  const map: StockByGroup = {};
  BLOOD_GROUPS.forEach((g) => {
    map[g] = { available: 0, used: 0, expired: 0 };
  });
  packs.forEach((p) => {
    if (!map[p.bloodGroup]) map[p.bloodGroup] = { available: 0, used: 0, expired: 0 };
    if (p.status === "Available") map[p.bloodGroup].available++;
    else if (p.status === "Used") map[p.bloodGroup].used++;
    else if (p.status === "Expired") map[p.bloodGroup].expired++;
  });
  return map;
}

export function getLowStockGroups(packs: BloodPack[]): BloodGroup[] {
  return BLOOD_GROUPS.filter((g) => {
    const avail = packs.filter((p) => p.bloodGroup === g && p.status === "Available").length;
    return avail < LOW_STOCK_THRESHOLD;
  });
}

// Haversine distance calculation in kilometers
export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Chart colors for pie charts
export const PIE_COLORS = [
  "#7F1D1D",
  "#991B1B",
  "#B91C1C",
  "#C04040",
  "#DC2626",
  "#E04A4A",
  "#EF4444",
  "#F87171",
];

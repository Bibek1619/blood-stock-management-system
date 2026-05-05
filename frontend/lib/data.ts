/**
 * Centralized Data Store
 * All mock data, types, and constants for the Blood Bank Management System
 */

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════

import { getCityCoordinates } from './geocoding';

export type BloodGroup = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
export { getCityCoordinates };
export type PackStatus = "Available" | "Used" | "Expired";
export type DonationType = "person" | "organization";
export type EventStatus = "Upcoming" | "Running" | "Completed";
export type CertificateType = "donation" | "volunteer";

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
  status: EventStatus;
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

export const EVENT_STATUS_CONFIG = {
  Upcoming: {
    label: "Upcoming",
    styles: "bg-blue-50 text-blue-700 border-blue-200",
    bg: "rgba(59,130,246,0.08)",
    text: "#1d4ed8",
    border: "rgba(59,130,246,0.2)",
    barColor: "bg-blue-500",
  },
  Running: {
    label: "Running",
    styles: "bg-green-50 text-green-700 border-green-200",
    bg: "rgba(21,128,61,0.08)",
    text: "#15803d",
    border: "rgba(21,128,61,0.2)",
    barColor: "bg-green-500",
  },
  Completed: {
    label: "Completed",
    styles: "bg-slate-50 text-slate-600 border-slate-200",
    bg: "rgba(100,116,139,0.08)",
    text: "#475569",
    border: "rgba(100,116,139,0.2)",
    barColor: "bg-slate-400",
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════

export const MOCK_DONORS: Donor[] = [
  { id: "d1", name: "Aarav Sharma", phone: "9841234567", email: "aarav@email.com", bloodGroup: "O+", location: "Thamel, Kathmandu", lastDonationDate: "2024-03-15", totalDonations: 5, lat: 27.7154, lng: 85.3123 },
  { id: "d2", name: "Priya Thapa", phone: "9851234568", email: "priya@email.com", bloodGroup: "A+", location: "Lalitpur", lastDonationDate: "2024-03-10", totalDonations: 3, lat: 27.6644, lng: 85.3188 },
  { id: "d3", name: "Rohan Karki", phone: "9861234569", bloodGroup: "B-", location: "Bhaktapur", lastDonationDate: "2024-02-28", totalDonations: 1, lat: 27.6710, lng: 85.4298 },
  { id: "d4", name: "Sita Poudel", phone: "9871234570", email: "sita@email.com", bloodGroup: "AB+", location: "Patan", lastDonationDate: "2024-03-12", totalDonations: 7, lat: 27.6726, lng: 85.3250 },
  { id: "d5", name: "Bikash Rai", phone: "9881234571", bloodGroup: "O-", location: "Koteshwor, Kathmandu", lastDonationDate: "2024-03-08", totalDonations: 2, lat: 27.6867, lng: 85.3560 },
  { id: "d6", name: "Anita Gurung", phone: "9891234572", email: "anita@email.com", bloodGroup: "A-", location: "Chabahil, Kathmandu", lastDonationDate: "2024-03-05", totalDonations: 4, lat: 27.7172, lng: 85.3480 },
  { id: "d7", name: "Dipesh Pokhrel", phone: "9801234573", bloodGroup: "B+", location: "Balaju, Kathmandu", lastDonationDate: "2024-02-20", totalDonations: 6, lat: 27.7310, lng: 85.2990 },
  { id: "d8", name: "Kamala Tamang", phone: "9811234574", email: "kamala@email.com", bloodGroup: "AB-", location: "Kirtipur", lastDonationDate: "2024-03-01", totalDonations: 3, lat: 27.6785, lng: 85.2780 },
  { id: "d9", name: "Rajesh Shrestha", phone: "9821234575", bloodGroup: "O+", location: "Baneshwor, Kathmandu", lastDonationDate: "2024-03-14", totalDonations: 8, lat: 27.6929, lng: 85.3370 },
  { id: "d10", name: "Sunita Magar", phone: "9831234576", email: "sunita@email.com", bloodGroup: "A+", location: "Kalanki, Kathmandu", lastDonationDate: "2024-03-11", totalDonations: 2, lat: 27.6952, lng: 85.2810 },
  { id: "d11", name: "Suresh Adhikari", phone: "9841111222", bloodGroup: "B+", location: "Gongabu, Kathmandu", lastDonationDate: "2024-01-18", totalDonations: 4, lat: 27.7368, lng: 85.3180 },
  { id: "d12", name: "Maya Lama", phone: "9852223333", bloodGroup: "O-", location: "Naxal, Kathmandu", lastDonationDate: "2024-02-05", totalDonations: 2, lat: 27.7183, lng: 85.3294 },
  { id: "d13", name: "Prakash KC", phone: "9863334444", email: "prakash@email.com", bloodGroup: "A-", location: "Tripureshwor", lastDonationDate: "2024-03-22", totalDonations: 9, lat: 27.6982, lng: 85.3104 },
  { id: "d14", name: "Nirmala Basnet", phone: "9874445555", email: "nirmala@email.com", bloodGroup: "AB+", location: "Maharajgunj", lastDonationDate: "2024-03-19", totalDonations: 3, lat: 27.7356, lng: 85.3378 },
  { id: "d15", name: "Binod Shrestha", phone: "9885556666", bloodGroup: "B-", location: "Bhaisepati, Lalitpur", lastDonationDate: "2024-02-14", totalDonations: 5, lat: 27.6480, lng: 85.3010 },
];

function generatePackCode(bloodGroup: string, index: number): string {
  const year = new Date().getFullYear();
  return `BP-${bloodGroup}-${year}-${String(index).padStart(4, "0")}`;
}

// Generate blood packs based on stock counts (deterministic - no random)
function generateBloodPacks(): BloodPack[] {
  const stockCounts: Record<BloodGroup, number> = {
    "A+": 12, "A-": 3, "B+": 8, "B-": 2,
    "AB+": 5, "AB-": 1, "O+": 15, "O-": 4
  };

  const packs: BloodPack[] = [];
  let packIndex = 1;

  BLOOD_GROUPS.forEach((bg, bgIndex) => {
    for (let i = 0; i < stockCounts[bg]; i++) {
      // Use deterministic dates based on index instead of random
      const dayOffset = (packIndex % 28) + 1;
      const monthOffset = (packIndex % 3);
      const collDate = new Date(2026, monthOffset, dayOffset);
      const expDate = new Date(collDate);
      expDate.setDate(expDate.getDate() + 42);

      // Deterministic status - most are Available (only mark a few as Used/Expired)
      let status: PackStatus = "Available";
      // Only mark specific pack indices as Used or Expired (not based on modulo of packIndex)
      if (packIndex === 25 || packIndex === 40) status = "Used";
      else if (packIndex === 50) status = "Expired";

      packs.push({
        id: `bp${packIndex}`,
        packCode: generatePackCode(bg, packIndex),
        bloodGroup: bg,
        donorId: MOCK_DONORS[(packIndex - 1) % MOCK_DONORS.length].id,
        collectionDate: collDate.toISOString().split("T")[0],
        expiryDate: expDate.toISOString().split("T")[0],
        status,
      });
      packIndex++;
    }
  });

  return packs;
}

export const MOCK_BLOOD_PACKS: BloodPack[] = generateBloodPacks();

export const MOCK_EVENTS: BloodEvent[] = [
  {
    id: "e1",
    title: "Spring Blood Drive 2026",
    date: "2026-04-15",
    location: "City Hall Plaza",
    description: "Annual spring blood donation campaign targeting 200 units.",
    status: "Upcoming",
    participants: ["d1", "d3", "d5"],
    volunteers: ["d2", "d7"],
  },
  {
    id: "e2",
    title: "Hospital Partnership Day",
    date: "2026-03-25",
    location: "Westside Hospital",
    description: "Collaborative event with hospital staff for emergency stock replenishment.",
    status: "Running",
    participants: ["d2", "d4"],
    volunteers: ["d1"],
  },
  {
    id: "e3",
    title: "University Donor Awareness",
    date: "2026-05-10",
    location: "State University Campus",
    description: "Awareness and donation camp for university students.",
    status: "Upcoming",
    participants: [],
    volunteers: ["d3", "d6"],
  },
  {
    id: "e4",
    title: "Community Blood Drive",
    date: "2025-05-15",
    location: "Ratna Park, Kathmandu",
    description: "Annual community blood drive open to all healthy adults. Walk-ins welcome.",
    status: "Completed",
    participants: ["d1", "d2"],
    volunteers: ["d3"],
  },
];

export const MOCK_CERTIFICATES: Certificate[] = [
  { id: "c1", type: "donation", recipientName: "Aarav Sharma", recipientId: "d1", date: "2026-02-15" },
  { id: "c2", type: "volunteer", recipientName: "Priya Thapa", recipientId: "d2", eventTitle: "Spring Blood Drive 2026", date: "2026-04-15", volunteerId: "VOL-2026-001" },
  { id: "c3", type: "donation", recipientName: "Rohan Karki", recipientId: "d3", date: "2026-03-01" },
];

export const MOCK_DONATIONS: Donation[] = [
  { id: "don1", donationType: "person", name: "Aarav Sharma", bloodGroup: "O+", units: 1, donationDate: "2024-03-15", location: "Kathmandu Blood Bank", contact: "9841234567" },
  { id: "don2", donationType: "person", name: "Priya Thapa", bloodGroup: "A+", units: 1, donationDate: "2024-03-14", location: "Patan Hospital", contact: "9851234568" },
  { id: "don3", donationType: "organization", name: "Red Cross Nepal", bloodGroup: "B+", units: 5, donationDate: "2024-03-13", location: "Central Blood Bank", contact: "01-4228094" },
  { id: "don4", donationType: "person", name: "Rohan Karki", bloodGroup: "AB+", units: 1, donationDate: "2024-03-12", location: "Bir Hospital", contact: "9861234569" },
  { id: "don5", donationType: "person", name: "Sita Poudel", bloodGroup: "O-", units: 1, donationDate: "2024-03-11", location: "Kathmandu Blood Bank", contact: "9871234570" },
  { id: "don6", donationType: "organization", name: "Lions Club Kathmandu", bloodGroup: "A-", units: 3, donationDate: "2024-03-10", location: "Teaching Hospital", contact: "01-4412303" },
  { id: "don7", donationType: "person", name: "Bikash Rai", bloodGroup: "B-", units: 1, donationDate: "2024-03-09", location: "Patan Hospital", contact: "9881234571" },
  { id: "don8", donationType: "person", name: "Anita Gurung", bloodGroup: "AB-", units: 1, donationDate: "2024-03-08", location: "Bir Hospital", contact: "9891234572" },
  { id: "don9", donationType: "person", name: "Dipesh Pokhrel", bloodGroup: "O+", units: 1, donationDate: "2024-03-07", location: "Kathmandu Blood Bank", contact: "9801234573" },
  { id: "don10", donationType: "organization", name: "Rotary Club Lalitpur", bloodGroup: "A+", units: 4, donationDate: "2024-03-06", location: "Central Blood Bank", contact: "01-5522334" },
  { id: "don11", donationType: "person", name: "Kamala Tamang", bloodGroup: "B+", units: 1, donationDate: "2024-03-05", location: "Teaching Hospital", contact: "9811234574" },
  { id: "don12", donationType: "person", name: "Rajesh Shrestha", bloodGroup: "O+", units: 1, donationDate: "2024-03-04", location: "Patan Hospital", contact: "9821234575" },
];

export const MOCK_BLOOD_STOCK: BloodStock[] = [
  { bloodGroup: "A+", units: 12 },
  { bloodGroup: "A-", units: 4 },
  { bloodGroup: "B+", units: 8 },
  { bloodGroup: "B-", units: 2 },
  { bloodGroup: "O+", units: 15 },
  { bloodGroup: "O-", units: 3 },
  { bloodGroup: "AB+", units: 6 },
  { bloodGroup: "AB-", units: 1 },
];

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

export function getDonorById(id: string): Donor | undefined {
  return MOCK_DONORS.find((d) => d.id === id);
}

export function getEventById(id: string): BloodEvent | undefined {
  return MOCK_EVENTS.find((e) => e.id === id);
}

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

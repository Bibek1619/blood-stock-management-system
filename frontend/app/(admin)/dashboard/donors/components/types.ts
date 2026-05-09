export interface Donor {
  id: string;
  userId: string;
  bloodGroup: string;
  donorType?: "PERSON" | "ORGANIZATION";
  location: string;
  city?: string;
  address?: string;
  dateOfBirth?: string;
  weight?: number;
  lastDonationDate?: string;
  totalDonations: number;
  isEligible: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    isVerified: boolean;
  };
}

export type DonorTab = "all" | "organization" | "unregistered";

export interface ToastItem {
  id: number;
  msg: string;
  type: "success" | "error" | "info";
}

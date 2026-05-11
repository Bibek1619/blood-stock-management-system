export interface DonorProfile {
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
  latitude?: number;
  longitude?: number;
  user?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    isVerified: boolean;
    createdAt?: string;
  };
}

export interface RegistrationInfo {
  source: string;
  label: string;
  icon: string;
  color: string;
}

export interface DonationRecord {
  id: string;
  donationDate: string;
  location?: string;
  donationType?: string;
  notes?: string;
  units: number;
  bloodGroup: string;
  status: string;
}

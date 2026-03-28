// Types
export interface BloodPack {
  id: string;
  packCode: string;
  bloodGroup: string;
  collectionDate: string;
  expiryDate: string;
  donorId: string;
  status: "Available" | "Used" | "Expired";
}

export interface Donor {
  id: string;
  name: string;
  phone: string;
  email: string;
  bloodGroup: string;
  location: string;
  lastDonationDate: string;
  totalDonations: number;
}

export interface BloodEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  participants: string[];
  volunteers: string[];
}

export interface Certificate {
  id: string;
  type: "donation" | "volunteer";
  recipientName: string;
  recipientId: string;
  eventTitle?: string;
  date: string;
  volunteerId?: string;
}

export interface Donation {
  id: string;
  donationType: "person" | "organization";
  bloodGroup: string;
  units: number;
  donationDate: string;
  recipientName: string;
  createdAt: string;
}
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

function generatePackCode(bloodGroup: string, index: number): string {
  const year = new Date().getFullYear();
  const bgCode = bloodGroup.replace("+", "+").replace("-", "-");
  return `BP-${bgCode}-${year}-${String(index).padStart(4, "0")}`;
}

function createSeedData() {
  const donors: Donor[] = [
    { id: "d1", name: "Sarah Johnson", phone: "+1-555-0101", email: "sarah@example.com", bloodGroup: "A+", location: "Downtown Clinic", lastDonationDate: "2026-02-15", totalDonations: 5 },
    { id: "d2", name: "Michael Chen", phone: "+1-555-0102", email: "michael@example.com", bloodGroup: "O-", location: "Westside Hospital", lastDonationDate: "2026-01-20", totalDonations: 12 },
    { id: "d3", name: "Emily Davis", phone: "+1-555-0103", email: "emily@example.com", bloodGroup: "B+", location: "Central Blood Bank", lastDonationDate: "2026-03-01", totalDonations: 3 },
    { id: "d4", name: "James Wilson", phone: "+1-555-0104", email: "james@example.com", bloodGroup: "AB+", location: "Downtown Clinic", lastDonationDate: "2025-12-10", totalDonations: 8 },
    { id: "d5", name: "Maria Garcia", phone: "+1-555-0105", email: "maria@example.com", bloodGroup: "O+", location: "Eastside Center", lastDonationDate: "2026-02-28", totalDonations: 6 },
    { id: "d6", name: "Robert Kim", phone: "+1-555-0106", email: "robert@example.com", bloodGroup: "A-", location: "Westside Hospital", lastDonationDate: "2026-01-05", totalDonations: 2 },
    { id: "d7", name: "Lisa Thompson", phone: "+1-555-0107", email: "lisa@example.com", bloodGroup: "B-", location: "Central Blood Bank", lastDonationDate: "2026-03-10", totalDonations: 9 },
    { id: "d8", name: "David Martinez", phone: "+1-555-0108", email: "david@example.com", bloodGroup: "AB-", location: "Eastside Center", lastDonationDate: "2025-11-22", totalDonations: 1 },
  ];

  let packIndex = 1;
  const bloodPacks: BloodPack[] = [];
  const stockCounts: Record<string, number> = { "A+": 12, "A-": 3, "B+": 8, "B-": 2, "AB+": 5, "AB-": 1, "O+": 15, "O-": 4 };

  for (const bg of BLOOD_GROUPS) {
    for (let i = 0; i < stockCounts[bg]; i++) {
      const collDate = new Date(2026, Math.floor(Math.random() * 3), Math.floor(Math.random() * 28) + 1);
      const expDate = new Date(collDate);
      expDate.setDate(expDate.getDate() + 42);
      bloodPacks.push({
        id: `bp-${packIndex}`,
        packCode: generatePackCode(bg, packIndex),
        bloodGroup: bg,
        collectionDate: collDate.toISOString().split("T")[0],
        expiryDate: expDate.toISOString().split("T")[0],
        donorId: donors[Math.floor(Math.random() * donors.length)].id,
        status: Math.random() > 0.15 ? "Available" : Math.random() > 0.5 ? "Used" : "Expired",
      });
      packIndex++;
    }
  }

  const events: BloodEvent[] = [
    { id: "e1", title: "Spring Blood Drive 2026", date: "2026-04-15", location: "City Hall Plaza", description: "Annual spring blood donation campaign targeting 200 units.", participants: ["d1", "d3", "d5"], volunteers: ["d2", "d7"] },
    { id: "e2", title: "Hospital Partnership Day", date: "2026-03-25", location: "Westside Hospital", description: "Collaborative event with hospital staff for emergency stock replenishment.", participants: ["d2", "d4"], volunteers: ["d1"] },
    { id: "e3", title: "University Donor Awareness", date: "2026-05-10", location: "State University Campus", description: "Awareness and donation camp for university students.", participants: [], volunteers: ["d3", "d6"] },
  ];

  const certificates: Certificate[] = [
    { id: "c1", type: "donation", recipientName: "Sarah Johnson", recipientId: "d1", date: "2026-02-15" },
    { id: "c2", type: "volunteer", recipientName: "Michael Chen", recipientId: "d2", eventTitle: "Spring Blood Drive 2026", date: "2026-04-15", volunteerId: "VOL-2026-001" },
    { id: "c3", type: "donation", recipientName: "Emily Davis", recipientId: "d3", date: "2026-03-01" },
  ];

  const donations: Donation[] = [
    { id: "don1", donationType: "person", bloodGroup: "A+", units: 2, donationDate: "2026-03-16", recipientName: "John Doe", createdAt: "2026-03-16T10:00:00Z" },
    { id: "don2", donationType: "organization", bloodGroup: "O-", units: 3, donationDate: "2026-03-15", recipientName: "City General Hospital", createdAt: "2026-03-15T14:00:00Z" },
    { id: "don3", donationType: "person", bloodGroup: "B+", units: 1, donationDate: "2026-03-17", recipientName: "Jane Smith", createdAt: "2026-03-17T09:00:00Z" },
  ];

  return { donors, bloodPacks, events, certificates, donations };
}
export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}

import React, { createContext, useContext, useState, useCallback, type ReactNode } from "react";

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

// Seed data
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

interface DataStore {
  donors: Donor[];
  bloodPacks: BloodPack[];
  events: BloodEvent[];
  certificates: Certificate[];
  bloodGroups: string[];
  addDonor: (donor: Omit<Donor, "id">) => void;
  addBloodPack: (pack: Omit<BloodPack, "id" | "packCode">) => void;
  updateBloodPackStatus: (id: string, status: BloodPack["status"]) => void;
  addEvent: (event: Omit<BloodEvent, "id">) => void;
  addParticipant: (eventId: string, donorId: string) => void;
  addVolunteer: (eventId: string, donorId: string) => void;
  addCertificate: (cert: Omit<Certificate, "id">) => void;
  donations: Donation[];
  addDonation: (donation: Omit<Donation, "id" | "createdAt">) => void;
  updateDonation: (id: string, data: Partial<Omit<Donation, "id" | "createdAt">>) => void;
  deleteDonation: (id: string) => void;
  getStockByGroup: () => Record<string, { available: number; total: number }>;
  getLowStockGroups: () => string[];
  getDonorById: (id: string) => Donor | undefined;
}

const DataContext = createContext<DataStore | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [seed] = useState(createSeedData);
  const [donors, setDonors] = useState<Donor[]>(seed.donors);
  const [bloodPacks, setBloodPacks] = useState<BloodPack[]>(seed.bloodPacks);
  const [events, setEvents] = useState<BloodEvent[]>(seed.events);
  const [certificates, setCertificates] = useState<Certificate[]>(seed.certificates);
  const [donations, setDonations] = useState<Donation[]>(seed.donations);

  const addDonor = useCallback((donor: Omit<Donor, "id">) => {
    setDonors((prev) => [...prev, { ...donor, id: `d${Date.now()}` }]);
  }, []);

  const addBloodPack = useCallback((pack: Omit<BloodPack, "id" | "packCode">) => {
    setBloodPacks((prev) => {
      const idx = prev.length + 1;
      return [...prev, { ...pack, id: `bp-${Date.now()}`, packCode: generatePackCode(pack.bloodGroup, idx) }];
    });
  }, []);

  const updateBloodPackStatus = useCallback((id: string, status: BloodPack["status"]) => {
    setBloodPacks((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
  }, []);

  const addEvent = useCallback((event: Omit<BloodEvent, "id">) => {
    setEvents((prev) => [...prev, { ...event, id: `e${Date.now()}` }]);
  }, []);

  const addParticipant = useCallback((eventId: string, donorId: string) => {
    setEvents((prev) => prev.map((e) => (e.id === eventId ? { ...e, participants: [...new Set([...e.participants, donorId])] } : e)));
  }, []);

  const addVolunteer = useCallback((eventId: string, donorId: string) => {
    setEvents((prev) => prev.map((e) => (e.id === eventId ? { ...e, volunteers: [...new Set([...e.volunteers, donorId])] } : e)));
  }, []);

  const addCertificate = useCallback((cert: Omit<Certificate, "id">) => {
    setCertificates((prev) => [...prev, { ...cert, id: `c${Date.now()}` }]);
  }, []);

  const addDonation = useCallback((donation: Omit<Donation, "id" | "createdAt">) => {
    setDonations((prev) => [...prev, { ...donation, id: `don${Date.now()}`, createdAt: new Date().toISOString() }]);
    setBloodPacks((prev) => {
      let remaining = donation.units;
      return prev.map((p) => {
        if (remaining > 0 && p.bloodGroup === donation.bloodGroup && p.status === "Available") {
          remaining--;
          return { ...p, status: "Used" as const };
        }
        return p;
      });
    });
  }, []);

  const updateDonation = useCallback((id: string, data: Partial<Omit<Donation, "id" | "createdAt">>) => {
    setDonations((prev) => prev.map((d) => (d.id === id ? { ...d, ...data } : d)));
  }, []);

  const deleteDonation = useCallback((id: string) => {
    setDonations((prev) => {
      const donation = prev.find((d) => d.id === id);
      if (donation) {
        setBloodPacks((bps) => {
          let remaining = donation.units;
          return bps.map((p) => {
            if (remaining > 0 && p.bloodGroup === donation.bloodGroup && p.status === "Used") {
              remaining--;
              return { ...p, status: "Available" as const };
            }
            return p;
          });
        });
      }
      return prev.filter((d) => d.id !== id);
    });
  }, []);

  const getStockByGroup = useCallback(() => {
    const stock: Record<string, { available: number; total: number }> = {};
    for (const bg of BLOOD_GROUPS) {
      const packs = bloodPacks.filter((p) => p.bloodGroup === bg);
      stock[bg] = { available: packs.filter((p) => p.status === "Available").length, total: packs.length };
    }
    return stock;
  }, [bloodPacks]);

  const getLowStockGroups = useCallback(() => {
    const stock = getStockByGroup();
    return Object.entries(stock).filter(([, v]) => v.available <= 5).map(([k]) => k);
  }, [getStockByGroup]);

  const getDonorById = useCallback((id: string) => donors.find((d) => d.id === id), [donors]);

  return (
    <DataContext.Provider value={{ donors, bloodPacks, events, certificates, bloodGroups: BLOOD_GROUPS, addDonor, addBloodPack, updateBloodPackStatus, addEvent, addParticipant, addVolunteer, addCertificate, donations, addDonation, updateDonation, deleteDonation, getStockByGroup, getLowStockGroups, getDonorById }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}

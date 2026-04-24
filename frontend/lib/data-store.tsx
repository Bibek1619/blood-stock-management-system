import React, { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import {
  BLOOD_GROUPS,
  MOCK_DONORS,
  MOCK_BLOOD_PACKS,
  MOCK_EVENTS,
  MOCK_CERTIFICATES,
  type Donor,
  type BloodPack,
  type BloodEvent,
  type Certificate,
  type PackStatus,
} from "./data";

// Additional types for donations (not in centralized data yet)
export interface Donation {
  id: string;
  donationType: "person" | "organization";
  bloodGroup: string;
  units: number;
  donationDate: string;
  recipientName: string;
  notes?: string;
  createdAt: string;
}

// Re-export types for backward compatibility
export type { Donor, BloodPack, BloodEvent, Certificate };

function generatePackCode(bloodGroup: string, index: number): string {
  const year = new Date().getFullYear();
  const bgCode = bloodGroup.replace("+", "+").replace("-", "-");
  return `BP-${bgCode}-${year}-${String(index).padStart(4, "0")}`;
}

// Seed data using centralized mock data
function createSeedData() {
  const donations: Donation[] = [
    { id: "don1", donationType: "person", bloodGroup: "A+", units: 2, donationDate: "2026-03-16", recipientName: "John Doe", createdAt: "2026-03-16T10:00:00Z" },
    { id: "don2", donationType: "organization", bloodGroup: "O-", units: 3, donationDate: "2026-03-15", recipientName: "City General Hospital", createdAt: "2026-03-15T14:00:00Z" },
    { id: "don3", donationType: "person", bloodGroup: "B+", units: 1, donationDate: "2026-03-17", recipientName: "Jane Smith", createdAt: "2026-03-17T09:00:00Z" },
  ];

  return {
    donors: MOCK_DONORS,
    bloodPacks: MOCK_BLOOD_PACKS,
    events: MOCK_EVENTS,
    certificates: MOCK_CERTIFICATES,
    donations,
  };
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
  updateEvent: (eventId: string, data: Partial<Omit<BloodEvent, "id" | "participants" | "volunteers">>) => void;
  updateEventStatus: (eventId: string, status: BloodEvent["status"]) => void;
  addParticipant: (eventId: string, donorId: string) => void;
  removeParticipant: (eventId: string, donorId: string) => void;
  addVolunteer: (eventId: string, donorId: string) => void;
  removeVolunteer: (eventId: string, donorId: string) => void;
  getEventById: (id: string) => BloodEvent | undefined;
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

  const updateBloodPackStatus = useCallback((id: string, status: PackStatus) => {
    setBloodPacks((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
  }, []);

  const addEvent = useCallback((event: Omit<BloodEvent, "id">) => {
    setEvents((prev) => [...prev, { ...event, id: `e${Date.now()}` }]);
  }, []);

  const updateEvent = useCallback((eventId: string, data: Partial<Omit<BloodEvent, "id" | "participants" | "volunteers">>) => {
    setEvents((prev) => prev.map((e) => (e.id === eventId ? { ...e, ...data } : e)));
  }, []);

  const updateEventStatus = useCallback((eventId: string, status: BloodEvent["status"]) => {
    setEvents((prev) => prev.map((e) => (e.id === eventId ? { ...e, status } : e)));
  }, []);

  const addParticipant = useCallback((eventId: string, donorId: string) => {
    setEvents((prev) => prev.map((e) => (e.id === eventId ? { ...e, participants: [...new Set([...e.participants, donorId])] } : e)));
  }, []);

  const removeParticipant = useCallback((eventId: string, donorId: string) => {
    setEvents((prev) => prev.map((e) => (e.id === eventId ? { ...e, participants: e.participants.filter((id) => id !== donorId) } : e)));
  }, []);

  const addVolunteer = useCallback((eventId: string, donorId: string) => {
    setEvents((prev) => prev.map((e) => (e.id === eventId ? { ...e, volunteers: [...new Set([...e.volunteers, donorId])] } : e)));
  }, []);

  const removeVolunteer = useCallback((eventId: string, donorId: string) => {
    setEvents((prev) => prev.map((e) => (e.id === eventId ? { ...e, volunteers: e.volunteers.filter((id) => id !== donorId) } : e)));
  }, []);

  const getEventById = useCallback((id: string) => events.find((e) => e.id === id), [events]);

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
    <DataContext.Provider value={{ donors, bloodPacks, events, certificates, bloodGroups: BLOOD_GROUPS, addDonor, addBloodPack, updateBloodPackStatus, addEvent, updateEvent, updateEventStatus, addParticipant, removeParticipant, addVolunteer, removeVolunteer, getEventById, addCertificate, donations, addDonation, updateDonation, deleteDonation, getStockByGroup, getLowStockGroups, getDonorById }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}

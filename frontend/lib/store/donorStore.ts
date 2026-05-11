import { create } from 'zustand';

interface DonorFilters {
  bloodGroup: string;
  location: string;
  eligibility: 'all' | 'eligible' | 'not-eligible';
  donorType: 'all' | 'PERSON' | 'ORGANIZATION';
  searchQuery: string;
  sortBy: 'name' | 'lastDonation' | 'totalDonations';
  sortOrder: 'asc' | 'desc';
}

interface DonorState {
  // Filters
  filters: DonorFilters;
  
  // UI State
  selectedDonorId: string | null;
  viewMode: 'grid' | 'list' | 'map';
  
  // Actions
  setFilter: <K extends keyof DonorFilters>(key: K, value: DonorFilters[K]) => void;
  setFilters: (filters: Partial<DonorFilters>) => void;
  resetFilters: () => void;
  setSelectedDonorId: (id: string | null) => void;
  setViewMode: (mode: 'grid' | 'list' | 'map') => void;
}

const defaultFilters: DonorFilters = {
  bloodGroup: 'all',
  location: '',
  eligibility: 'all',
  donorType: 'all',
  searchQuery: '',
  sortBy: 'name',
  sortOrder: 'asc',
};

export const useDonorStore = create<DonorState>((set) => ({
  // Initial state
  filters: defaultFilters,
  selectedDonorId: null,
  viewMode: 'grid',

  // Actions
  setFilter: (key, value) => set((state) => ({
    filters: { ...state.filters, [key]: value }
  })),
  
  setFilters: (filters) => set((state) => ({
    filters: { ...state.filters, ...filters }
  })),
  
  resetFilters: () => set({ filters: defaultFilters }),
  
  setSelectedDonorId: (id) => set({ selectedDonorId: id }),
  
  setViewMode: (mode) => set({ viewMode: mode }),
}));

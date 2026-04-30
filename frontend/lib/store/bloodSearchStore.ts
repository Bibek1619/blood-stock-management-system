import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface BloodSearchState {
  // Filters
  selectedBloodGroup: string;
  locationQuery: string;
  radius: number;
  clickedPosition: { lat: number; lng: number } | null;
  
  // UI State
  fullMapOpen: boolean;
  selectedDonor: any | null;
  
  // User Location
  userLocation: { lat: number; lng: number } | null;
  locationError: string | null;
  locationLoading: boolean;
  
  // Actions
  setSelectedBloodGroup: (group: string) => void;
  setLocationQuery: (query: string) => void;
  setRadius: (radius: number) => void;
  setClickedPosition: (position: { lat: number; lng: number } | null) => void;
  setFullMapOpen: (open: boolean) => void;
  setSelectedDonor: (donor: any | null) => void;
  setUserLocation: (location: { lat: number; lng: number } | null) => void;
  setLocationError: (error: string | null) => void;
  setLocationLoading: (loading: boolean) => void;
  clearFilters: () => void;
  clearPin: () => void;
}

export const useBloodSearchStore = create<BloodSearchState>()(
  persist(
    (set) => ({
      // Initial state
      selectedBloodGroup: 'all',
      locationQuery: '',
      radius: 5,
      clickedPosition: null,
      fullMapOpen: false,
      selectedDonor: null,
      userLocation: null,
      locationError: null,
      locationLoading: true,

      // Actions
      setSelectedBloodGroup: (group) => set({ selectedBloodGroup: group }),
      
      setLocationQuery: (query) => set({ locationQuery: query }),
      
      setRadius: (radius) => set({ radius }),
      
      setClickedPosition: (position) => set({ clickedPosition: position }),
      
      setFullMapOpen: (open) => set({ fullMapOpen: open }),
      
      setSelectedDonor: (donor) => set({ selectedDonor: donor }),
      
      setUserLocation: (location) => set({ userLocation: location }),
      
      setLocationError: (error) => set({ locationError: error }),
      
      setLocationLoading: (loading) => set({ locationLoading: loading }),
      
      clearFilters: () => set({
        selectedBloodGroup: 'all',
        locationQuery: '',
        clickedPosition: null,
      }),
      
      clearPin: () => set({ clickedPosition: null }),
    }),
    {
      name: 'blood-search-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist certain fields
      partialize: (state) => ({
        selectedBloodGroup: state.selectedBloodGroup,
        radius: state.radius,
        locationQuery: state.locationQuery,
      }),
    }
  )
);

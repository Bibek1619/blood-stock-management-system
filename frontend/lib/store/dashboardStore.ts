import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface DashboardState {
  // UI State
  sidebarCollapsed: boolean;
  activeTab: string;
  
  // Filters
  dateRange: { from: Date | null; to: Date | null };
  selectedEvent: string | null;
  
  // Preferences
  theme: 'light' | 'dark';
  chartType: 'bar' | 'line' | 'pie';
  
  // Actions
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setActiveTab: (tab: string) => void;
  setDateRange: (range: { from: Date | null; to: Date | null }) => void;
  setSelectedEvent: (eventId: string | null) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setChartType: (type: 'bar' | 'line' | 'pie') => void;
  resetFilters: () => void;
}
export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      // Initial state
      sidebarCollapsed: false,
      activeTab: 'overview',
      dateRange: { from: null, to: null },
      selectedEvent: null,
      theme: 'light',
      chartType: 'bar',

      // Actions
      toggleSidebar: () => set((state) => ({ 
        sidebarCollapsed: !state.sidebarCollapsed 
      })),
      
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      
      setActiveTab: (tab) => set({ activeTab: tab }),
      
      setDateRange: (range) => set({ dateRange: range }),
      
      setSelectedEvent: (eventId) => set({ selectedEvent: eventId }),
      
      setTheme: (theme) => set({ theme }),
      
      setChartType: (type) => set({ chartType: type }),
      
      resetFilters: () => set({
        dateRange: { from: null, to: null },
        selectedEvent: null,
      }),
    }),
    {
      name: 'dashboard-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

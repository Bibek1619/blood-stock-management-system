import { Navigation } from "lucide-react";

interface MapPanelProps {
  mapRef: React.RefObject<HTMLDivElement | null>;
  mapReady: boolean;
  locationLoading: boolean;
  filteredCount: number;
  radius: number;
  clickedPos: { lat: number; lng: number } | null;
  onFullMapOpen: () => void;
}

export function MapPanel({
  mapRef,
  mapReady,
  locationLoading,
  filteredCount,
  radius,
  clickedPos,
  onFullMapOpen,
}: MapPanelProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mb-4">
      <div className="flex items-center justify-between p-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center">
            <Navigation size={14} className="text-red-800" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">Donor Map</p>
            <p className="text-xs text-slate-500">
              {clickedPos 
                ? `${filteredCount} donors within ${radius}km radius` 
                : `Showing all ${filteredCount} donors`
              }
            </p>
          </div>
        </div>
        <button
          onClick={onFullMapOpen}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-800 hover:bg-red-900 text-white rounded-lg text-xs font-semibold transition-colors"
        >
          <Navigation size={12} /> Full Map
        </button>
      </div>

      <div className="relative">
        <div ref={mapRef} className="h-[400px] w-full" />
        {(!mapReady || locationLoading) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50">
            <div className="w-9 h-9 border-3 border-slate-200 border-t-red-800 rounded-full animate-spin" />
            <p className="text-sm text-slate-600 mt-2">
              {locationLoading ? 'Getting your location...' : 'Loading map…'}
            </p>
          </div>
        )}
        
        {/* Map Legend */}
        {mapReady && !locationLoading && (
          <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-lg p-3 shadow-lg z-[1000]">
            <p className="text-xs font-bold text-slate-700 mb-2">Map Legend</p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#2563eb] border-2 border-white shadow-md flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2">
                    <rect x="4" y="2" width="16" height="20" rx="2"/>
                    <path d="M9 6h.01M9 10h.01M9 14h.01M15 6h.01M15 10h.01M15 14h.01"/>
                  </svg>
                </div>
                <span className="text-xs text-slate-600 font-semibold">Organization</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#059669] border-2 border-white shadow-md"></div>
                <span className="text-xs text-slate-600">Precise location</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#7F1D1D] border-2 border-white shadow-md"></div>
                <span className="text-xs text-slate-600">Approximate (city)</span>
              </div>
              {clickedPos && (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#94a3b8] border-2 border-white shadow-md opacity-40"></div>
                  <span className="text-xs text-slate-600">Out of radius</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

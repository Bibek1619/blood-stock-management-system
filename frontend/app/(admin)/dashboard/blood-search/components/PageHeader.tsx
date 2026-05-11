import { Search, Users, Crosshair } from "lucide-react";

interface PageHeaderProps {
  filteredCount: number;
  clickedPos: { lat: number; lng: number } | null;
  userLocation: { lat: number; lng: number } | null;
  onUseMyLocation: () => void;
}

export function PageHeader({ filteredCount, clickedPos, userLocation, onUseMyLocation }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center">
          <Search size={18} className="text-red-800" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Blood Search</h1>
          <p className="text-sm text-slate-600 mt-0.5">Find donors by blood group, location, or map radius</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {userLocation && (
          <button
            onClick={onUseMyLocation}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm font-semibold text-blue-800 hover:bg-blue-100 transition-colors"
          >
            <Crosshair size={14} />
            Use My Location
          </button>
        )}
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-4 py-2">
          <Users size={13} className="text-red-800" />
          <span className="text-lg font-bold text-red-800">{filteredCount}</span>
          <span className="text-xs text-slate-600">
            {clickedPos ? 'within radius' : 'total donors'}
          </span>
        </div>
      </div>
    </div>
  );
}

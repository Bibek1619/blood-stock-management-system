import { Filter, MapPin, Navigation, X } from "lucide-react";

interface SearchFiltersProps {
  selectedGroup: string;
  locationQuery: string;
  radius: number;
  clickedPos: { lat: number; lng: number } | null;
  bloodGroups: string[];
  onGroupChange: (group: string) => void;
  onLocationChange: (location: string) => void;
  onRadiusChange: (radius: number) => void;
  onClearPin: () => void;
}

export function SearchFilters({
  selectedGroup,
  locationQuery,
  radius,
  clickedPos,
  bloodGroups,
  onGroupChange,
  onLocationChange,
  onRadiusChange,
  onClearPin,
}: SearchFiltersProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mb-4">
      <div className="flex items-center gap-2 p-4 pb-0">
        <div className="w-7 h-7 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center">
          <Filter size={14} className="text-red-800" />
        </div>
        <p className="text-sm font-bold text-slate-900">Search Filters</p>
      </div>

      <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Blood Group</label>
          <select
            value={selectedGroup}
            onChange={(e) => onGroupChange(e.target.value)}
            className="w-full h-9 px-3 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">All Groups</option>
            {bloodGroups.map((g) => {
              // Convert database format to display format
              const displayFormat = g.replace('_POSITIVE', '+').replace('_NEGATIVE', '-').replace('_', '');
              return (
                <option key={g} value={displayFormat}>
                  {displayFormat}
                </option>
              );
            })}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Location</label>
          <div className="relative">
            <MapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="Type street name, area, or landmark…"
              value={locationQuery}
              onChange={(e) => onLocationChange(e.target.value)}
              className="w-full h-9 pl-9 pr-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Map Radius: <span className="text-red-800">{radius} km</span>
            {clickedPos && <span className="text-slate-400 font-normal text-[10px]"> (click map to move)</span>}
          </label>
          <input
            type="range"
            min={1}
            max={30}
            step={0.5}
            value={radius}
            onChange={(e) => onRadiusChange(parseFloat(e.target.value))}
            className="w-full accent-red-800 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 -mt-1">
            <span>1 km</span>
            <span>30 km</span>
          </div>
        </div>
      </div>

      {clickedPos && (
        <div className="px-4 pb-4">
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-2">
            <Navigation size={12} className="text-red-800" />
            <span className="text-xs text-red-800 font-medium flex-1">
              Pin: {clickedPos.lat.toFixed(4)}, {clickedPos.lng.toFixed(4)}
            </span>
            <button
              onClick={onClearPin}
              className="flex items-center gap-1 text-xs font-semibold text-red-800 hover:text-red-900"
            >
              <X size={12} /> Clear
            </button>
          </div>
        </div>
      )}

      {!clickedPos && (
        <p className="text-xs text-slate-500 text-center px-4 pb-4">
          Click anywhere on the map to drop a pin and filter donors by radius
        </p>
      )}
    </div>
  );
}

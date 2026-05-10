import { Droplets } from "lucide-react";

interface LowStockSuggestionsProps {
  lowStockGroups: string[];
  selectedGroup: string;
  onSelectGroup: (group: string) => void;
}

export function LowStockSuggestions({ lowStockGroups, selectedGroup, onSelectGroup }: LowStockSuggestionsProps) {
  if (lowStockGroups.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2.5 bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
      <Droplets size={15} className="text-red-800" />
      <span className="text-sm font-medium text-red-800">Suggested — search donors for low-stock groups:</span>
      <div className="flex flex-wrap gap-2">
        {lowStockGroups.map((g) => {
          // Convert database format to display format
          const displayFormat = g.replace('_POSITIVE', '+').replace('_NEGATIVE', '-').replace('_', '');
          return (
            <button
              key={g}
              onClick={() => onSelectGroup(selectedGroup === displayFormat ? "all" : displayFormat)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                selectedGroup === displayFormat
                  ? "bg-red-100 text-red-800 border-red-300 font-bold"
                  : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
              }`}
            >
              {displayFormat}
            </button>
          );
        })}
      </div>
    </div>
  );
}

import { Search } from "lucide-react";
import { BLOOD_GROUPS } from "@/lib/data";

interface DonorsFiltersProps {
  filterGroup: string;
  searchQuery: string;
  onFilterGroupChange: (value: string) => void;
  onSearchChange: (value: string) => void;
}

export function DonorsFilters({
  filterGroup,
  searchQuery,
  onFilterGroupChange,
  onSearchChange,
}: DonorsFiltersProps) {
  return (
    <div className="flex items-center gap-2.5 mb-3.5">
      <div className="relative flex-1">
        <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          className="w-full pl-8 pr-2.5 h-9.5 border border-slate-200 rounded-lg text-sm outline-none bg-white focus:border-[#7F1D1D] focus:ring-1 focus:ring-[#7F1D1D]"
          placeholder="Search by name, location, phone…"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>
      <select
        aria-label="Filter donors by blood group"
        className="h-9.5 border border-slate-200 rounded-lg px-2.5 text-sm bg-white outline-none cursor-pointer focus:border-[#7F1D1D] focus:ring-1 focus:ring-[#7F1D1D]"
        value={filterGroup}
        onChange={(event) => onFilterGroupChange(event.target.value)}
      >
        <option value="all">All Groups</option>
        {BLOOD_GROUPS.map((group) => (
          <option key={group} value={group}>
            {group}
          </option>
        ))}
      </select>
    </div>
  );
}

import { DonorTab } from "./types";

interface DonorTabsProps {
  activeTab: DonorTab;
  allCount: number;
  organizationCount: number;
  unregisteredCount: number;
  onTabChange: (tab: DonorTab) => void;
}

export function DonorTabs({
  activeTab,
  allCount,
  organizationCount,
  unregisteredCount,
  onTabChange,
}: DonorTabsProps) {
  const tabs: Array<{ key: DonorTab; label: string; count: number }> = [
    { key: "all", label: "All Donors", count: allCount },
    { key: "organization", label: "Organizations", count: organizationCount },
    { key: "unregistered", label: "Unregistered Donors", count: unregisteredCount },
  ];

  return (
    <div className="flex items-center gap-2 mb-4 border-b border-slate-200">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === tab.key
              ? "border-[#7F1D1D] text-[#7F1D1D]"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
          onClick={() => onTabChange(tab.key)}
        >
          {tab.label}
          <span className="ml-2 px-2 py-0.5 rounded-full bg-slate-100 text-xs font-bold text-slate-700">
            {tab.count}
          </span>
        </button>
      ))}
    </div>
  );
}

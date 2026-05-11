import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { EventStatus } from "@/lib/queries/events";
import { STATUS_CONFIG } from "./statusConfig";

interface EventsFilterTabsProps {
  filterStatus: string;
  counts: Record<string, number>;
  onFilterChange: (status: string) => void;
}

const ALL_STATUSES: EventStatus[] = ["UPCOMING", "RUNNING", "COMPLETED", "CANCELLED"];

export function EventsFilterTabs({ filterStatus, counts, onFilterChange }: EventsFilterTabsProps) {
  return (
    <div className="mx-auto mb-6 max-w-7xl">
      <div className="flex flex-wrap gap-2">
        {(["all", ...ALL_STATUSES] as const).map((key) => {
          const isActive = filterStatus === key;
          const cfg = key !== "all" ? STATUS_CONFIG[key] : null;

          return (
            <Button
              key={key}
              type="button"
              variant={isActive ? "default" : "outline"}
              onClick={() => onFilterChange(key)}
              className={isActive && !cfg ? "bg-red-50 text-red-800 border-red-200 hover:bg-red-50" : ""}
            >
              {cfg && <span className="flex">{cfg.icon}</span>}
              {key === "all" ? "All Events" : STATUS_CONFIG[key].label}
              <Badge
                variant="secondary"
                className={isActive ? "ml-1 bg-red-800 text-white hover:bg-red-800" : "ml-1 bg-slate-200 text-slate-600"}
              >
                {key === "all" ? counts.all : counts[key]}
              </Badge>
            </Button>
          );
        })}
      </div>
    </div>
  );
}

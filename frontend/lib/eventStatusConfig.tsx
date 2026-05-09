import type { EventStatus } from "@/lib/queries/events";
import { CheckCircle2, Clock, PlayCircle, X } from "lucide-react";

export interface StatusBadgeConfig {
  color: string;
  label: string;
  icon?: React.ReactNode;
  barColor?: string;
}

export const EVENT_STATUS_CONFIG: Record<EventStatus, StatusBadgeConfig> = {
  UPCOMING: { 
    color: 'bg-blue-50 text-blue-700 border-blue-200', 
    label: 'Upcoming',
    icon: <Clock size={14} />,
    barColor: 'bg-blue-500',
  },
  RUNNING: { 
    color: 'bg-green-50 text-green-700 border-green-200', 
    label: 'Running',
    icon: <PlayCircle size={14} />,
    barColor: 'bg-green-500',
  },
  COMPLETED: { 
    color: 'bg-gray-50 text-gray-700 border-gray-200', 
    label: 'Completed',
    icon: <CheckCircle2 size={14} />,
    barColor: 'bg-slate-400',
  },
  CANCELLED: { 
    color: 'bg-red-50 text-red-700 border-red-200', 
    label: 'Cancelled',
    icon: <X size={14} />,
    barColor: 'bg-red-400',
  },
};

export const ALL_STATUSES: EventStatus[] = ["UPCOMING", "RUNNING", "COMPLETED", "CANCELLED"];

export function getStatusBadge(status: EventStatus): StatusBadgeConfig {
  return EVENT_STATUS_CONFIG[status] || EVENT_STATUS_CONFIG.UPCOMING;
}

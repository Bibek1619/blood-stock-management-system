import type { EventStatus } from "@/lib/queries/events";

export interface StatusBadgeConfig {
  color: string;
  label: string;
}

export const EVENT_STATUS_BADGES: Record<EventStatus, StatusBadgeConfig> = {
  UPCOMING: { 
    color: 'bg-blue-50 text-blue-700 border-blue-200', 
    label: 'Upcoming' 
  },
  RUNNING: { 
    color: 'bg-green-50 text-green-700 border-green-200', 
    label: 'Running' 
  },
  COMPLETED: { 
    color: 'bg-gray-50 text-gray-700 border-gray-200', 
    label: 'Completed' 
  },
  CANCELLED: { 
    color: 'bg-red-50 text-red-700 border-red-200', 
    label: 'Cancelled' 
  },
};

export function getStatusBadge(status: EventStatus): StatusBadgeConfig {
  return EVENT_STATUS_BADGES[status] || EVENT_STATUS_BADGES.UPCOMING;
}

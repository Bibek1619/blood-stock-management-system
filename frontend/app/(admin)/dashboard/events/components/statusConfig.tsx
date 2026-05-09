import { CheckCircle2, Clock, PlayCircle, X } from "lucide-react";
import type { EventStatus } from "@/lib/queries/events";
import type { StatusConfigItem } from "./types";

export const STATUS_CONFIG: Record<EventStatus, StatusConfigItem> = {
  UPCOMING: {
    label: "Upcoming",
    styles: "bg-blue-50 text-blue-700 border-blue-200",
    icon: <Clock size={11} />,
    barColor: "bg-blue-500",
  },
  RUNNING: {
    label: "Running",
    styles: "bg-green-50 text-green-700 border-green-200",
    icon: <PlayCircle size={11} />,
    barColor: "bg-green-500",
  },
  COMPLETED: {
    label: "Completed",
    styles: "bg-slate-50 text-slate-600 border-slate-200",
    icon: <CheckCircle2 size={11} />,
    barColor: "bg-slate-400",
  },
  CANCELLED: {
    label: "Cancelled",
    styles: "bg-red-50 text-red-600 border-red-200",
    icon: <X size={11} />,
    barColor: "bg-red-400",
  },
};

import type { ReactNode } from "react";
import type { EventStatus } from "@/lib/queries/events";

export interface EventFormState {
  title: string;
  eventDate: string;
  eventTime?: string;
  location: string;
  description: string;
  status: EventStatus;
  capacity?: number;
}

export interface StatusConfigItem {
  label: string;
  styles: string;
  icon: ReactNode;
  barColor: string;
}

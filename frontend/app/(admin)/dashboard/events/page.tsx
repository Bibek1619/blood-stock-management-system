'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { useCreateEvent, useEvents } from "@/lib/queries/events";
import { EventsHeader } from "./components/EventsHeader";
import { EventsFilterTabs } from "./components/EventsFilterTabs";
import { EventCardsGrid } from "./components/EventCardsGrid";
import { EventCreateDialog } from "./components/EventCreateDialog";
import type { EventFormState } from "./components/types";

export default function EventsPage() {
  const router = useRouter();
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState<EventFormState>({
    title: "",
    eventDate: "",
    location: "",
    description: "",
    status: "UPCOMING",
    capacity: undefined,
  });

  const { data: events = [], isLoading, error } = useEvents();
  const createEvent = useCreateEvent();

  const filteredEvents = events.filter((event) => (filterStatus === "all" ? true : event.status === filterStatus));

  const counts = {
    all: events.length,
    UPCOMING: events.filter((event) => event.status === "UPCOMING").length,
    RUNNING: events.filter((event) => event.status === "RUNNING").length,
    COMPLETED: events.filter((event) => event.status === "COMPLETED").length,
    CANCELLED: events.filter((event) => event.status === "CANCELLED").length,
  };

  const handleCreate = async () => {
    if (!newEvent.title || !newEvent.eventDate || !newEvent.location) {
      toast.error("Title, date and location are required");
      return;
    }

    try {
      await createEvent.mutateAsync({
        title: newEvent.title,
        eventDate: newEvent.eventDate,
        location: newEvent.location,
        description: newEvent.description || undefined,
        status: newEvent.status,
        capacity: newEvent.capacity,
      });

      setDialogOpen(false);
      setNewEvent({
        title: "",
        eventDate: "",
        location: "",
        description: "",
        status: "UPCOMING",
        capacity: undefined,
      });
      toast.success("Event created successfully");
    } catch (caughtError: unknown) {
      const message = axios.isAxiosError(caughtError)
        ? caughtError.response?.data?.message || "Failed to create event"
        : "Failed to create event";

      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <EventsHeader onCreateClick={() => setDialogOpen(true)} />

      <EventsFilterTabs filterStatus={filterStatus} counts={counts} onFilterChange={setFilterStatus} />

      <EventCardsGrid
        filteredEvents={filteredEvents}
        isLoading={isLoading}
        error={error}
        onViewEvent={(eventId) => router.push(`/dashboard/events/${eventId}`)}
      />

      <EventCreateDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        form={newEvent}
        onFormChange={setNewEvent}
        onCreate={handleCreate}
      />
    </div>
  );
}

'use client';
import { useParams, useRouter } from "next/navigation";
import { Home, Loader2, X, ChevronLeft } from "lucide-react";
import {
  useEvent,
  useUpdateEvent,
  useDeleteEvent,
  useAddVolunteer,
  useRemoveVolunteer,
  useAddParticipant,
  useRemoveParticipant,
  type EventStatus,
} from "@/lib/queries/events";
import { useDonationsByEvent } from "@/lib/queries/donations";
import { useUsers } from "@/lib/queries/users";
import { toast } from "sonner";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  EventHeader,
  VolunteersSection,
  ParticipantsSection,
  BloodCollectionSection,
} from "./components";

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  // Queries
  const { data: event, isLoading, error } = useEvent(eventId);
  const { data: users = [] } = useUsers();
  const { data: eventDonations = [] } = useDonationsByEvent(eventId);
  const updateEvent = useUpdateEvent(eventId);
  const deleteEvent = useDeleteEvent();
  const addVolunteer = useAddVolunteer(eventId);
  const removeVolunteer = useRemoveVolunteer(eventId);
  const addParticipant = useAddParticipant(eventId);
  const removeParticipant = useRemoveParticipant(eventId);

  const handleStatusChange = async (newStatus: EventStatus) => {
    try {
      await updateEvent.mutateAsync({ status: newStatus });
      toast.success("Event status updated");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const handleDeleteEvent = async () => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      await deleteEvent.mutateAsync(eventId);
      toast.success("Event deleted successfully");
      router.push("/dashboard/events");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete event");
    }
  };

  const handleAddVolunteer = async (data: {
    name: string;
    email: string;
    phone: string;
    address?: string;
    role?: string;
  }) => {
    if (!data.name || !data.email || !data.phone) {
      toast.error("Name, email, and phone are required");
      return;
    }

    try {
      await addVolunteer.mutateAsync(data);
      toast.success("Volunteer added successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add volunteer");
    }
  };

  const handleRemoveVolunteer = async (volunteerId: string) => {
    if (!confirm("Remove this volunteer?")) return;

    try {
      await removeVolunteer.mutateAsync(volunteerId);
      toast.success("Volunteer removed");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to remove volunteer");
    }
  };

  const handleAddParticipant = async (userId: string) => {
    if (!userId) {
      toast.error("Please select a user");
      return;
    }

    try {
      await addParticipant.mutateAsync({ userId });
      toast.success("Participant added successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add participant");
    }
  };

  const handleRemoveParticipant = async (participantId: string) => {
    if (!confirm("Remove this participant?")) return;

    try {
      await removeParticipant.mutateAsync(participantId);
      toast.success("Participant removed");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to remove participant");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="w-10 h-10 text-red-800 animate-spin mb-4" />
          <p className="text-sm font-semibold text-slate-600">Loading event...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <X size={24} className="text-red-600" />
          </div>
          <p className="text-sm font-semibold text-red-600 mb-1">Event not found</p>
          <button
            onClick={() => router.push("/dashboard/events")}
            className="text-xs text-slate-500 hover:text-red-800 underline"
          >
            Back to events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto mb-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard" className="flex items-center gap-1">
                <Home size={14} /> Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard/events">Events</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{event.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Back Button */}
      <div className="max-w-7xl mx-auto mb-4">
        <button
          onClick={() => router.push("/dashboard/events")}
          className="flex items-center gap-2 text-sm text-slate-600 hover:text-red-800 transition-colors"
        >
          <ChevronLeft size={16} /> Back to Events
        </button>
      </div>

      {/* Event Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <EventHeader
          event={event}
          eventId={eventId}
          onStatusChange={handleStatusChange}
          onDelete={handleDeleteEvent}
        />
      </div>

      {/* Volunteers and Participants */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <VolunteersSection
          event={event}
          onAddVolunteer={handleAddVolunteer}
          onRemoveVolunteer={handleRemoveVolunteer}
        />
        <ParticipantsSection
          event={event}
          users={users}
          onAddParticipant={handleAddParticipant}
          onRemoveParticipant={handleRemoveParticipant}
        />
      </div>

      {/* Blood Collection Section */}
      <div className="max-w-7xl mx-auto">
        <BloodCollectionSection
          event={event}
          eventId={eventId}
          eventDonations={eventDonations}
        />
      </div>
    </div>
  );
}

'use client';
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  CalendarDays, MapPin, Users, UserPlus, X, Clock, CheckCircle2,
  PlayCircle, Home, Loader2, ChevronLeft, Trash2, Search, Shield,
  CreditCard,
} from "lucide-react";
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
import { VolunteerIDCardPreview } from "@/lib/volunteer-idcard-preview";

// Status configuration
const STATUS_CONFIG: Record<EventStatus, {
  label: string;
  styles: string;
  icon: React.ReactNode;
  barColor: string;
}> = {
  UPCOMING: {
    label: "Upcoming",
    styles: "bg-blue-50 text-blue-700 border-blue-200",
    icon: <Clock size={14} />,
    barColor: "bg-blue-500",
  },
  RUNNING: {
    label: "Running",
    styles: "bg-green-50 text-green-700 border-green-200",
    icon: <PlayCircle size={14} />,
    barColor: "bg-green-500",
  },
  COMPLETED: {
    label: "Completed",
    styles: "bg-slate-50 text-slate-600 border-slate-200",
    icon: <CheckCircle2 size={14} />,
    barColor: "bg-slate-400",
  },
  CANCELLED: {
    label: "Cancelled",
    styles: "bg-red-50 text-red-600 border-red-200",
    icon: <X size={14} />,
    barColor: "bg-red-400",
  },
};

const ALL_STATUSES: EventStatus[] = ["UPCOMING", "RUNNING", "COMPLETED", "CANCELLED"];

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [addVolunteerOpen, setAddVolunteerOpen] = useState(false);
  const [addParticipantOpen, setAddParticipantOpen] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [volunteerForm, setVolunteerForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    role: "",
  });
  const [idCardPreviewOpen, setIdCardPreviewOpen] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState<any>(null);

  // Queries
  const { data: event, isLoading, error } = useEvent(eventId);
  const { data: users = [] } = useUsers();
  const updateEvent = useUpdateEvent(eventId);
  const deleteEvent = useDeleteEvent();
  const addVolunteer = useAddVolunteer(eventId);
  const removeVolunteer = useRemoveVolunteer(eventId);
  const addParticipant = useAddParticipant(eventId);
  const removeParticipant = useRemoveParticipant(eventId);

  // Filter users for search
  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.phone.includes(userSearch)
  );

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

  const handleAddVolunteer = async () => {
    if (!volunteerForm.name || !volunteerForm.email || !volunteerForm.phone) {
      toast.error("Name, email, and phone are required");
      return;
    }

    try {
      await addVolunteer.mutateAsync({
        name: volunteerForm.name,
        email: volunteerForm.email,
        phone: volunteerForm.phone,
        address: volunteerForm.address || undefined,
        role: volunteerForm.role || undefined,
      });
      setAddVolunteerOpen(false);
      setVolunteerForm({ name: "", email: "", phone: "", address: "", role: "" });
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

  const handleAddParticipant = async () => {
    if (!selectedUserId) {
      toast.error("Please select a user");
      return;
    }

    try {
      await addParticipant.mutateAsync({ userId: selectedUserId });
      setAddParticipantOpen(false);
      setSelectedUserId("");
      setUserSearch("");
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

  const handleViewIdCard = (volunteer: any) => {
    setSelectedVolunteer(volunteer);
    setIdCardPreviewOpen(true);
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

  const cfg = STATUS_CONFIG[event.status];
  const eventDate = new Date(event.eventDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

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
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className={`h-2 ${cfg.barColor}`} />
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-slate-900">{event.title}</h1>
                  <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold ${cfg.styles}`}>
                    {cfg.icon} {cfg.label}
                  </span>
                </div>
                {event.description && (
                  <p className="text-sm text-slate-600">{event.description}</p>
                )}
              </div>
              <button
                onClick={handleDeleteEvent}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-sm font-semibold transition-colors border border-red-200"
              >
                <Trash2 size={14} /> Delete Event
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center">
                  <CalendarDays size={16} className="text-slate-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Event Date</p>
                  <p className="text-sm font-semibold text-slate-900">{eventDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center">
                  <MapPin size={16} className="text-slate-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Location</p>
                  <p className="text-sm font-semibold text-slate-900">{event.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center">
                  <Users size={16} className="text-slate-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Capacity</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {event.capacity ? `${event.participants?.length || 0} / ${event.capacity}` : "Unlimited"}
                  </p>
                </div>
              </div>
            </div>

            {/* Status Selector */}
            <div className="pt-4 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-700 mb-2">Update Status</p>
              <div className="flex flex-wrap gap-2">
                {ALL_STATUSES.map((status) => {
                  const statusCfg = STATUS_CONFIG[status];
                  const isActive = event.status === status;
                  return (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      disabled={isActive}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        isActive
                          ? `${statusCfg.styles} cursor-default`
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-red-200"
                      }`}
                    >
                      {statusCfg.icon} {statusCfg.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Volunteers and Participants */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Volunteers Section */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Shield size={18} className="text-red-800" />
              <h2 className="text-lg font-bold text-slate-900">Volunteers</h2>
              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full text-xs font-bold">
                {event.volunteers?.length || 0}
              </span>
            </div>
            <button
              onClick={() => setAddVolunteerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-800 hover:bg-red-900 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              <UserPlus size={14} /> Add
            </button>
          </div>

          <div className="space-y-2">
            {event.volunteers && event.volunteers.length > 0 ? (
              event.volunteers.map((volunteer) => {
                const displayName = volunteer.user?.name || volunteer.name || "Unknown";
                const displayEmail = volunteer.user?.email || volunteer.email || "";
                const displayPhone = volunteer.user?.phone || volunteer.phone || "";
                
                return (
                  <div
                    key={volunteer.id}
                    className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900">{displayName}</p>
                      {displayEmail && <p className="text-xs text-slate-600">{displayEmail}</p>}
                      {displayPhone && <p className="text-xs text-slate-600">{displayPhone}</p>}
                      {volunteer.role && (
                        <p className="text-xs text-slate-500 mt-0.5">Role: {volunteer.role}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleViewIdCard(volunteer)}
                        className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors"
                        title="View ID Card"
                      >
                        <CreditCard size={14} className="text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleRemoveVolunteer(volunteer.id)}
                        className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"
                        title="Remove Volunteer"
                      >
                        <X size={14} className="text-red-600" />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-slate-500 text-center py-8">No volunteers yet</p>
            )}
          </div>
        </div>

        {/* Participants Section */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-red-800" />
              <h2 className="text-lg font-bold text-slate-900">Participants</h2>
              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full text-xs font-bold">
                {event.participants?.length || 0}
              </span>
            </div>
            <button
              onClick={() => setAddParticipantOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-800 hover:bg-red-900 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              <UserPlus size={14} /> Add
            </button>
          </div>

          <div className="space-y-2">
            {event.participants && event.participants.length > 0 ? (
              event.participants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900">{participant.user.name}</p>
                    <p className="text-xs text-slate-600">{participant.user.email}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveParticipant(participant.id)}
                    className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <X size={14} className="text-red-600" />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 text-center py-8">No participants yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Add Volunteer Dialog */}
      {addVolunteerOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-40 p-4"
          onClick={() => setAddVolunteerOpen(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center">
                  <Shield size={16} className="text-red-800" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Add Volunteer</h2>
              </div>
              <button
                onClick={() => setAddVolunteerOpen(false)}
                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={16} className="text-slate-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Full name"
                  value={volunteerForm.name}
                  onChange={(e) => setVolunteerForm({ ...volunteerForm, name: e.target.value })}
                  className="w-full h-10 px-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email <span className="text-red-600">*</span>
                </label>
                <input
                  type="email"
                  placeholder="email@example.com"
                  value={volunteerForm.email}
                  onChange={(e) => setVolunteerForm({ ...volunteerForm, email: e.target.value })}
                  className="w-full h-10 px-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Phone <span className="text-red-600">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="Phone number"
                  value={volunteerForm.phone}
                  onChange={(e) => setVolunteerForm({ ...volunteerForm, phone: e.target.value })}
                  className="w-full h-10 px-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Address</label>
                <input
                  type="text"
                  placeholder="Full address"
                  value={volunteerForm.address}
                  onChange={(e) => setVolunteerForm({ ...volunteerForm, address: e.target.value })}
                  className="w-full h-10 px-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Role</label>
                <input
                  type="text"
                  placeholder="e.g., Coordinator, Helper"
                  value={volunteerForm.role}
                  onChange={(e) => setVolunteerForm({ ...volunteerForm, role: e.target.value })}
                  className="w-full h-10 px-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={handleAddVolunteer}
                disabled={!volunteerForm.name || !volunteerForm.email || !volunteerForm.phone}
                className="w-full bg-red-800 hover:bg-red-900 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-2.5 rounded-lg text-sm font-semibold transition-colors"
              >
                Add Volunteer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Participant Dialog */}
      {addParticipantOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-40 p-4"
          onClick={() => setAddParticipantOpen(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center">
                  <Users size={16} className="text-red-800" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Add Participant</h2>
              </div>
              <button
                onClick={() => setAddParticipantOpen(false)}
                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={16} className="text-slate-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Search User <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or phone"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full h-10 pl-10 pr-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>

              {userSearch && (
                <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => {
                          setSelectedUserId(user.id);
                          setUserSearch(user.name);
                        }}
                        className="w-full p-3 text-left hover:bg-slate-50 border-b border-slate-100 last:border-0 transition-colors"
                      >
                        <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-600">{user.email}</p>
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500 text-center py-4">No users found</p>
                  )}
                </div>
              )}

              <button
                onClick={handleAddParticipant}
                disabled={!selectedUserId}
                className="w-full bg-red-800 hover:bg-red-900 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-2.5 rounded-lg text-sm font-semibold transition-colors"
              >
                Add Participant
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* ID Card Preview Dialog */}
      {idCardPreviewOpen && selectedVolunteer && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-40 p-4"
          onClick={() => setIdCardPreviewOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center">
                  <CreditCard size={16} className="text-blue-800" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Volunteer ID Card</h2>
              </div>
              <button
                onClick={() => setIdCardPreviewOpen(false)}
                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={16} className="text-slate-500" />
              </button>
            </div>

            <div className="p-6">
              <VolunteerIDCardPreview 
                volunteer={selectedVolunteer} 
                eventTitle={event.title}
              />
              
              <div className="mt-4 flex justify-center">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-blue-800 hover:bg-blue-900 text-white rounded-lg text-sm font-semibold transition-colors"
                >
                  Print ID Card
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

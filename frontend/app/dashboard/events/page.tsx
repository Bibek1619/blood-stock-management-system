'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus, CalendarDays, MapPin, Users,
  X, Clock, CheckCircle2, PlayCircle, ChevronRight, Home, Loader2,
} from "lucide-react";
import { useEvents, useCreateEvent, type EventStatus } from "@/lib/queries/events";
import { toast } from "sonner";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// Status configuration with icons
const STATUS_CONFIG: Record<EventStatus, {
  label: string;
  styles: string;
  icon: React.ReactNode;
  barColor: string;
}> = {
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

const ALL_STATUSES: EventStatus[] = ["UPCOMING", "RUNNING", "COMPLETED", "CANCELLED"];

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function EventsPage() {
  const router = useRouter();
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "", 
    eventDate: "", 
    location: "", 
    description: "", 
    status: "UPCOMING" as EventStatus,
    capacity: undefined as number | undefined,
  });

  // Fetch events using TanStack Query
  const { data: events = [], isLoading, error } = useEvents();
  const createEvent = useCreateEvent();

  const filtered = events.filter((e) =>
    filterStatus === "all" ? true : e.status === filterStatus
  );

  // Counts
  const counts = {
    all: events.length,
    UPCOMING: events.filter((e) => e.status === "UPCOMING").length,
    RUNNING: events.filter((e) => e.status === "RUNNING").length,
    COMPLETED: events.filter((e) => e.status === "COMPLETED").length,
    CANCELLED: events.filter((e) => e.status === "CANCELLED").length,
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
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create event");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      {/* ── Breadcrumbs ── */}
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
              <BreadcrumbPage>Events</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* ── Page Header ── */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center">
              <CalendarDays size={18} className="text-red-800" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Events</h1>
              <p className="text-sm text-slate-600 mt-0.5">Manage blood donation campaigns and drives</p>
            </div>
          </div>
          <button
            onClick={() => setDialogOpen(true)}
            className="flex items-center justify-center gap-2 bg-red-800 hover:bg-red-900 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm"
          >
            <Plus size={16} /> Create Event
          </button>
        </div>
      </div>

      {/* ── Filter Tabs ── */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex flex-wrap gap-2">
          {(["all", ...ALL_STATUSES] as const).map((key) => {
            const isActive = filterStatus === key;
            const cfg = key !== "all" ? STATUS_CONFIG[key] : null;
            return (
              <button
                key={key}
                onClick={() => setFilterStatus(key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                  isActive
                    ? cfg
                      ? `${cfg.styles} border`
                      : "bg-red-50 text-red-800 border-red-200"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-red-200 cursor-pointer"
                }`}
              >
                {cfg && <span className="flex">{cfg.icon}</span>}
                {key === "all" ? "All Events" : STATUS_CONFIG[key].label}
                <span
                  className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold ${
                    isActive
                      ? key === "all"
                        ? "bg-red-800 text-white"
                        : cfg
                        ? `${cfg.barColor} text-white`
                        : "bg-slate-800 text-white"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {key === "all" ? counts.all : counts[key]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Event Cards Grid ── */}
      <div className="max-w-7xl mx-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <Loader2 className="w-10 h-10 text-red-800 animate-spin mb-4" />
            <p className="text-sm font-semibold text-slate-600">Loading events...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <X size={24} className="text-red-600" />
            </div>
            <p className="text-sm font-semibold text-red-600 mb-1">Failed to load events</p>
            <p className="text-xs text-slate-500">Please refresh the page to try again</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <CalendarDays size={24} className="text-slate-400" />
            </div>
            <p className="text-sm font-semibold text-slate-600 mb-1">No events found</p>
            <p className="text-xs text-slate-500">Create your first event to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((ev) => {
              const cfg = STATUS_CONFIG[ev.status];
              const eventDate = new Date(ev.eventDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              });
              
              return (
                <div
                  key={ev.id}
                  onClick={() => router.push(`/dashboard/events/${ev.id}`)}
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                >
                  {/* Status bar at top */}
                  <div className={`h-1 ${cfg.barColor}`} />
                  
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <h3 className="text-sm font-bold text-slate-900 flex-1">{ev.title}</h3>
                      <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-semibold ${cfg.styles}`}>
                        {cfg.icon} {cfg.label}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1.5 mb-3">
                      <span className="flex items-center gap-2 text-xs text-slate-900">
                        <CalendarDays size={11} className="text-slate-400" />
                        {eventDate}
                      </span>
                      <span className="flex items-center gap-2 text-xs text-slate-900">
                        <MapPin size={11} className="text-slate-400" />
                        {ev.location}
                      </span>
                      <span className="flex items-center gap-2 text-xs text-slate-900">
                        <Users size={11} className="text-slate-400" />
                        {ev.participants?.length || 0} participant{ev.participants?.length !== 1 ? "s" : ""} · {ev.volunteers?.length || 0} volunteer{ev.volunteers?.length !== 1 ? "s" : ""}
                      </span>
                    </div>

                    {ev.description && (
                      <p className="text-xs text-slate-600 mb-3 line-clamp-2">{ev.description}</p>
                    )}

                    <span className="ml-auto flex items-center gap-1 pt-2 border-t border-slate-100 text-xs font-semibold text-red-800">
                      View details <ChevronRight size={12} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Create Event Dialog ── */}
      {dialogOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-40 p-4"
          onClick={() => setDialogOpen(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center">
                  <CalendarDays size={16} className="text-red-800" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Create Event</h2>
              </div>
              <button
                onClick={() => setDialogOpen(false)}
                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={16} className="text-slate-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Title <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Event title"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full h-10 px-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Date <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    value={newEvent.eventDate}
                    onChange={(e) => setNewEvent({ ...newEvent, eventDate: e.target.value })}
                    className="w-full h-10 px-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Status</label>
                  <select
                    value={newEvent.status}
                    onChange={(e) => setNewEvent({ ...newEvent, status: e.target.value as EventStatus })}
                    className="w-full h-10 px-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    {ALL_STATUSES.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Location <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Venue / Address"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    className="w-full h-10 px-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Capacity</label>
                  <input
                    type="number"
                    placeholder="Max participants"
                    value={newEvent.capacity || ''}
                    onChange={(e) => setNewEvent({ ...newEvent, capacity: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="w-full h-10 px-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Description</label>
                <textarea
                  placeholder="Optional details about the event…"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full h-20 px-3 py-2 border border-slate-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={handleCreate}
                className="w-full bg-red-800 hover:bg-red-900 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors"
              >
                Create Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

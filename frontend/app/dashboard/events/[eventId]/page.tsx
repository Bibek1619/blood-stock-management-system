'use client';
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft, CalendarDays, MapPin, Users, UserPlus,
  Clock, CheckCircle2, PlayCircle, Trash2, Edit2, Home,
} from "lucide-react";
import {
  EVENT_STATUS_CONFIG,
  getInitials,
  type EventStatus,
} from "@/lib/data";
import { useData } from "@/lib/data-store";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const STATUS_CONFIG_WITH_ICONS: Record<EventStatus, {
  label: string;
  styles: string;
  icon: React.ReactNode;
  barColor: string;
}> = {
  Upcoming: {
    ...EVENT_STATUS_CONFIG.Upcoming,
    icon: <Clock size={14} />,
  },
  Running: {
    ...EVENT_STATUS_CONFIG.Running,
    icon: <PlayCircle size={14} />,
  },
  Completed: {
    ...EVENT_STATUS_CONFIG.Completed,
    icon: <CheckCircle2 size={14} />,
  },
};

const ALL_STATUSES: EventStatus[] = ["Upcoming", "Running", "Completed"];

function useToast() {
  const [toasts, setToasts] = useState<{ id: number; msg: string; type: string }[]>([]);
  const add = (msg: string, type = "success") => {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  };
  return { toasts, toast: add };
}

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;
  
  const { 
    getEventById, 
    getDonorById, 
    updateEvent, 
    updateEventStatus, 
    addParticipant, 
    addVolunteer, 
    removeParticipant, 
    removeVolunteer,
    donors 
  } = useData();
  
  const event = getEventById(eventId);
  
  const [addDonorId, setAddDonorId] = useState("");
  const [addRole, setAddRole] = useState<"participants" | "volunteers">("participants");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: event?.title || "",
    date: event?.date || "",
    location: event?.location || "",
    description: event?.description || "",
  });

  const { toasts, toast } = useToast();

  if (!event) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <CalendarDays size={32} className="text-slate-400" />
          </div>
          <p className="text-sm font-semibold text-slate-600">Event not found</p>
          <button
            onClick={() => router.push("/dashboard/events")}
            className="mt-4 text-sm text-red-800 hover:underline"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  const handleUpdateStatus = (status: EventStatus) => {
    updateEventStatus(eventId, status);
    toast(`Status updated to ${status}`);
  };

  const handleAddPerson = () => {
    if (!addDonorId) return;
    if (addRole === "participants") {
      addParticipant(eventId, addDonorId);
    } else {
      addVolunteer(eventId, addDonorId);
    }
    setAddDonorId("");
    toast(`${addRole === "participants" ? "Participant" : "Volunteer"} added`);
  };

  const handleRemovePerson = (role: "participants" | "volunteers", donorId: string) => {
    if (role === "participants") {
      removeParticipant(eventId, donorId);
    } else {
      removeVolunteer(eventId, donorId);
    }
    toast("Person removed");
  };

  const handleSaveEdit = () => {
    if (!editForm.title || !editForm.date || !editForm.location) {
      toast("Title, date and location are required", "error");
      return;
    }
    updateEvent(eventId, editForm);
    setIsEditing(false);
    toast("Event updated successfully");
  };

  const cfg = STATUS_CONFIG_WITH_ICONS[event.status];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Toast Stack */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-2.5 rounded-lg border text-sm font-medium shadow-lg animate-in slide-in-from-right ${
              t.type === "error"
                ? "bg-red-50 border-red-200 text-red-800"
                : "bg-green-50 border-green-200 text-green-800"
            }`}
          >
            {t.msg}
          </div>
        ))}
      </div>

      {/* Header Banner */}
      <div className="relative bg-gradient-to-br from-red-800 via-red-900 to-red-950 px-6 py-8">
        <div className="max-w-5xl mx-auto mb-6">
          <Breadcrumb>
            <BreadcrumbList className="text-white/80">
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard" className="flex items-center gap-1 hover:text-white">
                  <Home size={14} /> Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-white/60" />
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard/events" className="hover:text-white">
                  Events
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-white/60" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-white font-medium">{event.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-2xl font-bold text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                />
              ) : (
                <h1 className="text-3xl font-bold text-white mb-3">{event.title}</h1>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm text-white/80">
                {isEditing ? (
                  <>
                    <input
                      type="date"
                      value={editForm.date}
                      onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                      className="bg-white/10 border border-white/20 rounded px-3 py-1 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
                    />
                    <input
                      type="text"
                      value={editForm.location}
                      onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                      placeholder="Location"
                      className="bg-white/10 border border-white/20 rounded px-3 py-1 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                    />
                  </>
                ) : (
                  <>
                    <span className="flex items-center gap-2">
                      <CalendarDays size={14} /> {event.date}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-white/40" />
                    <span className="flex items-center gap-2">
                      <MapPin size={14} /> {event.location}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSaveEdit}
                    className="px-4 py-2 bg-white text-red-900 rounded-lg text-sm font-semibold hover:bg-white/90 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditForm({
                        title: event.title,
                        date: event.date,
                        location: event.location,
                        description: event.description || "",
                      });
                    }}
                    className="px-4 py-2 bg-white/10 text-white border border-white/20 rounded-lg text-sm font-semibold hover:bg-white/20 transition-colors"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white border border-white/20 rounded-lg text-sm font-semibold hover:bg-white/20 transition-colors"
                >
                  <Edit2 size={14} /> Edit
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Strip */}
      <div className="max-w-5xl mx-auto px-6 -mt-6">
        <div className="flex items-center justify-around bg-white border border-slate-200 rounded-xl p-6 shadow-lg">
          <div className="flex flex-col items-center gap-2">
            <span className="text-3xl font-bold text-red-800">{event.participants.length}</span>
            <span className="text-xs text-slate-500 uppercase tracking-wide">Participants</span>
          </div>
          <div className="w-px h-12 bg-slate-200" />
          <div className="flex flex-col items-center gap-2">
            <span className="text-3xl font-bold text-red-800">{event.volunteers.length}</span>
            <span className="text-xs text-slate-500 uppercase tracking-wide">Volunteers</span>
          </div>
          <div className="w-px h-12 bg-slate-200" />
          <div className="flex flex-col items-center gap-2">
            <span className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold ${cfg.styles}`}>
              {cfg.icon} {event.status}
            </span>
            <span className="text-xs text-slate-500 uppercase tracking-wide">Status</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Description */}
        {(isEditing || event.description) && (
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h2 className="text-sm font-bold text-slate-900 mb-3">Description</h2>
            {isEditing ? (
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="Event description..."
                className="w-full h-24 px-3 py-2 border border-slate-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            ) : (
              <p className="text-sm text-slate-600 leading-relaxed">{event.description}</p>
            )}
          </div>
        )}

        {/* Update Status */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="text-sm font-bold text-slate-900 mb-3">Update Status</h2>
          <div className="flex gap-3">
            {ALL_STATUSES.map((st) => {
              const statusCfg = STATUS_CONFIG_WITH_ICONS[st];
              const isActive = event.status === st;
              return (
                <button
                  key={st}
                  onClick={() => handleUpdateStatus(st)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border text-sm font-semibold transition-all ${
                    isActive ? `${statusCfg.styles} border` : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {statusCfg.icon} {st}
                </button>
              );
            })}
          </div>
        </div>

        {/* Participants */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              Participants
              <span className="inline-flex items-center justify-center bg-red-50 text-red-800 rounded-full px-2.5 py-0.5 text-xs font-bold">
                {event.participants.length}
              </span>
            </h2>
          </div>
          
          <div className="space-y-2">
            {event.participants.length === 0 ? (
              <p className="text-sm text-slate-500 py-4 text-center">No participants yet</p>
            ) : (
              event.participants.map((pid) => {
                const d = getDonorById(pid);
                return d ? (
                  <div key={pid} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-red-50 border border-red-100 text-red-800 text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {getInitials(d.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="block text-sm font-semibold text-slate-900 truncate">{d.name}</span>
                      <span className="block text-xs text-slate-500">{d.bloodGroup} · {d.location}</span>
                    </div>
                    <span className="px-2.5 py-1 bg-red-50 text-red-800 border border-red-200 rounded text-xs font-bold">
                      {d.bloodGroup}
                    </span>
                    <button
                      onClick={() => handleRemovePerson("participants", pid)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                    >
                      <Trash2 size={14} className="text-slate-400 hover:text-red-600" />
                    </button>
                  </div>
                ) : null;
              })
            )}
          </div>
        </div>

        {/* Volunteers */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              Volunteers
              <span className="inline-flex items-center justify-center bg-red-50 text-red-800 rounded-full px-2.5 py-0.5 text-xs font-bold">
                {event.volunteers.length}
              </span>
            </h2>
          </div>
          
          <div className="space-y-2">
            {event.volunteers.length === 0 ? (
              <p className="text-sm text-slate-500 py-4 text-center">No volunteers yet</p>
            ) : (
              event.volunteers.map((vid) => {
                const d = getDonorById(vid);
                return d ? (
                  <div key={vid} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 text-blue-800 text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {getInitials(d.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="block text-sm font-semibold text-slate-900 truncate">{d.name}</span>
                      <span className="block text-xs text-slate-500">{d.bloodGroup} · {d.location}</span>
                    </div>
                    <button
                      onClick={() => handleRemovePerson("volunteers", vid)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                    >
                      <Trash2 size={14} className="text-slate-400 hover:text-red-600" />
                    </button>
                  </div>
                ) : null;
              })
            )}
          </div>
        </div>

        {/* Add Person */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="text-sm font-bold text-slate-900 mb-4">Add Person</h2>
          <div className="flex gap-3">
            <select
              value={addRole}
              onChange={(e) => setAddRole(e.target.value as "participants" | "volunteers")}
              className="h-10 px-3 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="participants">Participant</option>
              <option value="volunteers">Volunteer</option>
            </select>
            <select
              value={addDonorId}
              onChange={(e) => setAddDonorId(e.target.value)}
              className="flex-1 h-10 px-3 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">Select donor…</option>
              {donors.filter((d) =>
                !event.participants.includes(d.id) && !event.volunteers.includes(d.id)
              ).map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.bloodGroup})
                </option>
              ))}
            </select>
            <button
              onClick={handleAddPerson}
              disabled={!addDonorId}
              className="flex items-center gap-2 bg-red-800 hover:bg-red-900 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors"
            >
              <UserPlus size={16} /> Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

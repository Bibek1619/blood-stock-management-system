'use client';
import { useState } from "react";
import {
  Plus, CalendarDays, MapPin, Users, UserPlus,
  X, Clock, CheckCircle2, PlayCircle, ChevronRight, Trash2,
} from "lucide-react";
import {
  MOCK_DONORS,
  MOCK_EVENTS,
  EVENT_STATUS_CONFIG,
  getInitials,
  getDonorById,
  type EventStatus,
  type BloodEvent,
  type Donor,
} from "@/lib/data";

// Add icons to status config
const STATUS_CONFIG_WITH_ICONS: Record<EventStatus, {
  label: string;
  styles: string;
  icon: React.ReactNode;
  barColor: string;
  bg: string;
  text: string;
  border: string;
}> = {
  Upcoming: {
    ...EVENT_STATUS_CONFIG.Upcoming,
    icon: <Clock size={11} />,
  },
  Running: {
    ...EVENT_STATUS_CONFIG.Running,
    icon: <PlayCircle size={11} />,
  },
  Completed: {
    ...EVENT_STATUS_CONFIG.Completed,
    icon: <CheckCircle2 size={11} />,
  },
};

const ALL_STATUSES: EventStatus[] = ["Upcoming", "Running", "Completed"];
let eventCounter = MOCK_EVENTS.length + 1;

// ─── TOAST ────────────────────────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState<{ id: number; msg: string; type: string }[]>([]);
  const add = (msg: string, type = "success") => {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  };
  return { toasts, toast: add };
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function EventsPage() {
  const [events, setEvents] = useState<BloodEvent[]>(MOCK_EVENTS);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sheetEvent, setSheetEvent] = useState<BloodEvent | null>(null);
  const [addDonorId, setAddDonorId] = useState("");
  const [addRole, setAddRole] = useState<"participants" | "volunteers">("participants");
  const [newEvent, setNewEvent] = useState({
    title: "", date: "", location: "", description: "", status: "Upcoming" as EventStatus,
  });

  const { toasts, toast } = useToast();

  const filtered = events.filter((e) =>
    filterStatus === "all" ? true : e.status === filterStatus
  );

  // Counts
  const counts = {
    all: events.length,
    Upcoming: events.filter((e) => e.status === "Upcoming").length,
    Running: events.filter((e) => e.status === "Running").length,
    Completed: events.filter((e) => e.status === "Completed").length,
  };

  const handleCreate = () => {
    if (!newEvent.title || !newEvent.date || !newEvent.location) {
      toast("Title, date and location are required", "error");
      return;
    }
    const ev: BloodEvent = {
      id: `ev${eventCounter++}`,
      ...newEvent,
      participants: [],
      volunteers: [],
    };
    setEvents((prev) => [ev, ...prev]);
    setDialogOpen(false);
    setNewEvent({ title: "", date: "", location: "", description: "", status: "Upcoming" });
    toast("Event created successfully");
  };

  const updateStatus = (eventId: string, status: EventStatus) => {
    setEvents((prev) => prev.map((e) => (e.id === eventId ? { ...e, status } : e)));
    if (sheetEvent?.id === eventId) setSheetEvent((e) => e ? { ...e, status } : e);
    toast(`Status updated to ${status}`);
  };

  const handleAddPerson = () => {
    if (!addDonorId || !sheetEvent) return;
    setEvents((prev) => prev.map((e) => {
      if (e.id !== sheetEvent.id) return e;
      const list = [...new Set([...e[addRole], addDonorId])];
      return { ...e, [addRole]: list };
    }));
    setSheetEvent((e) => {
      if (!e) return e;
      const list = [...new Set([...e[addRole], addDonorId])];
      return { ...e, [addRole]: list };
    });
    setAddDonorId("");
    toast(`${addRole === "participants" ? "Participant" : "Volunteer"} added`);
  };

  const handleRemovePerson = (role: "participants" | "volunteers", donorId: string) => {
    if (!sheetEvent) return;
    setEvents((prev) => prev.map((e) => {
      if (e.id !== sheetEvent.id) return e;
      return { ...e, [role]: e[role].filter((id) => id !== donorId) };
    }));
    setSheetEvent((e) => {
      if (!e) return e;
      return { ...e, [role]: e[role].filter((id) => id !== donorId) };
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      {/* ── Toast Stack ── */}
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
            const cfg = key !== "all" ? STATUS_CONFIG_WITH_ICONS[key] : null;
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
  {key === "all" ? "All Events" : key}
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
        {filtered.length === 0 ? (
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
              const cfg = STATUS_CONFIG_WITH_ICONS[ev.status];
              return (
                <div
                  key={ev.id}
                  onClick={() => setSheetEvent(ev)}
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                >
                  {/* Status bar at top */}
                  <div className={`h-1 ${cfg.barColor}`} />
                  
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <h3 className="text-sm font-bold text-slate-900 flex-1">{ev.title}</h3>
                      <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-semibold ${cfg.styles}`}>
                        {cfg.icon} {ev.status}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1.5 mb-3">
                      <span className="flex items-center gap-2 text-xs text-slate-900">
                        <CalendarDays size={11} className="text-slate-400" />
                        {ev.date}
                      </span>
                      <span className="flex items-center gap-2 text-xs text-slate-900">
                        <MapPin size={11} className="text-slate-900" />
                        {ev.location}
                      </span>
                      <span className="flex items-center gap-2 text-xs text-slate-900 ">
                        <Users size={11} className="text-slate-900" />
                        {ev.participants.length} participant{ev.participants.length !== 1 ? "s" : ""} · {ev.volunteers.length} volunteer{ev.volunteers.length !== 1 ? "s" : ""}
                      </span>
                    </div>

                    {ev.description && (
                      <p className="text-xs text-slate-9s00 mb-3 line-clamp-2">{ev.description}</p>
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
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
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

      {/* ── Event Detail Sheet ── */}
      {sheetEvent && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-end z-50"
          onClick={() => setSheetEvent(null)}
        >
          <div
            className="w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Banner */}
            <div className="relative bg-gradient-to-br from-red-800 via-red-900 to-red-950 p-6 pb-10 text-center">
              <button
                onClick={() => setSheetEvent(null)}
                className="absolute top-4 right-4 p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X size={16} className="text-white" />
              </button>

              <div className="w-16 h-16 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center mx-auto mb-3">
                <CalendarDays size={28} className="text-white/90" />
              </div>

              <h2 className="text-xl font-bold text-white mb-2">{sheetEvent.title}</h2>
              
              <div className="flex items-center justify-center gap-2 text-xs text-white/80">
                <span className="flex items-center gap-1">
                  <CalendarDays size={11} /> {sheetEvent.date}
                </span>
                <span className="w-1 h-1 rounded-full bg-white/40" />
                <span className="flex items-center gap-1">
                  <MapPin size={11} /> {sheetEvent.location}
                </span>
              </div>
            </div>

            {/* Stats Strip */}
            <div className="flex items-center justify-around bg-white border border-slate-100 rounded-xl mx-4 -mt-6 p-4 shadow-lg relative z-10">
              <div className="flex flex-col items-center gap-1">
                <span className="text-lg font-bold text-red-800">{sheetEvent.participants.length}</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wide">Participants</span>
              </div>
              <div className="w-px h-8 bg-slate-200" />
              <div className="flex flex-col items-center gap-1">
                <span className="text-lg font-bold text-red-800">{sheetEvent.volunteers.length}</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wide">Volunteers</span>
              </div>
              <div className="w-px h-8 bg-slate-200" />
              <div className="flex flex-col items-center gap-1">
                <span className={`text-lg font-bold ${
                  sheetEvent.status === "Upcoming" ? "text-blue-700" :
                  sheetEvent.status === "Running" ? "text-green-700" : "text-slate-600"
                }`}>
                  {sheetEvent.status}
                </span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wide">Status</span>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Description */}
              {sheetEvent.description && (
                <p className="text-sm text-slate-600 leading-relaxed">{sheetEvent.description}</p>
              )}

              {/* ── Change Status ── */}
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Update Status</p>
                <div className="flex gap-2">
                  {ALL_STATUSES.map((st) => {
                    const cfg = STATUS_CONFIG_WITH_ICONS[st];
                    const isActive = sheetEvent.status === st;
                    return (
                      <button
                        key={st}
                        onClick={() => updateStatus(sheetEvent.id, st)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border text-xs font-semibold transition-all ${
                          isActive ? `${cfg.styles} border` : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <span className="flex">{cfg.icon}</span> {st}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── Participants ── */}
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                  Participants
                  <span className="inline-flex items-center justify-center bg-red-50 text-red-800 rounded-full px-2 py-0.5 text-[10px] font-bold">
                    {sheetEvent.participants.length}
                  </span>
                </p>
                <div className="bg-slate-50 border border-slate-100 rounded-xl overflow-hidden">
                  {sheetEvent.participants.length === 0 ? (
                    <p className="text-xs text-slate-500 p-3">No participants yet</p>
                  ) : (
                    sheetEvent.participants.map((pid) => {
                      const d = getDonorById(pid);
                      return d ? (
                        <div key={pid} className="flex items-center gap-3 p-3 border-b border-slate-100 last:border-0">
                          <div className="w-8 h-8 rounded-full bg-red-50 border border-red-100 text-red-800 text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                            {getInitials(d.name)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="block text-sm font-semibold text-slate-900 truncate">{d.name}</span>
                            <span className="block text-xs text-slate-500">{d.bloodGroup} · {d.location}</span>
                          </div>
                          <span className="px-2 py-1 bg-red-50 text-red-800 border border-red-200 rounded text-[10px] font-bold">
                            {d.bloodGroup}
                          </span>
                          <button
                            onClick={() => handleRemovePerson("participants", pid)}
                            className="p-1.5 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                          >
                            <Trash2 size={11} className="text-slate-400 hover:text-red-600" />
                          </button>
                        </div>
                      ) : null;
                    })
                  )}
                </div>
              </div>

              {/* ── Volunteers ── */}
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                  Volunteers
                  <span className="inline-flex items-center justify-center bg-red-50 text-red-800 rounded-full px-2 py-0.5 text-[10px] font-bold">
                    {sheetEvent.volunteers.length}
                  </span>
                </p>
                <div className="bg-slate-50 border border-slate-100 rounded-xl overflow-hidden">
                  {sheetEvent.volunteers.length === 0 ? (
                    <p className="text-xs text-slate-500 p-3">No volunteers yet</p>
                  ) : (
                    sheetEvent.volunteers.map((vid) => {
                      const d = getDonorById(vid);
                      return d ? (
                        <div key={vid} className="flex items-center gap-3 p-3 border-b border-slate-100 last:border-0">
                          <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 text-blue-800 text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                            {getInitials(d.name)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="block text-sm font-semibold text-slate-900 truncate">{d.name}</span>
                            <span className="block text-xs text-slate-500">{d.bloodGroup} · {d.location}</span>
                          </div>
                          <button
                            onClick={() => handleRemovePerson("volunteers", vid)}
                            className="p-1.5 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                          >
                            <Trash2 size={11} className="text-slate-400 hover:text-red-600" />
                          </button>
                        </div>
                      ) : null;
                    })
                  )}
                </div>
              </div>

              {/* ── Add Person ── */}
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Add Person</p>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-3">
                  <div className="flex gap-2">
                    <select
                      value={addRole}
                      onChange={(e) => setAddRole(e.target.value as "participants" | "volunteers")}
                      className="h-9 px-3 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="participants">Participant</option>
                      <option value="volunteers">Volunteer</option>
                    </select>
                    <select
                      value={addDonorId}
                      onChange={(e) => setAddDonorId(e.target.value)}
                      className="flex-1 h-9 px-3 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="">Select donor…</option>
                      {MOCK_DONORS.filter((d) =>
                        !sheetEvent.participants.includes(d.id) && !sheetEvent.volunteers.includes(d.id)
                      ).map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.bloodGroup})
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={handleAddPerson}
                    disabled={!addDonorId}
                    className="w-full flex items-center justify-center gap-2 bg-red-800 hover:bg-red-900 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-2.5 rounded-lg text-sm font-semibold transition-colors"
                  >
                    <UserPlus size={14} /> Add Person
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

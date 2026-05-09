'use client';
import { useRouter } from "next/navigation";
import { CalendarDays, MapPin, Users, Trash2, Droplets } from "lucide-react";
import type { EventStatus } from "@/lib/queries/events";
import { EVENT_STATUS_CONFIG, ALL_STATUSES } from "@/lib/eventStatusConfig";

interface EventHeaderProps {
  event: any;
  eventId: string;
  onStatusChange: (status: EventStatus) => void;
  onDelete: () => void;
}

export function EventHeader({ event, eventId, onStatusChange, onDelete }: EventHeaderProps) {
  const router = useRouter();
  const cfg = EVENT_STATUS_CONFIG[event.status as EventStatus];
  const eventDate = new Date(event.eventDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className={`h-2 ${cfg.barColor}`} />
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-slate-900">{event.title}</h1>
              <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold ${cfg.color}`}>
                {cfg.icon} {cfg.label}
              </span>
            </div>
            {event.description && (
              <p className="text-sm text-slate-600">{event.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-sm font-semibold transition-colors border border-red-200"
            >
              <Trash2 size={14} /> Delete Event
            </button>
            {event.status === 'RUNNING' && (
              <button
                onClick={() => router.push(`/dashboard/blood-donate/blood-collection?eventId=${eventId}`)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                <Droplets size={14} /> Add Blood
              </button>
            )}
          </div>
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
              const statusCfg = EVENT_STATUS_CONFIG[status];
              const isActive = event.status === status;
              return (
                <button
                  key={status}
                  onClick={() => onStatusChange(status)}
                  disabled={isActive}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    isActive
                      ? `${statusCfg.color} cursor-default`
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
  );
}

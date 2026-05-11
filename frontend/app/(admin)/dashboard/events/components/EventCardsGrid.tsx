import { CalendarDays, ChevronRight, Loader2, MapPin, Users, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Event, EventStatus } from "@/lib/queries/events";
import { STATUS_CONFIG } from "./statusConfig";

interface EventCardsGridProps {
  filteredEvents: Event[];
  isLoading: boolean;
  error: unknown;
  onViewEvent: (id: string) => void;
}

export function EventCardsGrid({ filteredEvents, isLoading, error, onViewEvent }: EventCardsGridProps) {
  return (
    <div className="mx-auto max-w-7xl">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center px-4 py-16">
          <Loader2 className="mb-4 h-10 w-10 animate-spin text-red-800" />
          <p className="text-sm font-semibold text-slate-600">Loading events...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center px-4 py-16">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
            <X size={24} className="text-red-600" />
          </div>
          <p className="mb-1 text-sm font-semibold text-red-600">Failed to load events</p>
          <p className="text-xs text-slate-500">Please refresh the page to try again</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-4 py-16">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
            <CalendarDays size={24} className="text-slate-400" />
          </div>
          <p className="mb-1 text-sm font-semibold text-slate-600">No events found</p>
          <p className="text-xs text-slate-500">Create your first event to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => {
            const cfg = STATUS_CONFIG[event.status as EventStatus];
            const eventDate = new Date(event.eventDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            });

            return (
              <Card
                key={event.id}
                className="cursor-pointer overflow-hidden border-slate-200 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                onClick={() => onViewEvent(event.id)}
              >
                <div className={`h-1 ${cfg.barColor}`} />
                <CardContent className="p-4">
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <h3 className="flex-1 text-sm font-bold text-slate-900">{event.title}</h3>
                    <span className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${cfg.color}`}>
                      {cfg.icon} {cfg.label}
                    </span>
                  </div>

                  <div className="mb-3 flex flex-col gap-1.5">
                    <span className="flex items-center gap-2 text-xs text-slate-900">
                      <CalendarDays size={11} className="text-slate-400" />
                      {eventDate}
                    </span>
                    <span className="flex items-center gap-2 text-xs text-slate-900">
                      <MapPin size={11} className="text-slate-400" />
                      {event.location}
                    </span>
                    <span className="flex items-center gap-2 text-xs text-slate-900">
                      <Users size={11} className="text-slate-400" />
                      {event.participants?.length || 0} participant{event.participants?.length !== 1 ? "s" : ""} · {event.volunteers?.length || 0} volunteer{event.volunteers?.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {event.description && <p className="mb-3 line-clamp-2 text-xs text-slate-600">{event.description}</p>}

                  <div className="flex items-center gap-1 border-t border-slate-100 pt-2 text-xs font-semibold text-red-800">
                    View details <ChevronRight size={12} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

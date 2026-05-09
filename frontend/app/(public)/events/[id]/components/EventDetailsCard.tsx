import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Clock, MapPin } from "lucide-react";
import { format } from "date-fns";
import type { Event } from "@/lib/queries/events";

interface EventDetailsCardProps {
  event: Event;
}

export function EventDetailsCard({ event }: EventDetailsCardProps) {
  const eventDate = new Date(event.eventDate);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Event Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3">
          <CalendarDays className="h-5 w-5 text-gray-500 mt-0.5" />
          <div>
            <p className="font-medium text-gray-900">Date</p>
            <p className="text-gray-600">{format(eventDate, 'EEEE, MMMM d, yyyy')}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
          <div>
            <p className="font-medium text-gray-900">Time</p>
            <p className="text-gray-600">{format(eventDate, 'h:mm a')}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
          <div>
            <p className="font-medium text-gray-900">Location</p>
            <p className="text-gray-600">{event.location}</p>
          </div>
        </div>

        {event.description && (
          <div className="pt-4 border-t">
            <p className="font-medium text-gray-900 mb-2">Description</p>
            <p className="text-gray-600 leading-relaxed">{event.description}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

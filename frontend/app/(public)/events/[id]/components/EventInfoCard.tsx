import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import type { Event } from "@/lib/queries/events";

interface EventInfoCardProps {
  event: Event;
}

export function EventInfoCard({ event }: EventInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Event Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div>
          <p className="text-gray-600">Event ID</p>
          <p className="font-mono text-xs text-gray-900">{event.id}</p>
        </div>
        {event.capacity && (
          <div>
            <p className="text-gray-600">Capacity</p>
            <p className="text-gray-900">{event.capacity} people</p>
          </div>
        )}
        <div>
          <p className="text-gray-600">Created</p>
          <p className="text-gray-900">{format(new Date(event.createdAt), 'MMM d, yyyy')}</p>
        </div>
      </CardContent>
    </Card>
  );
}

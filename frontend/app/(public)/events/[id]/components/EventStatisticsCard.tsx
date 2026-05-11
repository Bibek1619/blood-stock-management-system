import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck } from "lucide-react";
import type { Event } from "@/lib/queries/events";

interface EventStatisticsCardProps {
  event: Event;
}

export function EventStatisticsCard({ event }: EventStatisticsCardProps) {
  const participantCount = event.participants?.length || 0;
  const volunteerCount = event.volunteers?.length || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Event Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
            <Users className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-blue-900">{participantCount}</p>
              <p className="text-sm text-blue-700">Participants</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
            <UserCheck className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-green-900">{volunteerCount}</p>
              <p className="text-sm text-green-700">Volunteers</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

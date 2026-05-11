import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import Link from "next/link";
import type { Event } from "@/lib/queries/events";

interface EventRegistrationCardProps {
  event: Event;
}

export function EventRegistrationCard({ event }: EventRegistrationCardProps) {
  const participantCount = event.participants?.length || 0;
  const spotsRemaining = event.capacity ? event.capacity - participantCount : null;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-center mb-4">
          <Heart className="h-12 w-12 text-red-600 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">Join This Event</h3>
          {event.capacity && (
            <p className="text-sm text-gray-600">
              {spotsRemaining !== null && spotsRemaining > 0 ? (
                <span className="text-green-600 font-medium">
                  {spotsRemaining} spots remaining
                </span>
              ) : (
                <span className="text-red-600 font-medium">Event is full</span>
              )}
            </p>
          )}
        </div>

        {event.status === 'UPCOMING' || event.status === 'RUNNING' ? (
          <div className="space-y-3">
            <Link href="/login">
              <Button 
                className="w-full bg-red-600 hover:bg-red-700"
                disabled={spotsRemaining !== null && spotsRemaining <= 0}
              >
                Register as Participant
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="w-full">
                Volunteer for Event
              </Button>
            </Link>
          </div>
        ) : (
          <p className="text-sm text-gray-600 text-center">
            Registration is {event.status === 'COMPLETED' ? 'closed' : 'not available'}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

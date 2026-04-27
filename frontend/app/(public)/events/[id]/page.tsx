'use client';

import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CalendarDays, 
  MapPin, 
  Users, 
  Clock, 
  AlertCircle,
  ArrowLeft,
  UserCheck,
  Heart
} from "lucide-react";
import Link from "next/link";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import { format } from "date-fns";
import { useHasMounted } from "@/hooks/useHasMounted";
import { useEvent } from "@/lib/queries/events";

export default function EventDetailPage() {
  const hasMounted = useHasMounted();
  const params = useParams();
  const eventId = params.id as string;

  const { data: event, isLoading, error } = useEvent(eventId);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; label: string }> = {
      UPCOMING: { color: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Upcoming' },
      ONGOING: { color: 'bg-green-50 text-green-700 border-green-200', label: 'Ongoing' },
      COMPLETED: { color: 'bg-gray-50 text-gray-700 border-gray-200', label: 'Completed' },
      CANCELLED: { color: 'bg-red-50 text-red-700 border-red-200', label: 'Cancelled' },
    };
    return variants[status] || variants.UPCOMING;
  };

  if (!hasMounted || isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <PublicNav />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading event details...</p>
          </div>
        </main>
        <PublicFooter />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex flex-col">
        <PublicNav />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <p className="text-gray-900 font-semibold mb-2">Event Not Found</p>
            <p className="text-gray-600 mb-6">
              {error instanceof Error ? error.message : 'The event you are looking for does not exist.'}
            </p>
            <Link href="/events">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Events
              </Button>
            </Link>
          </div>
        </main>
        <PublicFooter />
      </div>
    );
  }

  const statusBadge = getStatusBadge(event.status);
  const eventDate = new Date(event.eventDate);
  const participantCount = event.participants?.length || 0;
  const volunteerCount = event.volunteers?.length || 0;
  const spotsRemaining = event.capacity ? event.capacity - participantCount : null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <PublicNav />
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
          {/* Back Button */}
          <Link href="/events" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Events
          </Link>

          {/* Event Header */}
          <div className="mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <Badge variant="outline" className={`text-xs mb-3 ${statusBadge.color}`}>
                  {statusBadge.label}
                </Badge>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.title}</h1>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Event Details Card */}
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

              {/* Participants & Volunteers */}
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
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Registration Card */}
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

              {/* Event Info */}
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
            </div>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}

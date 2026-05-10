'use client';

import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import { useHasMounted } from "@/hooks/useHasMounted";
import { useEvent } from "@/lib/queries/events";
import { getStatusBadge } from "@/lib/eventStatusConfig";
import {
  EventDetailsCard,
  EventStatisticsCard,
  EventRegistrationCard,
  EventInfoCard,
} from "./components";

export default function EventDetailPage() {
  const hasMounted = useHasMounted();
  const params = useParams();
  const eventId = params.id as string;

  const { data: event, isLoading, error } = useEvent(eventId);

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
              <EventDetailsCard event={event} />
              <EventStatisticsCard event={event} />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <EventRegistrationCard event={event} />
              <EventInfoCard event={event} />
            </div>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}

'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, Users, Clock } from "lucide-react";
import Link from "next/link";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";

export default function PublicEventsPage() {
  const events = [
    {
      id: 1,
      title: "Community Blood Drive - Downtown",
      date: "April 20, 2026",
      time: "9:00 AM - 5:00 PM",
      location: "Downtown Community Center, 123 Main St",
      participants: 45,
      description: "Join us for our monthly blood drive. All blood types needed. Refreshments provided.",
    },
    {
      id: 2,
      title: "University Campus Blood Donation",
      date: "April 25, 2026",
      time: "10:00 AM - 4:00 PM",
      location: "State University Student Center",
      participants: 32,
      description: "Special campus event for students and faculty. Free health screening included.",
    },
    {
      id: 3,
      title: "Corporate Blood Donation Day",
      date: "May 1, 2026",
      time: "8:00 AM - 2:00 PM",
      location: "Tech Park Business Complex",
      participants: 28,
      description: "Corporate partnership event. Open to all employees and their families.",
    },
    {
      id: 4,
      title: "Weekend Blood Drive - Westside",
      date: "May 5, 2026",
      time: "11:00 AM - 6:00 PM",
      location: "Westside Medical Center",
      participants: 18,
      description: "Weekend convenience drive. Walk-ins welcome, appointments preferred.",
    },
    {
      id: 5,
      title: "Emergency Blood Collection",
      date: "May 10, 2026",
      time: "7:00 AM - 7:00 PM",
      location: "Central Hospital Blood Bank",
      participants: 52,
      description: "Urgent need for O- and AB+ blood types. All donors appreciated.",
    },
    {
      id: 6,
      title: "Spring Community Health Fair",
      date: "May 15, 2026",
      time: "9:00 AM - 3:00 PM",
      location: "City Park Pavilion",
      participants: 38,
      description: "Blood donation booth at our annual health fair. Family-friendly event.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <PublicNav />
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-12 animate-fade-in">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Upcoming Events</h1>
        <p className="text-gray-600 mt-2">Join a blood donation drive near you</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((e) => (
          <Card key={e.id} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <Badge variant="outline" className="text-[10px] mb-3 bg-red-50 text-red-700 border-red-200">
                Upcoming
              </Badge>
              <h3 className="font-semibold text-gray-900 mb-3">{e.title}</h3>
              
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <p className="flex items-center gap-2">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {e.date}
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5" />
                  {e.time}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5" />
                  {e.location}
                </p>
                <p className="flex items-center gap-2">
                  <Users className="h-3.5 w-3.5" />
                  {e.participants} registered
                </p>
              </div>

              {e.description && (
                <p className="text-xs text-gray-600 mb-4 line-clamp-2">{e.description}</p>
              )}

              <Link href="/login">
                <Button size="sm" className="w-full bg-red-600 hover:bg-red-700">
                  Register for Event
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}

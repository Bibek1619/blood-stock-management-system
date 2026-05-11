'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar, Home, Users, ArrowLeft, Loader2, AlertCircle, Droplets, Target,
} from 'lucide-react';
import {
  PieChart as RechartsPieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useEvents } from "@/lib/queries/events";
import { useDonationsByEvent } from "@/lib/queries/donations";

// Blood group colors for charts
const BLOOD_GROUP_COLORS = {
  'A+': '#ef4444', 'A-': '#dc2626', 'B+': '#f97316', 'B-': '#ea580c',
  'AB+': '#8b5cf6', 'AB-': '#7c3aed', 'O+': '#10b981', 'O-': '#059669'
};

export default function EventReportsPage() {
  const router = useRouter();
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all events
  const { data: events = [], isLoading: eventsLoading } = useEvents();
  
  // Fetch donations for selected event
  const { data: eventDonations = [], isLoading: donationsLoading } = useDonationsByEvent(selectedEventId);

  // Get selected event details
  const selectedEvent = events.find(e => e.id === selectedEventId);

  // Process donation data for charts
  const chartData = useMemo(() => {
    if (!eventDonations.length) return { bloodGroupData: [], totalStats: null };

    // Group by blood group
    const bloodGroupStats: Record<string, { units: number; donors: number }> = {};
    
    eventDonations.forEach(donation => {
      const bloodGroup = donation.bloodGroup.replace('_POSITIVE', '+').replace('_NEGATIVE', '-').replace('_', '');
      if (!bloodGroupStats[bloodGroup]) {
        bloodGroupStats[bloodGroup] = { units: 0, donors: 0 };
      }
      bloodGroupStats[bloodGroup].units += donation.units;
      bloodGroupStats[bloodGroup].donors += 1;
    });

    // Convert to chart format
    const bloodGroupData = Object.entries(bloodGroupStats).map(([group, stats]) => ({
      name: group,
      units: stats.units,
      donors: stats.donors,
      color: BLOOD_GROUP_COLORS[group as keyof typeof BLOOD_GROUP_COLORS] || '#64748b'
    }));

    // Calculate totals
    const totalUnits = eventDonations.reduce((sum, d) => sum + d.units, 0);
    const totalDonors = eventDonations.length;
    const totalVolume = totalUnits * 450; // ml per unit
    const uniqueBloodGroups = Object.keys(bloodGroupStats).length;

    return {
      bloodGroupData,
      totalStats: {
        totalUnits,
        totalDonors,
        totalVolume,
        uniqueBloodGroups
      }
    };
  }, [eventDonations]);

  // Custom tooltip for pie chart showing percentages
  const PercentageTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    
    const data = payload[0];
    const total = chartData.totalStats?.totalUnits || 0;
    const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : '0';
    
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-lg">
        <p className="text-sm font-semibold text-slate-900 mb-1">{data.payload.name}</p>
        <p className="text-sm text-slate-600">
          {data.value} units ({percentage}%)
        </p>
      </div>
    );
  };

  const formatEventDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const formatEventTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (eventsLoading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#7F1D1D]" />
          <p className="text-sm text-slate-600">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-6 md:p-8 bg-slate-50 min-h-[calc(100vh-3.5rem)]">
      {/* Breadcrumbs */}
      <div className="mb-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard" className="flex items-center gap-1">
                <Home size={14} /> Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard/reports">Reports</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Event Analysis</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard/reports')}
            className="gap-2"
          >
            <ArrowLeft size={16} />
            Back to Reports
          </Button>
          <div className="w-10 h-10 rounded-lg bg-[#7F1D1D]/10 border border-[#7F1D1D]/20 flex items-center justify-center">
            <Calendar size={18} className="text-[#7F1D1D]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Event Analysis</h1>
            <p className="text-sm text-slate-600">Detailed blood collection performance by event</p>
          </div>
        </div>
      </div>

      {/* Event Selection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target size={18} className="text-[#7F1D1D]" />
            Select Event for Analysis
          </CardTitle>
          <CardDescription>
            Choose an event to view detailed blood collection statistics and performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-w-md">
            <Select value={selectedEventId} onValueChange={setSelectedEventId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose an event to analyze..." />
              </SelectTrigger>
              <SelectContent>
                {events.length > 0 ? (
                  events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      <div className="flex items-center justify-between w-full">
                        <span className="font-medium">{event.title}</span>
                        <span className="text-xs text-slate-500 ml-2">
                          {formatEventTime(event.eventDate)}
                        </span>
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="" disabled>
                    No events available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Event Details & Analysis */}
      {selectedEvent && (
        <>
          {/* Event Header - Simplified */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">{selectedEvent.title}</h2>
                  <p className="text-sm text-slate-600">
                    {formatEventDate(selectedEvent.eventDate)} • {selectedEvent.location}
                  </p>
                </div>
                
                {/* Simple Stats on the Side */}
                {chartData.totalStats && (
                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-[#7F1D1D]">
                        {chartData.totalStats.totalUnits}
                      </div>
                      <p className="text-xs text-slate-500">Total Collection</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {chartData.totalStats.totalDonors}
                      </div>
                      <p className="text-xs text-slate-500">Total Donors</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Loading State for Donations */}
          {donationsLoading && (
            <Card className="mb-6">
              <CardContent className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-[#7F1D1D]" />
                  <p className="text-sm text-slate-600">Loading blood collection data...</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Charts - Bar and Pie */}
          {!donationsLoading && chartData.bloodGroupData.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Bar Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Blood Collection by Group</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={chartData.bloodGroupData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 12, fill: '#64748b' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: '#94a3b8' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip content={<PercentageTooltip />} />
                      <Bar
                        dataKey="units"
                        fill="#7F1D1D"
                        radius={[4, 4, 0, 0]}
                        name="Units"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Distribution by Blood Group</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <RechartsPieChart>
                      <Pie
                        data={chartData.bloodGroupData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={160}
                        paddingAngle={3}
                        dataKey="units"
                      >
                        {chartData.bloodGroupData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<PercentageTooltip />} />
                      <Legend 
                        wrapperStyle={{ fontSize: '14px' }}
                        iconType="circle"
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}

          {/* No Data State */}
          {!donationsLoading && eventDonations.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertCircle size={48} className="text-slate-400 mb-4" />
                <h3 className="text-lg font-semibold text-slate-700 mb-2">No Blood Collection Data</h3>
                <p className="text-sm text-slate-500 text-center max-w-md">
                  No blood donations have been recorded for this event yet. 
                  {selectedEvent.status === 'RUNNING' && (
                    <span className="block mt-2">
                      Start collecting blood donations to see detailed analytics here.
                    </span>
                  )}
                </p>
                {selectedEvent.status === 'RUNNING' && (
                  <Button
                    onClick={() => router.push(`/dashboard/blood-donate/blood-collection?eventId=${selectedEvent.id}`)}
                    className="mt-4 bg-[#7F1D1D] hover:bg-[#991B1B]"
                  >
                    <Droplets size={16} className="mr-2" />
                    Start Blood Collection
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* No Event Selected State */}
      {!selectedEventId && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Calendar size={64} className="text-slate-300 mb-6" />
            <h3 className="text-xl font-semibold text-slate-700 mb-3">Select an Event to Analyze</h3>
            <p className="text-sm text-slate-500 text-center max-w-md mb-6">
              Choose an event from the dropdown above to view detailed blood collection analytics, 
              donor statistics, and performance metrics.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>Collection Charts</span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={16} />
                <span>Donor Statistics</span>
              </div>
              <div className="flex items-center gap-2">
                <Target size={16} />
                <span>Performance Metrics</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
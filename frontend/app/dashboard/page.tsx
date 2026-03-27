'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Users, Droplet, Calendar, AlertCircle, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// ── Mock Data ──────────────────────────────────────────────────────────────────

const MOCK_BLOOD_STOCK = [
  { bloodGroup: 'A+',  units: 12 },
  { bloodGroup: 'A-',  units: 4  },
  { bloodGroup: 'B+',  units: 8  },
  { bloodGroup: 'B-',  units: 2  },
  { bloodGroup: 'O+',  units: 15 },
  { bloodGroup: 'O-',  units: 3  },
  { bloodGroup: 'AB+', units: 6  },
  { bloodGroup: 'AB-', units: 1  },
];

const MOCK_DONORS = [
  { name: 'Aarav Sharma',    bloodGroup: 'O+',  location: 'Kathmandu',  totalDonations: 5 },
  { name: 'Priya Thapa',     bloodGroup: 'A+',  location: 'Lalitpur',   totalDonations: 3 },
  { name: 'Rohan Karki',     bloodGroup: 'B-',  location: 'Bhaktapur',  totalDonations: 1 },
  { name: 'Sita Poudel',     bloodGroup: 'AB+', location: 'Pokhara',    totalDonations: 7 },
  { name: 'Bikash Rai',      bloodGroup: 'O-',  location: 'Kathmandu',  totalDonations: 2 },
  { name: 'Anita Gurung',    bloodGroup: 'A-',  location: 'Chitwan',    totalDonations: 4 },
];

const MOCK_EVENTS = [
  { title: 'Community Blood Drive',   location: 'Ratna Park, Kathmandu', status: 'Upcoming' },
  { title: 'Hospital Collection Day', location: 'Bir Hospital',          status: 'Running'  },
  { title: 'University Camp',         location: 'TU Campus, Kirtipur',   status: 'Upcoming' },
  { title: 'Corporate Donation Drive',location: 'Durbarmarg Office Hub', status: 'Completed'},
];

// ──────────────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalDonors: 0,
    totalBloodUnits: 0,
    lowStockUnits: 0,
    upcomingEvents: 0,
    totalDonations: 0,
    activeDonors: 0,
  });
  const [bloodData, setBloodData] = useState<any[]>([]);
  const [lowStockAlerts, setLowStockAlerts] = useState<any[]>([]);
  const [bloodDistribution, setBloodDistribution] = useState<any[]>([]);
  const [recentDonors, setRecentDonors] = useState<any[]>([]);
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate async load with mock data
    const loadMockData = () => {
      const bloodAllData = MOCK_BLOOD_STOCK;
      const donors      = MOCK_DONORS;
      const events      = MOCK_EVENTS;

      const lowStock = bloodAllData.filter((pack) => pack.units < 5);
      setLowStockAlerts(lowStock);

      const distribution: Record<string, number> = {};
      bloodAllData.forEach((pack) => {
        distribution[pack.bloodGroup] = (distribution[pack.bloodGroup] || 0) + pack.units;
      });
      const bloodDist = Object.entries(distribution).map(([group, units]) => ({
        name: group,
        value: units,
      }));
      setBloodDistribution(bloodDist);

      const chartData = bloodAllData.map((pack) => ({
        name: pack.bloodGroup,
        units: pack.units,
      }));
      setBloodData(chartData);

      setRecentDonors(donors.slice(0, 5));
      setRecentEvents(events.slice(0, 4));

      const activeDonorsCount = donors.filter((d) => d.totalDonations > 0).length;

      setStats({
        totalDonors:      donors.length,
        activeDonors:     activeDonorsCount,
        totalBloodUnits:  bloodAllData.reduce((acc, pack) => acc + pack.units, 0),
        lowStockUnits:    lowStock.length,
        upcomingEvents:   events.filter((e) => e.status === 'Upcoming').length,
        totalDonations:   donors.reduce((acc, d) => acc + d.totalDonations, 0),
      });

      setLoading(false);
    };

    // Small delay to mimic a real fetch
    const timer = setTimeout(loadMockData, 400);
    return () => clearTimeout(timer);
  }, []);

  const COLORS = ['#7F1D1D', '#A03A3A', '#C04040', '#E04A4A', '#F05858', '#F07070', '#F08888', '#F0A0A0'];

  const getStockStatusColor = (units: number) => {
    if (units < 3) return 'bg-red-50 border-red-200 text-red-700';
    if (units < 5) return 'bg-orange-50 border-orange-200 text-orange-700';
    return 'bg-green-50 border-green-200 text-green-700';
  };

  const getStatusIcon = (units: number) => {
    if (units < 3) return '🔴';
    if (units < 5) return '🟠';
    return '🟢';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-muted border-t-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-background">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Blood bank management overview and analytics</p>
        </div>
      </div>

      {lowStockAlerts.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <CardTitle className="text-red-900">Low Stock Alerts</CardTitle>
            </div>
            <CardDescription className="text-red-800">
              {lowStockAlerts.length} blood group{lowStockAlerts.length !== 1 ? 's' : ''} running low
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {lowStockAlerts.slice(0, 4).map((alert, index) => (
                <div key={index} className={`p-3 rounded-lg border ${getStockStatusColor(alert.units)}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm">{alert.bloodGroup}</p>
                      <p className="text-xs opacity-80">{alert.units} units remaining</p>
                    </div>
                    <span className="text-xl">{getStatusIcon(alert.units)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Blood Units</CardTitle>
            <Droplet className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.totalBloodUnits}</div>
            <p className="text-xs text-muted-foreground">In stock across all groups</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Units</CardTitle>
            <AlertCircle className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.lowStockUnits}</div>
            <p className="text-xs text-muted-foreground">Requires immediate action</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Donors</CardTitle>
            <Heart className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDonors}</div>
            <p className="text-xs text-muted-foreground">{stats.activeDonors} active this month</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Calendar className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingEvents}</div>
            <p className="text-xs text-muted-foreground">Scheduled collections</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Blood Stock by Group
            </CardTitle>
            <CardDescription>Current units available</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={bloodData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)\" />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }} />
                <Bar dataKey="units" fill="#8884d8" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Blood Type Distribution</CardTitle>
            <CardDescription>Units by type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={bloodDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {bloodDistribution.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value} units`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Recent Donors
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <a href="/dashboard/donors">View All</a>
              </Button>
            </div>
            <CardDescription>Latest registered donors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentDonors.map((donor, index) => (
                <div key={index} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-semibold text-sm">{donor.name.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{donor.name}</p>
                      <p className="text-xs text-muted-foreground">{donor.bloodGroup} • {donor.location}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-primary">{donor.totalDonations}x</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Recent Events
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <a href="/dashboard/events">View All</a>
              </Button>
            </div>
            <CardDescription>Upcoming and recent activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentEvents.map((event, index) => (
                <div key={index} className="border border-border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{event.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{event.location}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                      event.status === 'Upcoming'  ? 'bg-blue-100 text-blue-700'  :
                      event.status === 'Running'   ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {event.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
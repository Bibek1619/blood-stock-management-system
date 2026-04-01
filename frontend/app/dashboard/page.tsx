'use client';

import { useEffect, useState } from 'react';
import {
  Heart, Users, Droplet, Calendar, AlertCircle,
  TrendingUp, Activity, ArrowRight,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

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
  { name: 'Aarav Sharma',  bloodGroup: 'O+',  location: 'Kathmandu', totalDonations: 5 },
  { name: 'Priya Thapa',   bloodGroup: 'A+',  location: 'Lalitpur',  totalDonations: 3 },
  { name: 'Rohan Karki',   bloodGroup: 'B-',  location: 'Bhaktapur', totalDonations: 1 },
  { name: 'Sita Poudel',   bloodGroup: 'AB+', location: 'Pokhara',   totalDonations: 7 },
  { name: 'Bikash Rai',    bloodGroup: 'O-',  location: 'Kathmandu', totalDonations: 2 },
  { name: 'Anita Gurung',  bloodGroup: 'A-',  location: 'Chitwan',   totalDonations: 4 },
];

const MOCK_EVENTS = [
  { title: 'Community Blood Drive',    location: 'Ratna Park, Kathmandu', status: 'Upcoming'  },
  { title: 'Hospital Collection Day',  location: 'Bir Hospital',          status: 'Running'   },
  { title: 'University Camp',          location: 'TU Campus, Kirtipur',   status: 'Upcoming'  },
  { title: 'Corporate Donation Drive', location: 'Durbarmarg Office Hub', status: 'Completed' },
];

// ── Config ─────────────────────────────────────────────────────────────────────
const PIE_COLORS = ['#7F1D1D','#991B1B','#B91C1C','#C04040','#DC2626','#E04A4A','#EF4444','#F87171'];

const EVENT_STATUS = {
  Upcoming:  { bg: 'rgba(59,130,246,0.08)',  text: '#1d4ed8', border: 'rgba(59,130,246,0.2)'  },
  Running:   { bg: 'rgba(21,128,61,0.08)',   text: '#15803d', border: 'rgba(21,128,61,0.2)'   },
  Completed: { bg: 'rgba(100,116,139,0.08)', text: '#475569', border: 'rgba(100,116,139,0.2)' },
};

// ── Custom Tooltip ─────────────────────────────────────────────────────────────
const CustomBarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={s.tooltip}>
      <p style={s.tooltipLabel}>{label}</p>
      <p style={s.tooltipValue}>{payload[0].value} units</p>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalDonors: 0, totalBloodUnits: 0, lowStockUnits: 0,
    upcomingEvents: 0, totalDonations: 0, activeDonors: 0,
  });
  const [bloodData, setBloodData]                   = useState([]);
  const [lowStockAlerts, setLowStockAlerts]         = useState([]);
  const [bloodDistribution, setBloodDistribution]   = useState([]);
  const [recentDonors, setRecentDonors]             = useState([]);
  const [recentEvents, setRecentEvents]             = useState([]);
  const [loading, setLoading]                       = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      const bloodAllData = MOCK_BLOOD_STOCK;
      const donors       = MOCK_DONORS;
      const events       = MOCK_EVENTS;

      const lowStock = bloodAllData.filter((p) => p.units < 5);
      setLowStockAlerts(lowStock);
      setBloodData(bloodAllData.map((p) => ({ name: p.bloodGroup, units: p.units })));
      setBloodDistribution(bloodAllData.map((p) => ({ name: p.bloodGroup, value: p.units })));
      setRecentDonors(donors.slice(0, 5));
      setRecentEvents(events.slice(0, 4));
      setStats({
        totalDonors:     donors.length,
        activeDonors:    donors.filter((d) => d.totalDonations > 0).length,
        totalBloodUnits: bloodAllData.reduce((a, p) => a + p.units, 0),
        lowStockUnits:   lowStock.length,
        upcomingEvents:  events.filter((e) => e.status === 'Upcoming').length,
        totalDonations:  donors.reduce((a, d) => a + d.totalDonations, 0),
      });
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div style={s.loadingWrap}>
        <div style={s.spinner} />
      </div>
    );
  }

  return (
    <div className="w-full p-6 md:p-8 bg-background min-h-[calc(100vh-3.5rem)]">

      {/* ── Page Header ── */}
      <div style={s.pageHeader}>
        <div>
          <h1 style={s.pageTitle}>Dashboard</h1>
          <p style={s.pageSubtitle}>Blood bank management overview and analytics</p>
        </div>
        <div style={s.liveIndicator}>
          <span style={s.liveDot} />
          Live
        </div>
      </div>

      {/* ── Low Stock Alert Card ── */}
      {lowStockAlerts.length > 0 && (
        <div style={s.alertCard}>
          <div style={s.alertCardHeader}>
            <div style={s.alertIconWrap}>
              <AlertCircle size={16} color="#7F1D1D" />
            </div>
            <div>
              <p style={s.alertCardTitle}>Low Stock Alerts</p>
              <p style={s.alertCardDesc}>
                {lowStockAlerts.length} blood group{lowStockAlerts.length !== 1 ? 's' : ''} running critically low
              </p>
            </div>
          </div>
          <div style={s.alertGrid}>
            {lowStockAlerts.slice(0, 4).map((alert, i) => {
              const isCritical = alert.units < 3;
              return (
                <div
                  key={i}
                  style={{
                    ...s.alertItem,
                    background:  isCritical ? 'rgba(127,29,29,0.07)' : 'rgba(194,65,12,0.06)',
                    borderColor: isCritical ? 'rgba(127,29,29,0.2)'  : 'rgba(194,65,12,0.15)',
                  }}
                >
                  <div>
                    <p style={{ ...s.alertGroup, color: isCritical ? '#7F1D1D' : '#c2410c' }}>
                      {alert.bloodGroup}
                    </p>
                    <p style={s.alertUnits}>{alert.units} units remaining</p>
                  </div>
                  <span style={{ fontSize: 18 }}>{isCritical ? '🔴' : '🟠'}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Stat Cards ── */}
      <div style={s.statGrid}>
        <div style={s.statCard}>
          <div style={s.statCardTop}>
            <span style={s.statCardLabel}>Total Blood Units</span>
            <div style={{ ...s.statCardIcon, background: 'rgba(127,29,29,0.08)' }}>
              <Droplet size={16} color="#7F1D1D" />
            </div>
          </div>
          <div style={{ ...s.statCardValue, color: '#7F1D1D' }}>{stats.totalBloodUnits}</div>
          <p style={s.statCardSub}>In stock across all groups</p>
        </div>

        <div style={s.statCard}>
          <div style={s.statCardTop}>
            <span style={s.statCardLabel}>Low Stock Groups</span>
            <div style={{ ...s.statCardIcon, background: 'rgba(194,65,12,0.07)' }}>
              <AlertCircle size={16} color="#c2410c" />
            </div>
          </div>
          <div style={{ ...s.statCardValue, color: '#c2410c' }}>{stats.lowStockUnits}</div>
          <p style={s.statCardSub}>Requires immediate action</p>
        </div>

        <div style={s.statCard}>
          <div style={s.statCardTop}>
            <span style={s.statCardLabel}>Total Donors</span>
            <div style={{ ...s.statCardIcon, background: 'rgba(127,29,29,0.08)' }}>
              <Heart size={16} color="#7F1D1D" />
            </div>
          </div>
          <div style={s.statCardValue}>{stats.totalDonors}</div>
          <p style={s.statCardSub}>{stats.activeDonors} active this month</p>
        </div>

        <div style={s.statCard}>
          <div style={s.statCardTop}>
            <span style={s.statCardLabel}>Upcoming Events</span>
            <div style={{ ...s.statCardIcon, background: 'rgba(127,29,29,0.08)' }}>
              <Calendar size={16} color="#7F1D1D" />
            </div>
          </div>
          <div style={s.statCardValue}>{stats.upcomingEvents}</div>
          <p style={s.statCardSub}>Scheduled collections</p>
        </div>
      </div>

      {/* ── Charts Row ── */}
      <div style={s.chartsRow}>
        {/* Bar Chart */}
        <div style={{ ...s.card, flex: 2 }}>
          <div style={s.cardHeader}>
            <div style={s.cardTitleRow}>
              <div style={s.cardIconWrap}>
                <TrendingUp size={15} color="#7F1D1D" />
              </div>
              <div>
                <p style={s.cardTitle}>Blood Stock by Group</p>
                <p style={s.cardDesc}>Current units available per blood type</p>
              </div>
            </div>
          </div>
          <div style={s.cardBody}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={bloodData} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: '#64748b', fontFamily: 'inherit' }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'inherit' }}
                  axisLine={false} tickLine={false}
                />
                <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(127,29,29,0.04)' }} />
                <Bar dataKey="units" fill="#7F1D1D" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div style={{ ...s.card, flex: 1 }}>
          <div style={s.cardHeader}>
            <div style={s.cardTitleRow}>
              <div style={s.cardIconWrap}>
                <Activity size={15} color="#7F1D1D" />
              </div>
              <div>
                <p style={s.cardTitle}>Type Distribution</p>
                <p style={s.cardDesc}>Units by blood type</p>
              </div>
            </div>
          </div>
          <div style={{ ...s.cardBody, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={bloodDistribution}
                  cx="50%" cy="50%"
                  innerRadius={55} outerRadius={88}
                  paddingAngle={3} dataKey="value"
                >
                  {bloodDistribution.map((_, i) => (
                    <Cell key={`cell-${i}`} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) => [`${v} units`]}
                  contentStyle={s.tooltip}
                />
              </PieChart>
            </ResponsiveContainer>
            <div style={s.pieLegend}>
              {bloodDistribution.map((item, i) => (
                <div key={i} style={s.pieLegendItem}>
                  <span style={{ ...s.pieLegendDot, background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span style={s.pieLegendText}>{item.name}</span>
                  <span style={s.pieLegendVal}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Row ── */}
      <div style={s.bottomRow}>
        {/* Recent Donors */}
        <div style={{ ...s.card, flex: 1 }}>
          <div style={s.cardHeader}>
            <div style={s.cardTitleRow}>
              <div style={s.cardIconWrap}>
                <Users size={15} color="#7F1D1D" />
              </div>
              <div>
                <p style={s.cardTitle}>Recent Donors</p>
                <p style={s.cardDesc}>Latest registered donors</p>
              </div>
            </div>
            <a href="/dashboard/donors" style={s.viewAllBtn}>
              View All <ArrowRight size={12} />
            </a>
          </div>
          <div style={s.cardBody}>
            <div style={s.donorList}>
              {recentDonors.map((donor, i) => (
                <div key={i} style={{ ...s.donorRow, borderBottom: i < recentDonors.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                  <div style={s.donorAvatar}>{donor.name.charAt(0)}</div>
                  <div style={s.donorInfo}>
                    <p style={s.donorName}>{donor.name}</p>
                    <p style={s.donorMeta}>{donor.bloodGroup} · {donor.location}</p>
                  </div>
                  <div style={s.donorBadge}>{donor.totalDonations}×</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Events */}
        <div style={{ ...s.card, flex: 1 }}>
          <div style={s.cardHeader}>
            <div style={s.cardTitleRow}>
              <div style={s.cardIconWrap}>
                <Calendar size={15} color="#7F1D1D" />
              </div>
              <div>
                <p style={s.cardTitle}>Recent Events</p>
                <p style={s.cardDesc}>Upcoming and recent activities</p>
              </div>
            </div>
            <a href="/dashboard/events" style={s.viewAllBtn}>
              View All <ArrowRight size={12} />
            </a>
          </div>
          <div style={s.cardBody}>
            <div style={s.eventList}>
              {recentEvents.map((event, i) => {
                const es = EVENT_STATUS[event.status] ?? EVENT_STATUS.Completed;
                return (
                  <div key={i} style={s.eventRow}>
                    <div style={s.eventInfo}>
                      <p style={s.eventTitle}>{event.title}</p>
                      <p style={s.eventLocation}>{event.location}</p>
                    </div>
                    <span style={{ ...s.eventBadge, background: es.bg, color: es.text, borderColor: es.border }}>
                      {event.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const s = {
  loadingWrap: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: 384 },
  spinner: {
    width: 44, height: 44, borderRadius: '50%',
    border: '3px solid #f1f5f9', borderTop: '3px solid #7F1D1D',
    animation: 'spin 0.8s linear infinite',
  },

  // page styles replaced with Tailwind classes

  // Header
  pageHeader: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' },
  pageTitle:  { fontSize: 26, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.4px' },
  pageSubtitle: { fontSize: 13, color: '#64748b', margin: '3px 0 0' },
  liveIndicator: {
    display: 'flex', alignItems: 'center', gap: 6,
    background: '#fff', border: '1px solid #e2e8f0',
    borderRadius: 20, padding: '5px 12px',
    fontSize: 12, fontWeight: 600, color: '#374151',
  },
  liveDot: {
    display: 'inline-block', width: 7, height: 7, borderRadius: '50%',
    background: '#22c55e', boxShadow: '0 0 0 2px rgba(34,197,94,0.25)',
  },

  // Alert
  alertCard: {
    background: 'rgba(127,29,29,0.03)', border: '1px solid rgba(127,29,29,0.18)',
    borderRadius: 12, overflow: 'hidden',
  },
  alertCardHeader: { padding: '14px 16px 12px', display: 'flex', alignItems: 'center', gap: 10 },
  alertIconWrap: {
    width: 34, height: 34, borderRadius: 9,
    background: 'rgba(127,29,29,0.08)', border: '1px solid rgba(127,29,29,0.15)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  alertCardTitle: { fontSize: 14, fontWeight: 700, color: '#7F1D1D', margin: 0 },
  alertCardDesc:  { fontSize: 12, color: '#991B1B', margin: '1px 0 0', opacity: 0.8 },
  alertGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(4,1fr)',
    borderTop: '1px solid rgba(127,29,29,0.1)',
  },
  alertItem: {
    padding: '12px 16px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    borderRight: '1px solid rgba(127,29,29,0.08)',
    border: '1px solid transparent',
  },
  alertGroup: { fontSize: 15, fontWeight: 800, margin: 0 },
  alertUnits: { fontSize: 11, color: '#64748b', margin: '2px 0 0' },

  // Stat Cards
  statGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 },
  statCard: {
    background: '#fff', border: '1px solid #e2e8f0',
    borderRadius: 12, padding: '16px', transition: 'box-shadow 0.15s',
  },
  statCardTop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  statCardLabel: { fontSize: 12, fontWeight: 600, color: '#64748b' },
  statCardIcon: { width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  statCardValue: { fontSize: 28, fontWeight: 800, color: '#0f172a', lineHeight: 1 },
  statCardSub:   { fontSize: 11, color: '#94a3b8', margin: '4px 0 0' },

  // Cards
  card: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' },
  cardHeader: { padding: '16px 18px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' },
  cardTitleRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 },
  cardIconWrap: {
    width: 32, height: 32, borderRadius: 8,
    background: 'rgba(127,29,29,0.08)', border: '1px solid rgba(127,29,29,0.15)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  cardTitle: { fontSize: 14, fontWeight: 700, color: '#0f172a', margin: 0 },
  cardDesc:  { fontSize: 12, color: '#94a3b8', margin: '1px 0 0' },
  cardBody:  { padding: '4px 18px 18px' },
  viewAllBtn: {
    display: 'flex', alignItems: 'center', gap: 4,
    fontSize: 12, fontWeight: 600, color: '#7F1D1D',
    textDecoration: 'none', padding: '4px 0', opacity: 0.85,
  },

  // Layout rows
  chartsRow: { display: 'flex', gap: 14 },
  bottomRow: { display: 'flex', gap: 14 },

  // Tooltip
  tooltip: {
    background: '#fff', border: '1px solid #e2e8f0',
    borderRadius: 8, padding: '8px 12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  },
  tooltipLabel: { fontSize: 12, fontWeight: 600, color: '#374151', margin: 0 },
  tooltipValue: { fontSize: 14, fontWeight: 800, color: '#7F1D1D', margin: '2px 0 0' },

  // Pie Legend
  pieLegend: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px', marginTop: 8, width: '100%' },
  pieLegendItem: { display: 'flex', alignItems: 'center', gap: 6 },
  pieLegendDot:  { width: 8, height: 8, borderRadius: '50%', flexShrink: 0 },
  pieLegendText: { fontSize: 11, color: '#64748b', flex: 1 },
  pieLegendVal:  { fontSize: 11, fontWeight: 700, color: '#374151' },

  // Donors
  donorList: { display: 'flex', flexDirection: 'column' },
  donorRow:  { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0' },
  donorAvatar: {
    width: 36, height: 36, borderRadius: '50%',
    background: 'rgba(127,29,29,0.08)', border: '1px solid rgba(127,29,29,0.15)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 14, fontWeight: 700, color: '#7F1D1D', flexShrink: 0,
  },
  donorInfo: { flex: 1, minWidth: 0 },
  donorName: { fontSize: 13, fontWeight: 600, color: '#1e293b', margin: 0 },
  donorMeta: { fontSize: 11, color: '#94a3b8', margin: '1px 0 0' },
  donorBadge: {
    fontSize: 12, fontWeight: 700, color: '#7F1D1D',
    background: 'rgba(127,29,29,0.08)', border: '1px solid rgba(127,29,29,0.15)',
    borderRadius: 20, padding: '2px 9px',
  },

  // Events
  eventList: { display: 'flex', flexDirection: 'column', gap: 8 },
  eventRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '10px 12px', background: '#f8fafc',
    borderRadius: 9, border: '1px solid #f1f5f9', gap: 10,
  },
  eventInfo:     { flex: 1, minWidth: 0 },
  eventTitle:    { fontSize: 13, fontWeight: 600, color: '#1e293b', margin: 0 },
  eventLocation: { fontSize: 11, color: '#94a3b8', margin: '2px 0 0' },
  eventBadge: {
    fontSize: 11, fontWeight: 600,
    padding: '3px 10px', borderRadius: 20,
    border: '1px solid', flexShrink: 0,
  },
};
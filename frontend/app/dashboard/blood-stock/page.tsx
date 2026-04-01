'use client';

import { useState } from "react";
import { Plus, MoreHorizontal, Search, AlertTriangle, Droplets, X, TrendingDown, CheckCircle2, Clock } from "lucide-react";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const MOCK_DONORS = [
  { id: "d1", name: "Aarav Sharma",   bloodGroup: "A+"  },
  { id: "d2", name: "Priya Thapa",    bloodGroup: "O+"  },
  { id: "d3", name: "Bikash Karki",   bloodGroup: "B+"  },
  { id: "d4", name: "Sita Rai",       bloodGroup: "AB+" },
  { id: "d5", name: "Rohan Adhikari", bloodGroup: "O-"  },
  { id: "d6", name: "Menuka Gurung",  bloodGroup: "B-"  },
  { id: "d7", name: "Dipesh Pokhrel", bloodGroup: "A-"  },
  { id: "d8", name: "Kamala Tamang",  bloodGroup: "AB-" },
];

const MOCK_BLOOD_PACKS_INIT = [
  { id: "bp01", packCode: "BP-20240101", bloodGroup: "A+",  donorId: "d1", collectionDate: "2024-01-01", expiryDate: "2024-04-01", status: "Available" },
  { id: "bp02", packCode: "BP-20240102", bloodGroup: "O+",  donorId: "d2", collectionDate: "2024-01-02", expiryDate: "2024-04-02", status: "Available" },
  { id: "bp03", packCode: "BP-20240103", bloodGroup: "B+",  donorId: "d3", collectionDate: "2024-01-03", expiryDate: "2024-04-03", status: "Used"      },
  { id: "bp04", packCode: "BP-20240104", bloodGroup: "AB+", donorId: "d4", collectionDate: "2024-01-04", expiryDate: "2024-04-04", status: "Available" },
  { id: "bp05", packCode: "BP-20240105", bloodGroup: "O-",  donorId: "d5", collectionDate: "2024-01-05", expiryDate: "2024-04-05", status: "Expired"   },
  { id: "bp06", packCode: "BP-20240106", bloodGroup: "B-",  donorId: "d6", collectionDate: "2024-01-06", expiryDate: "2024-04-06", status: "Available" },
  { id: "bp07", packCode: "BP-20240107", bloodGroup: "A-",  donorId: "d7", collectionDate: "2024-01-07", expiryDate: "2024-04-07", status: "Available" },
  { id: "bp08", packCode: "BP-20240108", bloodGroup: "AB-", donorId: "d8", collectionDate: "2024-01-08", expiryDate: "2024-04-08", status: "Used"      },
  { id: "bp09", packCode: "BP-20240109", bloodGroup: "A+",  donorId: "d1", collectionDate: "2024-02-01", expiryDate: "2024-05-01", status: "Available" },
  { id: "bp10", packCode: "BP-20240110", bloodGroup: "O+",  donorId: "d2", collectionDate: "2024-02-02", expiryDate: "2024-05-02", status: "Available" },
  { id: "bp11", packCode: "BP-20240111", bloodGroup: "B+",  donorId: "d3", collectionDate: "2024-02-10", expiryDate: "2024-05-10", status: "Available" },
  { id: "bp12", packCode: "BP-20240112", bloodGroup: "O-",  donorId: "d5", collectionDate: "2024-02-15", expiryDate: "2024-05-15", status: "Available" },
];

const LOW_STOCK_THRESHOLD = 2;

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const getStockByGroup = (packs) => {
  const map = {};
  BLOOD_GROUPS.forEach((g) => { map[g] = { available: 0, used: 0, expired: 0 }; });
  packs.forEach((p) => {
    if (!map[p.bloodGroup]) map[p.bloodGroup] = { available: 0, used: 0, expired: 0 };
    if (p.status === "Available") map[p.bloodGroup].available++;
    else if (p.status === "Used")    map[p.bloodGroup].used++;
    else if (p.status === "Expired") map[p.bloodGroup].expired++;
  });
  return map;
};

const getLowStockGroups = (packs) =>
  BLOOD_GROUPS.filter((g) => {
    const avail = packs.filter((p) => p.bloodGroup === g && p.status === "Available").length;
    return avail < LOW_STOCK_THRESHOLD;
  });

const getDonorById = (id) => MOCK_DONORS.find((d) => d.id === id);

let packCounter = MOCK_BLOOD_PACKS_INIT.length + 1;
const generatePackCode = () => {
  const n = String(packCounter).padStart(5, "0");
  return `BP-${new Date().getFullYear()}${n}`;
};

// ─── STATUS CONFIG ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  Available: {
    dot:    "#22c55e",
    bg:     "rgba(21,128,61,0.08)",
    text:   "#15803d",
    border: "rgba(21,128,61,0.25)",
  },
  Used: {
    dot:    "#94a3b8",
    bg:     "rgba(148,163,184,0.12)",
    text:   "#64748b",
    border: "rgba(148,163,184,0.3)",
  },
  Expired: {
    dot:    "#991B1B",
    bg:     "rgba(127,29,29,0.07)",
    text:   "#7F1D1D",
    border: "rgba(127,29,29,0.25)",
  },
};

// ─── TOAST ────────────────────────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = (msg, type = "success") => {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  };
  return { toasts, toast: add };
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function BloodStockPage() {
  const [bloodPacks, setBloodPacks]     = useState(MOCK_BLOOD_PACKS_INIT);
  const [filterGroup, setFilterGroup]   = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery]   = useState("");
  const [dialogOpen, setDialogOpen]     = useState(false);
  const [openMenuId, setOpenMenuId]     = useState(null);
  const [newPack, setNewPack] = useState({
    bloodGroup: "", collectionDate: "", expiryDate: "", donorId: "", status: "Available",
  });
  const { toasts, toast } = useToast();

  const stock    = getStockByGroup(bloodPacks);
  const lowStock = getLowStockGroups(bloodPacks);

  const totalAvailable = bloodPacks.filter((p) => p.status === "Available").length;
  const totalUsed      = bloodPacks.filter((p) => p.status === "Used").length;
  const totalExpired   = bloodPacks.filter((p) => p.status === "Expired").length;

  const filtered = bloodPacks.filter((p) => {
    if (filterGroup  !== "all" && p.bloodGroup !== filterGroup)  return false;
    if (filterStatus !== "all" && p.status     !== filterStatus) return false;
    if (searchQuery && !p.packCode.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleAdd = () => {
    if (!newPack.bloodGroup || !newPack.collectionDate || !newPack.expiryDate) {
      toast("Please fill all required fields", "error");
      return;
    }
    const pack = {
      id:             `bp${Date.now()}`,
      packCode:       generatePackCode(),
      bloodGroup:     newPack.bloodGroup,
      donorId:        newPack.donorId,
      collectionDate: newPack.collectionDate,
      expiryDate:     newPack.expiryDate,
      status:         "Available",
    };
    packCounter++;
    setBloodPacks((prev) => [pack, ...prev]);
    setDialogOpen(false);
    setNewPack({ bloodGroup: "", collectionDate: "", expiryDate: "", donorId: "", status: "Available" });
    toast("Blood pack added successfully");
  };

  const updateStatus = (id, status) => {
    setBloodPacks((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
    setOpenMenuId(null);
    toast(`Marked as ${status}`);
  };

  return (
    <div className="w-full p-6 md:p-8 bg-background min-h-[calc(100vh-3.5rem)]">
      {/* ── Toast Stack ── */}
      <div style={s.toastStack}>
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              ...s.toast,
              background:   t.type === "error" ? "#fef2f2" : "#f0fdf4",
              borderColor:  t.type === "error" ? "#fca5a5" : "#86efac",
              color:        t.type === "error" ? "#7F1D1D" : "#15803d",
            }}
          >
            {t.msg}
          </div>
        ))}
      </div>

      {/* ── Page Header ── */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          <div style={s.headerIcon}>
            <Droplets size={18} color="#7F1D1D" />
          </div>
          <div>
            <h1 style={s.title}>Blood Stock</h1>
            <p style={s.subtitle}>Manage and track blood inventory</p>
          </div>
        </div>
        <button style={s.addBtn} onClick={() => setDialogOpen(true)}>
          <Plus size={14} /> Add Pack
        </button>
      </div>

      {/* ── Summary Stat Cards ── */}
      <div style={s.statGrid}>
        {/* Total Available */}
        <div style={s.statCard}>
          <div style={s.statCardHeader}>
            <span style={s.statLabel}>Total Available</span>
            <div style={{ ...s.statIcon, background: "rgba(127,29,29,0.08)" }}>
              <Droplets size={16} color="#7F1D1D" />
            </div>
          </div>
          <div style={{ ...s.statValue, color: "#7F1D1D" }}>{totalAvailable}</div>
          <p style={s.statSub}>Packs ready to use</p>
        </div>

        {/* Low Stock */}
        <div style={s.statCard}>
          <div style={s.statCardHeader}>
            <span style={s.statLabel}>Low Stock Groups</span>
            <div style={{ ...s.statIcon, background: "rgba(194,65,12,0.07)" }}>
              <TrendingDown size={16} color="#c2410c" />
            </div>
          </div>
          <div style={{ ...s.statValue, color: "#c2410c" }}>{lowStock.length}</div>
          <p style={s.statSub}>Requires immediate action</p>
        </div>

        {/* Used */}
        <div style={s.statCard}>
          <div style={s.statCardHeader}>
            <span style={s.statLabel}>Used</span>
            <div style={{ ...s.statIcon, background: "rgba(100,116,139,0.08)" }}>
              <CheckCircle2 size={16} color="#64748b" />
            </div>
          </div>
          <div style={{ ...s.statValue, color: "#475569" }}>{totalUsed}</div>
          <p style={s.statSub}>Packs consumed</p>
        </div>

        {/* Expired */}
        <div style={s.statCard}>
          <div style={s.statCardHeader}>
            <span style={s.statLabel}>Expired</span>
            <div style={{ ...s.statIcon, background: "rgba(127,29,29,0.06)" }}>
              <Clock size={16} color="#991B1B" />
            </div>
          </div>
          <div style={{ ...s.statValue, color: "#991B1B" }}>{totalExpired}</div>
          <p style={s.statSub}>Disposed safely</p>
        </div>
      </div>

      {/* ── Low Stock Alert Banner ── */}
      {lowStock.length > 0 && (
        <div style={s.alertBanner}>
          <div style={s.alertLeft}>
            <AlertTriangle size={15} color="#7F1D1D" />
            <span style={s.alertText}>
              Low stock alert:&nbsp;<strong>{lowStock.join(", ")}</strong>
            </span>
          </div>
          <button style={s.findBtn}>
            <Search size={12} /> Find Donors
          </button>
        </div>
      )}

      {/* ── Blood Inventory by Group ── */}
      <p style={s.sectionTitle}>
        Blood Inventory by Group
      </p>
      <div style={s.stockGrid}>
        {BLOOD_GROUPS.map((g) => {
          const isLow  = lowStock.includes(g);
          const count  = stock[g]?.available ?? 0;
          return (
            <div
              key={g}
              style={{
                ...s.stockCard,
                borderColor: isLow ? "rgba(127,29,29,0.35)" : "#e2e8f0",
                background:  isLow ? "rgba(127,29,29,0.03)" : "#fff",
              }}
            >
              <p style={s.stockCardLabel}>Group</p>
              <p style={s.stockCardGroup}>{g}</p>
              <p style={{ ...s.stockCardCount, color: "#7F1D1D" }}>{count}</p>
              <p style={s.stockCardUnits}>units</p>
              {isLow && (
                <div style={s.lowBadge}>
                  <AlertTriangle size={8} color="#7F1D1D" /> Low
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Filters ── */}
      <div style={s.filtersRow}>
        <div style={s.searchWrap}>
          <Search size={13} color="#94a3b8" style={s.searchIcon} />
          <input
            style={s.searchInput}
            placeholder="Search pack code…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select style={s.select} value={filterGroup} onChange={(e) => setFilterGroup(e.target.value)}>
          <option value="all">All Groups</option>
          {BLOOD_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
        <select style={s.select} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">All Status</option>
          <option value="Available">Available</option>
          <option value="Used">Used</option>
          <option value="Expired">Expired</option>
        </select>
      </div>

      {/* ── Table ── */}
      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>
              {["Pack Code", "Group", "Donor", "Collected", "Expires", "Status", ""].map((h, i) => (
                <th key={i} style={s.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 20).map((p) => {
              const donor = getDonorById(p.donorId);
              const ss    = STATUS_CONFIG[p.status] ?? STATUS_CONFIG.Available;
              return (
                <tr key={p.id} style={s.tr}>
                  <td style={s.td}>
                    <span style={s.packCode}>{p.packCode}</span>
                  </td>
                  <td style={s.td}>
                    <span style={s.groupBadge}>{p.bloodGroup}</span>
                  </td>
                  <td style={{ ...s.td, color: "#94a3b8", fontSize: 12 }}>
                    {donor?.name ?? "—"}
                  </td>
                  <td style={{ ...s.td, fontSize: 12 }}>{p.collectionDate}</td>
                  <td style={{ ...s.td, fontSize: 12 }}>{p.expiryDate}</td>
                  <td style={s.td}>
                    <span style={{ ...s.statusBadge, background: ss.bg, color: ss.text, borderColor: ss.border }}>
                      <span style={{ ...s.statusDot, background: ss.dot }} />
                      {p.status}
                    </span>
                  </td>
                  <td style={{ ...s.td, position: "relative" }}>
                    <button
                      style={s.menuBtn}
                      onClick={() => setOpenMenuId(openMenuId === p.id ? null : p.id)}
                    >
                      <MoreHorizontal size={14} />
                    </button>
                    {openMenuId === p.id && (
                      <div style={s.dropdown}>
                        {p.status === "Available" && (
                          <>
                            <div style={s.dropItem} onClick={() => updateStatus(p.id, "Used")}>
                              Mark Used
                            </div>
                            <div style={s.dropItem} onClick={() => updateStatus(p.id, "Expired")}>
                              Mark Expired
                            </div>
                          </>
                        )}
                        {p.status !== "Available" && (
                          <div style={s.dropItem} onClick={() => updateStatus(p.id, "Available")}>
                            Mark Available
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div style={s.tableFooter}>
          Showing {Math.min(filtered.length, 20)} of {filtered.length} packs
        </div>
      </div>

      {/* ── Add Pack Dialog ── */}
      {dialogOpen && (
        <div style={s.overlay} onClick={() => setDialogOpen(false)}>
          <div style={s.dialog} onClick={(e) => e.stopPropagation()}>
            <div style={s.dialogHeader}>
              <div style={s.dialogTitleRow}>
                <div style={s.dialogIcon}>
                  <Droplets size={16} color="#7F1D1D" />
                </div>
                <h2 style={s.dialogTitle}>Add Blood Pack</h2>
              </div>
              <button style={s.closeBtn} onClick={() => setDialogOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <div style={s.form}>
              <div style={s.field}>
                <label style={s.label}>Blood Group <span style={{ color: "#7F1D1D" }}>*</span></label>
                <select
                  style={s.formSelect}
                  value={newPack.bloodGroup}
                  onChange={(e) => setNewPack({ ...newPack, bloodGroup: e.target.value })}
                >
                  <option value="">Select group</option>
                  {BLOOD_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div style={s.field}>
                <label style={s.label}>Donor</label>
                <select
                  style={s.formSelect}
                  value={newPack.donorId}
                  onChange={(e) => setNewPack({ ...newPack, donorId: e.target.value })}
                >
                  <option value="">Select donor (optional)</option>
                  {MOCK_DONORS.map((d) => (
                    <option key={d.id} value={d.id}>{d.name} ({d.bloodGroup})</option>
                  ))}
                </select>
              </div>
              <div style={s.grid2}>
                <div style={s.field}>
                  <label style={s.label}>Collection Date <span style={{ color: "#7F1D1D" }}>*</span></label>
                  <input
                    type="date"
                    style={s.formInput}
                    value={newPack.collectionDate}
                    onChange={(e) => setNewPack({ ...newPack, collectionDate: e.target.value })}
                  />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Expiry Date <span style={{ color: "#7F1D1D" }}>*</span></label>
                  <input
                    type="date"
                    style={s.formInput}
                    value={newPack.expiryDate}
                    onChange={(e) => setNewPack({ ...newPack, expiryDate: e.target.value })}
                  />
                </div>
              </div>
              <button style={s.submitBtn} onClick={handleAdd}>
                Add Blood Pack
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const s = {
  // Layout
  // page styles replaced with Tailwind classes
  page: {
    padding: "24px",
    maxWidth: 1100,
    margin: "0 auto",
    fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif",
    background: "#f8fafc",
    minHeight: "100vh",
    position: "relative",
  },

  // Toast
  toastStack: {
    position: "fixed", bottom: 24, right: 24,
    display: "flex", flexDirection: "column", gap: 8, zIndex: 9999,
  },
  toast: {
    padding: "10px 16px", borderRadius: 8,
    border: "1px solid", fontSize: 13, fontWeight: 500,
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },

  // Header
  header: {
    display: "flex", alignItems: "center",
    justifyContent: "space-between", marginBottom: 24,
  },
  headerLeft: { display: "flex", alignItems: "center", gap: 12 },
  headerIcon: {
    width: 40, height: 40, borderRadius: 10,
    background: "rgba(127,29,29,0.08)",
    border: "1px solid rgba(127,29,29,0.2)",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  title:    { fontSize: 22, fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.3px" },
  subtitle: { fontSize: 13, color: "#64748b", margin: "2px 0 0" },
  addBtn: {
    display: "flex", alignItems: "center", gap: 6,
    background: "#7F1D1D", color: "#fff",
    border: "none", borderRadius: 8,
    padding: "9px 16px", fontSize: 13, fontWeight: 600,
    cursor: "pointer", transition: "background 0.15s",
  },

  // Stat Cards
  statGrid: {
    display: "grid", gridTemplateColumns: "repeat(4,1fr)",
    gap: 12, marginBottom: 20,
  },
  statCard: {
    background: "#fff", border: "1px solid #e2e8f0",
    borderRadius: 12, padding: "16px",
    transition: "box-shadow 0.15s",
  },
  statCardHeader: {
    display: "flex", alignItems: "center",
    justifyContent: "space-between", marginBottom: 8,
  },
  statLabel: { fontSize: 12, fontWeight: 600, color: "#64748b" },
  statIcon: {
    width: 32, height: 32, borderRadius: 8,
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  statValue: { fontSize: 26, fontWeight: 800, lineHeight: 1 },
  statSub:   { fontSize: 11, color: "#94a3b8", marginTop: 4 },

  // Alert Banner
  alertBanner: {
    background: "rgba(127,29,29,0.04)",
    border: "1px solid rgba(127,29,29,0.2)",
    borderRadius: 10, padding: "10px 14px",
    display: "flex", alignItems: "center",
    justifyContent: "space-between", marginBottom: 20,
  },
  alertLeft: { display: "flex", alignItems: "center", gap: 8 },
  alertText: { fontSize: 13, fontWeight: 500, color: "#7F1D1D" },
  findBtn: {
    display: "flex", alignItems: "center", gap: 5,
    background: "#fff", border: "1px solid #d1d5db",
    borderRadius: 7, padding: "5px 12px",
    fontSize: 12, fontWeight: 600, cursor: "pointer", color: "#374151",
  },

  // Section Title
  sectionTitle: {
    fontSize: 13, fontWeight: 700, color: "#1e293b",
    marginBottom: 10, display: "flex", alignItems: "center", gap: 6,
  },

  // Stock Grid
  stockGrid: {
    display: "grid", gridTemplateColumns: "repeat(8,1fr)",
    gap: 10, marginBottom: 22,
  },
  stockCard: {
    background: "#fff", border: "1px solid",
    borderRadius: 12, padding: "14px 10px 12px",
    transition: "box-shadow 0.15s",
  },
  stockCardLabel: {
    fontSize: 10, fontWeight: 500, color: "#94a3b8",
    textTransform: "uppercase", letterSpacing: "0.06em", margin: 0,
  },
  stockCardGroup: {
    fontSize: 17, fontWeight: 800, color: "#0f172a",
    lineHeight: 1, margin: "4px 0 2px",
  },
  stockCardCount: {
    fontSize: 28, fontWeight: 800, lineHeight: 1.1, margin: 0,
  },
  stockCardUnits: {
    fontSize: 9, color: "#94a3b8",
    textTransform: "uppercase", letterSpacing: "0.06em", margin: 0,
  },
  lowBadge: {
    display: "inline-flex", alignItems: "center", gap: 3,
    marginTop: 7,
    background: "rgba(127,29,29,0.1)",
    border: "1px solid rgba(127,29,29,0.2)",
    borderRadius: 20, padding: "2px 7px",
    fontSize: 9, fontWeight: 700, color: "#7F1D1D",
    textTransform: "uppercase", letterSpacing: "0.05em",
  },

  // Filters
  filtersRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 12 },
  searchWrap: { position: "relative", flex: 1 },
  searchIcon: { position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" },
  searchInput: {
    width: "100%", paddingLeft: 32, paddingRight: 10, height: 38,
    border: "1px solid #e2e8f0", borderRadius: 8,
    fontSize: 13, outline: "none", background: "#fff", boxSizing: "border-box",
    fontFamily: "inherit", color: "#0f172a",
  },
  select: {
    height: 38, border: "1px solid #e2e8f0", borderRadius: 8,
    padding: "0 10px", fontSize: 13, background: "#fff",
    outline: "none", cursor: "pointer", color: "#0f172a",
  },

  // Table
  tableWrap: {
    background: "#fff", border: "1px solid #e2e8f0",
    borderRadius: 12, overflow: "hidden",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    padding: "10px 14px", textAlign: "left",
    fontSize: 11, fontWeight: 600, color: "#64748b",
    textTransform: "uppercase", letterSpacing: "0.05em",
    borderBottom: "1px solid #f1f5f9", background: "#f8fafc",
  },
  tr:          { borderBottom: "1px solid #f1f5f9", transition: "background 0.1s" },
  td:          { padding: "12px 14px", fontSize: 13, color: "#1e293b", verticalAlign: "middle" },
  packCode:    { fontFamily: "monospace", fontSize: 12, color: "#475569" },
  groupBadge:  {
    display: "inline-block", padding: "2px 9px", borderRadius: 6,
    background: "rgba(127,29,29,0.08)", color: "#7F1D1D",
    border: "1px solid rgba(127,29,29,0.2)",
    fontSize: 11, fontWeight: 700,
  },
  statusBadge: {
    display: "inline-flex", alignItems: "center", gap: 5,
    padding: "3px 9px", borderRadius: 20, border: "1px solid",
    fontSize: 11, fontWeight: 600,
  },
  statusDot: { width: 6, height: 6, borderRadius: "50%" },
  menuBtn: {
    background: "none", border: "none", cursor: "pointer",
    padding: 4, borderRadius: 6, color: "#94a3b8",
    display: "flex", alignItems: "center",
  },
  dropdown: {
    position: "absolute", right: 0, top: "110%",
    background: "#fff", border: "1px solid #e2e8f0",
    borderRadius: 8, boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
    zIndex: 100, minWidth: 140, overflow: "hidden",
  },
  dropItem: {
    padding: "9px 14px", fontSize: 13,
    cursor: "pointer", color: "#374151",
    transition: "background 0.1s",
  },
  tableFooter: {
    padding: "10px 14px", borderTop: "1px solid #f1f5f9",
    fontSize: 12, color: "#94a3b8",
  },

  // Dialog
  overlay: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200,
  },
  dialog: {
    background: "#fff", borderRadius: 14, width: "100%", maxWidth: 440,
    padding: 24, boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
  },
  dialogHeader: {
    display: "flex", alignItems: "center",
    justifyContent: "space-between", marginBottom: 20,
  },
  dialogTitleRow: { display: "flex", alignItems: "center", gap: 10 },
  dialogIcon: {
    width: 34, height: 34, borderRadius: 9,
    background: "rgba(127,29,29,0.08)",
    border: "1px solid rgba(127,29,29,0.2)",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  dialogTitle: { fontSize: 16, fontWeight: 700, color: "#0f172a", margin: 0 },
  closeBtn: {
    background: "none", border: "none", cursor: "pointer",
    color: "#94a3b8", display: "flex", padding: 2, borderRadius: 6,
  },
  form: { display: "flex", flexDirection: "column", gap: 14 },
  field: { display: "flex", flexDirection: "column", gap: 5 },
  label: { fontSize: 12, fontWeight: 600, color: "#374151" },
  formSelect: {
    height: 38, border: "1px solid #d1d5db", borderRadius: 8,
    padding: "0 10px", fontSize: 13, outline: "none", background: "#fff",
    fontFamily: "inherit", color: "#0f172a",
  },
  formInput: {
    height: 38, border: "1px solid #d1d5db", borderRadius: 8,
    padding: "0 10px", fontSize: 13, outline: "none",
    fontFamily: "inherit", color: "#0f172a",
  },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  submitBtn: {
    width: "100%", background: "#7F1D1D", color: "#fff",
    border: "none", borderRadius: 8, padding: "10px 0",
    fontSize: 14, fontWeight: 600, cursor: "pointer", marginTop: 4,
    fontFamily: "inherit",
  },
};
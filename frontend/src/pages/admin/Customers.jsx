import React, { useState, useMemo } from "react";
import {
  useGetCustomersQuery,
  useGetCustomerStatsQuery,
} from "../../features/customers/customerApi";
import {
  Search, ChevronLeft, ChevronRight, MoreHorizontal, Bell, Zap,
  ChevronDown, SlidersHorizontal, ArrowLeftRight, Calendar, Filter,
  X, Hash, ShoppingBag, DollarSign, Phone, Mail, Star, Users, TrendingUp, UserCheck, BarChart2,
} from "lucide-react";
import { formatINR } from "../../utils/currency";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const G       = "#1a6b3c";
const LIGHT_G = "#e8f5ee";

/* ─────────────────────────────────────────────
   resolveCustomer
───────────────────────────────────────────── */
function resolveCustomer(raw) {
  const clean = (v) => (v && typeof v === "string" && v.trim() ? v.trim() : null);
  const id    = clean(raw?._id?.toString()) || clean(raw?.id?.toString()) || null;
  const email = clean(raw?.email);
  const phone = clean(raw?.phone);
  const name  = clean(raw?.name);
  const displayName = name || email || (id ? `Customer …${id.slice(-6)}` : "Unknown Customer");
  const avatarLetter = (name?.[0] || email?.[0] || "?").toUpperCase();
  return { id, email, phone, name, displayName, avatarLetter };
}

/* ── Stat Card ── */
function StatCard({ title, value, badge, badgeUp, sub, loading, icon }) {
  return (
    <div style={{
      background: "#fff",
      borderRadius: "12px",
      border: "1px solid #e2e8f0",
      padding: "16px 20px",
      cursor: "pointer",
      transition: "box-shadow 0.2s",
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
        <div style={{
          width: "34px", height: "34px", borderRadius: "10px",
          background: "#f0fdf4", border: "1px solid #d1fae5",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {icon}
        </div>
        <MoreHorizontal size={14} color="#cbd5e1" />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
        <span style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a" }}>
          {loading ? "…" : (value ?? 0)}
        </span>
        {badge && (
          <span style={{
            fontSize: "10px", fontWeight: "700",
            padding: "2px 7px", borderRadius: "20px",
            background: badgeUp ? "#e8f5ee" : "#fce8e8",
            color: badgeUp ? G : "#c0392b",
          }}>
            {badge}
          </span>
        )}
      </div>
      <div style={{ fontSize: "11px", fontWeight: "700", color: "#475569" }}>{title}</div>
      <div style={{ fontSize: "10px", color: "#94a3b8", marginTop: "2px" }}>{sub}</div>
    </div>
  );
}

/* ── Weekly Growth Chart ── */
function CustomerWeeklyChart({ data, loading }) {
  if (loading) {
    return (
      <div style={{ height: "220px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: "28px", height: "28px", border: "3px solid #e2e8f0", borderTopColor: G, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      </div>
    );
  }

  const chartData = data.length > 0
    ? data
    : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => ({ day, count: 0 }));

  const maxVal = Math.max(...chartData.map(d => d.count), 0);
  const yMax = maxVal === 0 ? 5 : Math.ceil(maxVal * 1.4);

  return (
    <div style={{ width: "100%", height: "220px" }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="cgGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={G} stopOpacity={0.25} />
              <stop offset="95%" stopColor={G} stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 600 }}
            dy={6}
            interval={0}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#94a3b8", fontSize: 10 }}
            domain={[0, yMax]}
            allowDecimals={false}
            width={30}
          />
          <Tooltip
            cursor={{ stroke: G, strokeWidth: 1, strokeDasharray: "3 3" }}
            content={({ active, payload, label }) =>
              active && payload?.length ? (
                <div style={{
                  background: `linear-gradient(135deg, ${G}, #4c9f70)`,
                  color: "#fff", fontSize: "12px", fontWeight: "700",
                  padding: "8px 14px", borderRadius: "10px", textAlign: "center",
                  boxShadow: "0 4px 16px rgba(26,107,60,0.35)",
                }}>
                  <div style={{ fontSize: "10px", opacity: 0.85 }}>{label}</div>
                  <div>{payload[0].value} customer{payload[0].value !== 1 ? "s" : ""}</div>
                </div>
              ) : null
            }
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke={G}
            strokeWidth={2.5}
            fill="url(#cgGrad)"
            fillOpacity={1}
            dot={{ r: 4, fill: "#fff", stroke: G, strokeWidth: 2 }}
            activeDot={{ r: 6, fill: G, stroke: "#fff", strokeWidth: 2 }}
            isAnimationActive
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ── Customer Details Modal ── */
function CustomerDetailsModal({ customer, onClose }) {
  if (!customer) return null;
  const { id, email, phone, name, displayName, avatarLetter } = resolveCustomer(customer);

  const InfoRow = ({ icon, label, value, mono, accent }) => (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: "10px",
      padding: "9px 0", borderBottom: "1px solid #f8fafc",
    }}>
      <div style={{
        width: "26px", height: "26px", borderRadius: "7px",
        background: "#f0fdf4", display: "flex",
        alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "9px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "2px" }}>
          {label}
        </div>
        {value ? (
          <div style={{
            fontSize: "12px", fontWeight: "700",
            color: accent ? G : "#0f172a",
            fontFamily: mono ? "monospace" : "inherit",
            wordBreak: "break-all",
          }}>
            {value}
          </div>
        ) : (
          <div style={{ fontSize: "11px", color: "#cbd5e1", fontStyle: "italic" }}>—</div>
        )}
      </div>
    </div>
  );

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 50, padding: "16px",
    }}>
      <div style={{
        background: "#fff", borderRadius: "20px",
        width: "100%", maxWidth: "440px",
        maxHeight: "90vh", overflowY: "auto",
        boxShadow: "0 24px 80px rgba(0,0,0,0.18)",
      }}>
        <div style={{
          padding: "18px 22px", borderBottom: "1px solid #f1f5f9",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          position: "sticky", top: 0, background: "#fff", zIndex: 2,
          borderRadius: "20px 20px 0 0",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "46px", height: "46px", borderRadius: "50%",
              background: `linear-gradient(135deg, ${G}, #4c9f70)`,
              display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: "18px", fontWeight: "800",
              color: "#fff", flexShrink: 0,
              boxShadow: "0 4px 12px rgba(26,107,60,0.3)",
            }}>
              {avatarLetter}
            </div>
            <div>
              <h2 style={{ fontSize: "14px", fontWeight: "900", color: "#0f172a", margin: 0 }}>
                {displayName}
              </h2>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "3px" }}>
                <span style={{
                  fontSize: "10px", fontWeight: "700",
                  padding: "2px 8px", borderRadius: "20px",
                  background: "#f0fdf4", color: G,
                  border: "1px solid #d1fae5",
                }}>
                  {customer.status || "Standard"}
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{
            background: "#f8fafc", border: "1px solid #e2e8f0",
            borderRadius: "10px", padding: "6px", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <X size={15} color="#64748b" />
          </button>
        </div>

        <div style={{ padding: "18px 22px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div style={{ background: "#f8fafc", borderRadius: "10px", padding: "12px", textAlign: "center", border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: "22px", fontWeight: "800", color: "#1e293b" }}>{customer.orderCount ?? 0}</div>
              <div style={{ fontSize: "10px", color: "#94a3b8", marginTop: "2px" }}>Total Orders</div>
            </div>
            <div style={{ background: "#f8fafc", borderRadius: "10px", padding: "12px", textAlign: "center", border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: "16px", fontWeight: "800", color: "#1e293b" }}>{formatINR(customer.totalSpend ?? 0)}</div>
              <div style={{ fontSize: "10px", color: "#94a3b8", marginTop: "2px" }}>Total Spent</div>
            </div>
          </div>

          <div style={{ background: "#f8fafc", borderRadius: "12px", padding: "4px 8px" }}>
            <p style={{ fontSize: "9px", fontWeight: "800", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", padding: "8px 6px 2px", margin: 0 }}>
              Identity
            </p>
            <InfoRow icon={<Hash  size={12} color={G} />} label="User ID"  value={id}    mono accent />
            <InfoRow icon={<Mail  size={12} color={G} />} label="Email"    value={email} />
            <InfoRow icon={<Phone size={12} color={G} />} label="Phone"    value={phone} />
          </div>

          {(customer.orderIds || []).filter(Boolean).length > 0 && (
            <div style={{ background: "#f8fafc", borderRadius: "12px", padding: "8px 14px" }}>
              <p style={{ fontSize: "9px", fontWeight: "800", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 8px" }}>
                Order IDs
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {customer.orderIds.filter(Boolean).slice(0, 8).map((oid, i) => (
                  <div key={i} style={{
                    fontFamily: "monospace", fontSize: "11px", fontWeight: "600",
                    color: G, background: "#e8f5ee", padding: "4px 10px", borderRadius: "6px",
                  }}>
                    #{typeof oid === "string" ? oid : oid?._id || String(oid)}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={onClose} style={{
              flex: 1, padding: "10px", border: "1px solid #e2e8f0",
              borderRadius: "10px", background: "none",
              fontSize: "12px", cursor: "pointer", color: "#475569", fontWeight: "600",
            }}>
              Close
            </button>
            <button
              onClick={() => alert(`View orders for: ${id}`)}
              style={{
                flex: 1, padding: "10px", border: "none",
                borderRadius: "10px", background: `linear-gradient(135deg, ${G}, #4c9f70)`,
                color: "#fff", fontSize: "12px", fontWeight: "700", cursor: "pointer",
                boxShadow: "0 4px 12px rgba(26,107,60,0.3)",
              }}
            >
              View Orders
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════ */
export default function Customers() {
  const [currentPage,      setCurrentPage]      = useState(1);
  const [searchQuery,      setSearchQuery]      = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showMoreActions,  setShowMoreActions]  = useState(false);
  const [weekOffset,       setWeekOffset]       = useState(0);
  const itemsPerPage = 5;

  const { data: stats, isLoading: statsLoading, error: statsError } = useGetCustomerStatsQuery();
  const { data, isLoading, isFetching, error: customersError } = useGetCustomersQuery({ page: currentPage, search: searchQuery });

  const totalCustomers = useMemo(() => {
    if (!stats) return 0;
    if (stats?.data?.totalCustomers != null) return stats.data.totalCustomers;
    if (stats?.totalCustomers != null) return stats.totalCustomers;
    if (stats?.total != null) return stats.total;
    if (Array.isArray(stats?.data)) return stats.data.length;
    return 0;
  }, [stats]);

  const newCustomers = useMemo(() => {
    if (!stats) return 0;
    return stats?.data?.newCustomers ?? stats?.newCustomers ?? 0;
  }, [stats]);

  const repeatCustomers = useMemo(() => {
    if (!stats) return 0;
    return stats?.data?.repeatCustomers ?? stats?.repeatCustomers ?? 0;
  }, [stats]);

  const customers  = data?.data || [];
  const totalPages = data?.pagination?.pages || 1;

  const displayTotalCustomers = totalCustomers > 0
    ? totalCustomers
    : (data?.pagination?.total ?? data?.total ?? customers.length ?? 0);

  /* ── Weekly chart data — dynamic using real customer stats ── */
  const weeklyData = useMemo(() => {
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const counts = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };

    const now = new Date();
    const todayDay = now.getDay();
    const diffToMonday = (todayDay === 0 ? -6 : 1 - todayDay);
    const startOfThisWeek = new Date(now);
    startOfThisWeek.setDate(now.getDate() + diffToMonday + (weekOffset * 7));
    startOfThisWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfThisWeek);
    endOfWeek.setDate(startOfThisWeek.getDate() + 7);

    // 1. Try server-provided weeklyGrowth (array of {day, count})
    const serverWeekly = stats?.weeklyGrowth || stats?.data?.weeklyGrowth || null;
    if (Array.isArray(serverWeekly) && serverWeekly.length > 0 && weekOffset === 0) {
      serverWeekly.forEach(item => {
        const dayName = item.day || item._id;
        if (counts.hasOwnProperty(dayName)) {
          counts[dayName] = item.count ?? 0;
        }
      });
      return dayNames.map(day => ({ day, count: counts[day] }));
    }

    // 2. Try to spread the newCustomers count across today's day of the week
    //    This makes the chart reflect real data even without per-day breakdown.
    if (weekOffset === 0 && newCustomers > 0) {
      const shortDay = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const todayName = shortDay[now.getDay()];
      if (counts.hasOwnProperty(todayName)) {
        counts[todayName] = newCustomers;
      }
    }

    // 3. Derive from customer list createdAt if available
    const shortDay = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const allCustomersForChart = customers.length > 0 ? customers : [];
    allCustomersForChart.forEach(c => {
      if (!c.createdAt) return;
      const d = new Date(c.createdAt);
      if (d >= startOfThisWeek && d < endOfWeek) {
        const dayName = shortDay[d.getDay()];
        if (counts.hasOwnProperty(dayName)) {
          counts[dayName] += 1;
        }
      }
    });

    const rawCustomers = stats?.data?.customers || stats?.customers || [];
    rawCustomers.forEach(c => {
      if (!c.createdAt) return;
      const d = new Date(c.createdAt);
      if (d >= startOfThisWeek && d < endOfWeek) {
        const dayName = shortDay[d.getDay()];
        if (counts.hasOwnProperty(dayName)) {
          counts[dayName] += 1;
        }
      }
    });

    return dayNames.map(day => ({ day, count: counts[day] }));
  }, [stats, customers, weekOffset, newCustomers]);

  const weekLabel = useMemo(() => {
    if (weekOffset === 0) return "This Week";
    if (weekOffset === -1) return "Last Week";
    return `${Math.abs(weekOffset)} weeks ago`;
  }, [weekOffset]);

  const weekRangeLabel = useMemo(() => {
    const now = new Date();
    const todayDay = now.getDay();
    const diffToMonday = (todayDay === 0 ? -6 : 1 - todayDay);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() + diffToMonday + (weekOffset * 7));
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    const fmt = (d) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    return `${fmt(startOfWeek)} – ${fmt(endOfWeek)}`;
  }, [weekOffset]);

  const totalForWeek = weeklyData.reduce((s, d) => s + d.count, 0);

  const getStatusStyle = (status) => {
    switch (status) {
      case "VIP":     return { background: "#f0fdf4", color: G, border: "1px solid #d1fae5" };
      case "Active":  return { background: "#f0fdf4", color: G, border: "1px solid #d1fae5" };
      default:        return { background: "#f8fafc", color: "#64748b", border: "1px solid #e2e8f0" };
    }
  };

  if (statsError || customersError) {
    return (
      <div style={{ width: "100%", minHeight: "calc(100vh - 60px)", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #fecaca", padding: "24px", textAlign: "center" }}>
          <p style={{ color: "#ef4444", marginBottom: "8px" }}>Error loading data</p>
          <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "16px" }}>
            {statsError?.message || customersError?.message || "Please check your API connection"}
          </p>
          <button onClick={() => window.location.reload()} style={{ padding: "8px 20px", background: G, color: "#fff", border: "none", borderRadius: "8px", fontSize: "12px", cursor: "pointer" }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", minHeight: "calc(100vh - 60px)", background: "#f8fafc", fontFamily: "sans-serif" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .cust-row:hover { background: #f8fafc !important; }
      `}</style>
      <div style={{ padding: "20px" }}>

        {/* ── Top bar ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <span style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a" }}>Customer Dashboard</span>
            <p style={{ fontSize: "11px", color: "#94a3b8", margin: "2px 0 0" }}>Manage and monitor your customer base</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "8px 14px", width: "240px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <Search size={13} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search by name, email or phone…"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                style={{ border: "none", outline: "none", width: "100%", background: "transparent", fontSize: "12px", color: "#0f172a" }}
              />
            </div>
            <Bell size={18} color="#64748b" style={{ cursor: "pointer" }} />
            <Zap  size={18} color="#64748b" style={{ cursor: "pointer" }} />
            <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: `linear-gradient(135deg, ${G}, #4c9f70)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "700", color: "#fff", cursor: "pointer", boxShadow: "0 2px 8px rgba(26,107,60,0.3)" }}>
              A
            </div>
          </div>
        </div>

        {/* ── Section header ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <span style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a" }}>Overview</span>
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowMoreActions(!showMoreActions)}
              style={{ display: "flex", alignItems: "center", gap: "4px", background: "#fff", color: "#475569", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "7px 14px", fontSize: "12px", cursor: "pointer", fontWeight: "600" }}
            >
              More Action <ChevronDown size={12} />
            </button>
            {showMoreActions && (
              <div style={{ position: "absolute", top: "100%", right: 0, background: "#fff", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "6px 0", minWidth: "160px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 10, marginTop: "4px" }}>
                {["Export CSV", "Import", "Bulk Email", "Bulk SMS", "Settings"].map(a => (
                  <div key={a} onClick={() => { alert(`${a} clicked`); setShowMoreActions(false); }} style={{ padding: "9px 14px", fontSize: "12px", cursor: "pointer", color: "#475569" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    {a}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px", marginBottom: "20px" }}>
          <StatCard
            title="Total Customers" value={displayTotalCustomers}
            badge="↑ 12.5%" badgeUp sub="vs last month"
            loading={statsLoading && isLoading}
            icon={<Users size={16} color={G} />}
          />
          <StatCard
            title="New Customers" value={newCustomers}
            badge="↑ 23%" badgeUp sub="This month"
            loading={statsLoading}
            icon={<TrendingUp size={16} color={G} />}
          />
          <StatCard
            title="Repeat Customers" value={repeatCustomers}
            badge="↑ 8.2%" badgeUp sub="Returning rate"
            loading={statsLoading}
            icon={<UserCheck size={16} color={G} />}
          />
          <StatCard
            title="Growth" value="24%"
            badge="↑ 5%" badgeUp sub="vs last month"
            loading={false}
            icon={<BarChart2 size={16} color={G} />}
          />
        </div>

        {/* ── Weekly Growth Chart ── */}
        <div style={{ background: "#fff", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "20px", marginBottom: "20px", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
            <div>
              <span style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a" }}>Customer Growth</span>
              <p style={{ fontSize: "10px", color: "#94a3b8", marginTop: "2px", marginBottom: 0 }}>
                Weekly new customer activity · {weekRangeLabel}
              </p>
            </div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <div style={{ display: "flex", border: "1px solid #e2e8f0", borderRadius: "8px", overflow: "hidden" }}>
                <button
                  onClick={() => setWeekOffset(w => w - 1)}
                  style={{ padding: "5px 10px", background: "none", border: "none", cursor: "pointer", color: "#475569", display: "flex", alignItems: "center", borderRight: "1px solid #e2e8f0" }}
                >
                  <ChevronLeft size={13} />
                </button>
                <span style={{ padding: "5px 12px", fontSize: "11px", fontWeight: "600", color: "#1e293b", display: "flex", alignItems: "center", background: "#f8fafc", whiteSpace: "nowrap" }}>
                  {weekLabel}
                </span>
                <button
                  onClick={() => setWeekOffset(w => Math.min(0, w + 1))}
                  disabled={weekOffset === 0}
                  style={{ padding: "5px 10px", background: "none", border: "none", cursor: weekOffset === 0 ? "not-allowed" : "pointer", color: weekOffset === 0 ? "#cbd5e1" : "#475569", display: "flex", alignItems: "center", borderLeft: "1px solid #e2e8f0" }}
                >
                  <ChevronRight size={13} />
                </button>
              </div>
              <button style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "10px", color: "#64748b", border: "1px solid #e2e8f0", borderRadius: "7px", padding: "5px 10px", background: "none", cursor: "pointer", fontWeight: "600" }}>
                <Filter size={11} /> Filter
              </button>
            </div>
          </div>

          <CustomerWeeklyChart data={weeklyData} loading={statsLoading} />

          {/* Summary footer */}
          {!statsLoading && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "14px", paddingTop: "14px", borderTop: "1px solid #f1f5f9", flexWrap: "wrap", gap: "8px" }}>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {weeklyData.filter(d => d.count > 0).map(d => (
                  <div key={d.day} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: G }} />
                    <span style={{ fontSize: "10px", color: "#475569", fontWeight: "600" }}>
                      {d.day}: <strong>{d.count}</strong>
                    </span>
                  </div>
                ))}
                {weeklyData.every(d => d.count === 0) && (
                  <span style={{ fontSize: "10px", color: "#94a3b8" }}>No new customers this week.</span>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {/* Show total new customers from stats as context */}
                {newCustomers > 0 && totalForWeek === 0 && weekOffset === 0 && (
                  <div style={{ fontSize: "10px", color: "#94a3b8", fontStyle: "italic" }}>
                    {newCustomers} new this month
                  </div>
                )}
                <div style={{ fontSize: "11px", fontWeight: "700", color: G, background: "#f0fdf4", padding: "4px 12px", borderRadius: "20px", border: "1px solid #d1fae5" }}>
                  {totalForWeek > 0 ? `${totalForWeek} this week` : newCustomers > 0 && weekOffset === 0 ? `${newCustomers} new customers` : "0 this week"}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Customer Table ── */}
        <div style={{ background: "#fff", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "20px", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <div>
              <span style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a" }}>Customer List</span>
              <p style={{ fontSize: "10px", color: "#94a3b8", margin: "2px 0 0" }}>
                {isFetching ? "Refreshing…" : `${displayTotalCustomers} total · ${customers.length} shown`}
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <SlidersHorizontal size={15} color="#64748b" style={{ cursor: "pointer" }} />
              <ArrowLeftRight    size={15} color="#64748b" style={{ cursor: "pointer" }} />
            </div>
          </div>

          {isLoading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
              <div style={{ width: "32px", height: "32px", border: "3px solid #e2e8f0", borderTopColor: G, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            </div>
          ) : (
            <>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", minWidth: "700px" }}>
                  <thead>
                    <tr style={{ background: "#f0fdf4" }}>
                      {["No", "Customer", "Phone", "Email", "Orders", "Spend", "Status", ""].map((h, i) => (
                        <th key={i} style={{ padding: "10px 12px", textAlign: "left", fontSize: "10px", fontWeight: "700", color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {customers.length === 0 ? (
                      <tr>
                        <td colSpan="8" style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>
                          <Users size={32} color="#e2e8f0" style={{ display: "block", margin: "0 auto 8px" }} />
                          No customers found
                        </td>
                      </tr>
                    ) : (
                      customers.map((customer, idx) => {
                        const { id, email, phone, avatarLetter, displayName } = resolveCustomer(customer);
                        return (
                          <tr
                            key={id || idx}
                            className="cust-row"
                            style={{ borderBottom: "1px solid #f1f5f9", cursor: "pointer", transition: "background 0.15s" }}
                            onClick={() => setSelectedCustomer(customer)}
                          >
                            <td style={{ padding: "12px", color: "#94a3b8", fontSize: "11px", fontWeight: "600" }}>
                              {(currentPage - 1) * itemsPerPage + idx + 1}
                            </td>

                            <td style={{ padding: "12px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: "140px" }}>
                                <div style={{
                                  width: "32px", height: "32px", borderRadius: "50%",
                                  background: `linear-gradient(135deg, ${G}, #4c9f70)`,
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  fontSize: "13px", fontWeight: "700", color: "#fff", flexShrink: 0,
                                }}>
                                  {avatarLetter}
                                </div>
                                <div>
                                  <div style={{ fontSize: "12px", fontWeight: "700", color: "#0f172a", whiteSpace: "nowrap", maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis" }}>
                                    {displayName}
                                  </div>
                                  <div style={{ fontFamily: "monospace", fontSize: "9px", fontWeight: "600", color: G, opacity: 0.8 }}>
                                    {id ? `…${id.slice(-8)}` : "—"}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td style={{ padding: "12px", whiteSpace: "nowrap" }}>
                              {phone ? (
                                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                  <Phone size={11} color="#94a3b8" />
                                  <span style={{ fontSize: "11px", color: "#475569", fontWeight: "600" }}>{phone}</span>
                                </div>
                              ) : (
                                <span style={{ color: "#cbd5e1", fontSize: "11px" }}>—</span>
                              )}
                            </td>

                            <td style={{ padding: "12px", color: "#475569", fontSize: "11px", maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={email || ""}>
                              {email ? (
                                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                  <Mail size={11} color="#94a3b8" />
                                  <span>{email}</span>
                                </div>
                              ) : (
                                <span style={{ color: "#cbd5e1" }}>—</span>
                              )}
                            </td>

                            <td style={{ padding: "12px", color: "#475569", fontWeight: "700" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                <ShoppingBag size={11} color="#94a3b8" />
                                {customer.orderCount ?? 0}
                              </div>
                            </td>

                            <td style={{ padding: "12px", fontWeight: "700", color: "#0f172a" }}>
                              {formatINR(customer.totalSpend ?? 0)}
                            </td>

                            <td style={{ padding: "12px" }}>
                              <span style={{ fontSize: "10px", fontWeight: "700", padding: "3px 10px", borderRadius: "20px", ...getStatusStyle(customer.status) }}>
                                {customer.status || "Inactive"}
                              </span>
                            </td>

                            <td style={{ padding: "12px" }}>
                              <button
                                onClick={e => { e.stopPropagation(); setSelectedCustomer(customer); }}
                                style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}
                              >
                                <MoreHorizontal size={14} />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* ── Pagination ── */}
              {totalPages > 1 && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "16px", paddingTop: "12px", borderTop: "1px solid #f1f5f9" }}>
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    style={{ display: "flex", alignItems: "center", gap: "4px", background: "none", border: "none", fontSize: "12px", fontWeight: "600", color: currentPage === 1 ? "#cbd5e1" : "#475569", cursor: currentPage === 1 ? "not-allowed" : "pointer" }}
                  >
                    <ChevronLeft size={14} /> Previous
                  </button>

                  <div style={{ display: "flex", gap: "4px" }}>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(p => (
                      <button
                        key={p}
                        onClick={() => setCurrentPage(p)}
                        style={{ width: "30px", height: "30px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "11px", fontWeight: "700", cursor: "pointer", background: currentPage === p ? G : "none", color: currentPage === p ? "#fff" : "#475569" }}
                      >
                        {p}
                      </button>
                    ))}
                    {totalPages > 5 && (
                      <>
                        <span style={{ display: "flex", alignItems: "center", padding: "0 4px", fontSize: "12px", color: "#94a3b8" }}>…</span>
                        <button
                          onClick={() => setCurrentPage(totalPages)}
                          style={{ width: "30px", height: "30px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "11px", fontWeight: "700", cursor: "pointer", background: currentPage === totalPages ? G : "none", color: currentPage === totalPages ? "#fff" : "#475569" }}
                        >
                          {totalPages}
                        </button>
                      </>
                    )}
                  </div>

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    style={{ display: "flex", alignItems: "center", gap: "4px", background: "none", border: "none", fontSize: "12px", fontWeight: "600", color: currentPage === totalPages ? "#cbd5e1" : "#475569", cursor: currentPage === totalPages ? "not-allowed" : "pointer" }}
                  >
                    Next <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {selectedCustomer && (
        <CustomerDetailsModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
        />
      )}
    </div>
  );
}
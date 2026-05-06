import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Search, Bell, Sun, MoreVertical, ChevronRight,
  Filter, Plus
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import { fetchProducts } from '../../features/products/productSlice';
import { useGetOrdersQuery, useGetOrderStatsQuery } from '../../features/orders/orderApi';
import { useGetCustomerStatsQuery } from '../../features/customers/customerApi';
import { formatCompactINR, formatINR } from '../../utils/currency';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { data: statsData, isLoading: statsLoading } = useGetOrderStatsQuery(undefined, {
    pollingInterval: 30000,
  });
  const { data: customerStats, isLoading: customerLoading } = useGetCustomerStatsQuery();
  const { data: ordersData, isLoading: ordersLoading } = useGetOrdersQuery();
  const { items: products } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const totalProducts = products?.length || 0;
  const stockProducts = products?.filter(p => p.stock > 0).length || 0;
  const outOfStockProducts = totalProducts - stockProducts;

  const dynamicAreaData = (statsData?.dailySales || []).map(day => {
    const date = new Date(day._id);
    return {
      name: date.toLocaleDateString('en-US', { weekday: 'short' }),
      value: day.total,
    };
  });

  const dynamicBarData = (statsData?.hourlyOrders || []).map(h => ({ value: h.count }));
  if (dynamicBarData.length === 0) {
    for (let i = 0; i < 24; i++) dynamicBarData.push({ value: 0 });
  }

  const displayProducts = products || [];

  const card = {
    background: '#fff',
    borderRadius: '16px',
    padding: '16px',
    border: '1px solid #e2e8f0',
    boxSizing: 'border-box',
  };

  const btnDetails = {
    padding: '4px 14px',
    border: '1px solid #bfdbfe',
    color: '#3b82f6',
    background: 'none',
    fontSize: '11px',
    fontWeight: '600',
    borderRadius: '20px',
    cursor: 'pointer',
    flexShrink: 0,
  };

  const btnFilter = {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    padding: '5px 12px',
    background: '#4c9f70',
    color: '#fff',
    fontSize: '11px',
    fontWeight: '500',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    flexShrink: 0,
  };

  return (
    <>
      <style>{`
        /* ── Base reset ── */
        .dash-root {
          min-height: 100vh;
          background: #f8fafc;
          padding: 20px;
          font-family: sans-serif;
          color: #1e293b;
          box-sizing: border-box;
          width: 100%;
          overflow-x: hidden;
        }
        @media (max-width: 640px) {
          .dash-root { padding: 12px; }
        }

        /* ── Header ── */
        .dash-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .dash-header-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .dash-account-label {
          display: flex;
          flex-direction: column;
          text-align: right;
        }
        @media (max-width: 480px) {
          .dash-account-label { display: none; }
        }

        /* ── Row helpers ── */
        .dash-row {
          display: grid;
          gap: 14px;
          margin-bottom: 14px;
          box-sizing: border-box;
        }

        /* ── ROW 1: 3 stat cards ── */
        .dash-row-3col {
          grid-template-columns: repeat(3, 1fr);
        }
        @media (max-width: 900px) {
          .dash-row-3col { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 560px) {
          .dash-row-3col { grid-template-columns: 1fr; }
        }

        /* ── ROW 2 & 3: 2fr 1fr ── */
        .dash-row-chart {
          grid-template-columns: 2fr 1fr;
        }
        @media (max-width: 900px) {
          .dash-row-chart { grid-template-columns: 1fr; }
        }

        /* ── 5-stat mini row ── */
        .dash-stat-row {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 6px;
          margin-bottom: 14px;
        }
        @media (max-width: 640px) {
          .dash-stat-row { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 400px) {
          .dash-stat-row { grid-template-columns: repeat(2, 1fr); }
        }

        /* ── Country / right sidebar ── */
        .dash-right-col {
          display: flex;
          flex-direction: column;
          gap: 14px;
          min-width: 0;
        }

        /* ── ROW 4 ── */
        .dash-row-4 {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 14px;
          margin-bottom: 14px;
        }
        @media (max-width: 900px) {
          .dash-row-4 { grid-template-columns: 1fr; }
        }

        /* ── Transaction table ── */
        .dash-table-wrap {
          overflow-x: auto;
          width: 100%;
        }

        /* ── Best selling table ── */
        .dash-best-table-wrap {
          overflow-x: auto;
          width: 100%;
        }
      `}</style>

      <div className="dash-root">

        {/* ── Header ── */}
        <div className="dash-header">
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937', margin: 0 }}>Dashboard</h1>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px', marginBottom: 0 }}>Welcome back to your store overview</p>
          </div>
          <div className="dash-header-actions">
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', position: 'relative', padding: '6px', borderRadius: '50%' }}>
              <Bell size={18} />
              <span style={{ position: 'absolute', top: '6px', right: '6px', width: '7px', height: '7px', background: '#f43f5e', border: '2px solid #f8fafc', borderRadius: '50%', display: 'block' }}></span>
            </button>
            <div style={{ width: '42px', height: '24px', background: '#d1fae5', borderRadius: '12px', display: 'flex', alignItems: 'center', padding: '2px', cursor: 'pointer' }}>
              <div style={{ width: '20px', height: '20px', background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }}>
                <Sun size={11} color="#4c9f70" strokeWidth={3} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '8px', borderLeft: '1px solid #e2e8f0' }}>
              <div className="dash-account-label">
                <p style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b', margin: 0, lineHeight: 1 }}>Admin</p>
                <p style={{ fontSize: '10px', color: '#4c9f70', fontWeight: '600', margin: '2px 0 0' }}>Verified</p>
              </div>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg,#4c9f70,#3a895c)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '15px', flexShrink: 0, cursor: 'pointer', border: '2px solid #fff' }}>
                A
              </div>
            </div>
          </div>
        </div>

        {/* ── ROW 1: 3 Cards ── */}
        <div className={`dash-row dash-row-3col`}>

          {/* Total Sales */}
          <div style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Total Sales</p>
                <p style={{ fontSize: '11px', color: '#94a3b8', margin: '2px 0 0' }}>Overall Revenue</p>
              </div>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><MoreVertical size={15} /></button>
            </div>
            <div style={{ marginTop: '12px', display: 'flex', alignItems: 'baseline', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '22px', fontWeight: '700', color: '#1e293b' }}>
                {statsLoading ? '...' : formatINR(statsData?.totalRevenue || 0)}
              </span>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#10b981', whiteSpace: 'nowrap' }}>Revenue Net Total</span>
            </div>
            <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>Total completed transactions</p>
              <button style={btnDetails}>Details</button>
            </div>
          </div>

          {/* Total Orders */}
          <div style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Total Orders</p>
                <p style={{ fontSize: '11px', color: '#94a3b8', margin: '2px 0 0' }}>Lifetime Activity</p>
              </div>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><MoreVertical size={15} /></button>
            </div>
            <div style={{ marginTop: '12px', display: 'flex', alignItems: 'baseline', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '22px', fontWeight: '700', color: '#1e293b' }}>{statsLoading ? '...' : statsData?.total || 0}</span>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#10b981', whiteSpace: 'nowrap' }}>order +{statsData?.pending || 0} new</span>
            </div>
            <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>Total processed orders</p>
              <button style={btnDetails}>Details</button>
            </div>
          </div>

          {/* Pending & Canceled */}
          <div style={{ ...card, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Pending &amp; Canceled</p>
                <p style={{ fontSize: '11px', color: '#94a3b8', margin: '2px 0 0' }}>Direct attention items</p>
              </div>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><MoreVertical size={15} /></button>
            </div>
            <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '11px', fontWeight: '600', color: '#475569', margin: 0 }}>Pending</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b' }}>{statsLoading ? '...' : statsData?.pending || 0}</span>
                  <span style={{ fontSize: '10px', color: '#94a3b8' }}>Need processing</span>
                </div>
              </div>
              <div style={{ width: '1px', height: '36px', background: '#e2e8f0', flexShrink: 0 }}></div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '11px', fontWeight: '600', color: '#475569', margin: 0 }}>Canceled</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b' }}>{statsLoading ? '...' : statsData?.cancelled || 0}</span>
                  <span style={{ fontSize: '10px', color: '#94a3b8' }}>Lost revenue</span>
                </div>
              </div>
            </div>
            <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end', paddingTop: '12px' }}>
              <button style={btnDetails}>Details</button>
            </div>
          </div>
        </div>

        {/* ── ROW 2: Chart + Side ── */}
        <div className={`dash-row dash-row-chart`}>

          {/* Report for this week */}
          <div style={{ ...card, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
              <p style={{ fontSize: '13px', fontWeight: '800', color: '#1e293b', margin: 0 }}>Report for this week</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ display: 'flex', border: '1px solid #d1fae5', borderRadius: '20px', padding: '2px', background: '#fff' }}>
                  <button style={{ padding: '3px 10px', fontSize: '11px', fontWeight: '700', color: '#4c9f70', background: '#f0fdf4', borderRadius: '16px', border: 'none', cursor: 'pointer' }}>This week</button>
                  <button style={{ padding: '3px 10px', fontSize: '11px', fontWeight: '700', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}>Last week</button>
                </div>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><MoreVertical size={15} /></button>
              </div>
            </div>

            {/* 5-stat row */}
            <div className="dash-stat-row">
              {[
                { val: customerLoading ? '...' : String(customerStats?.data?.totalCustomers || 0), name: 'Customers', active: true },
                { val: String(totalProducts), name: 'Total Prod.' },
                { val: String(stockProducts), name: 'In Stock' },
                { val: String(outOfStockProducts), name: 'Out of Stock' },
                { val: formatINR(statsData?.totalRevenue || 0), name: 'Revenue' },
              ].map((stat, i) => (
                <div key={i} style={{ borderBottom: `2px solid ${stat.active ? '#4c9f70' : '#f1f5f9'}`, paddingBottom: '8px', background: stat.active ? 'rgba(240,253,244,0.5)' : 'transparent', minWidth: 0 }}>
                  <div style={{ padding: '0 4px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{stat.val}</div>
                    <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: '2px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{stat.name}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ width: '100%', height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dynamicAreaData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4c9f70" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#4c9f70" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={(value) => formatCompactINR(value, { maximumFractionDigits: 0 })} />
                  <Tooltip
                    cursor={{ stroke: '#4c9f70', strokeWidth: 1, strokeDasharray: '3 3' }}
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div style={{ background: '#aee0b9', color: '#1f2937', fontSize: '11px', fontWeight: 'bold', padding: '5px 10px', borderRadius: '8px', textAlign: 'center' }}>
                            {label}<br />{formatINR(payload[0].value)}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#4c9f70" strokeWidth={2.5} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right: Users + Sales by Country */}
          <div className="dash-right-col">
            <div style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ fontSize: '11px', fontWeight: '700', color: '#3b82f6', margin: 0 }}>Users in last 30 minutes</p>
                  <div style={{ fontSize: '22px', fontWeight: '700', color: '#1e293b', marginTop: '4px' }}>{statsLoading ? '...' : (statsData?.activeUsers30m || 0)}</div>
                  <p style={{ fontSize: '10px', color: '#94a3b8', margin: '4px 0 0' }}>Live active users</p>
                </div>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><MoreVertical size={15} /></button>
              </div>
              <div style={{ height: '50px', width: '100%', marginTop: '8px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dynamicBarData}>
                    <Bar dataKey="value" fill="#4c9f70" radius={[2, 2, 0, 0]} barSize={5} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={{ ...card, flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <p style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Sales by Country</p>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#1e293b' }}>Revenue</span>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {statsLoading ? (
                  <p style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'center' }}>Loading distribution...</p>
                ) : (statsData?.salesByCountry || []).length > 0 ? (
                  statsData.salesByCountry.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', fontWeight: '600', color: '#64748b' }}>{item._id || 'Unknown'}</span>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: '#1e293b' }}>{formatINR(item.revenue)}</span>
                    </div>
                  ))
                ) : (
                  <p style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'center', margin: 0 }}>No global sales data.</p>
                )}
              </div>
              <button style={{ width: '100%', marginTop: '14px', padding: '7px', border: '1px solid #bfdbfe', color: '#3b82f6', background: 'none', fontSize: '11px', fontWeight: '600', borderRadius: '20px', cursor: 'pointer', boxSizing: 'border-box' }}>
                View Insight
              </button>
            </div>
          </div>
        </div>

        {/* ── ROW 3: Transaction + Top Products ── */}
        <div className={`dash-row dash-row-chart`}>

          {/* Transaction */}
          <div style={{ ...card, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <p style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Transaction</p>
              <button style={btnFilter}>Filter <Filter size={11} /></button>
            </div>
            <div className="dash-table-wrap">
              <table style={{ width: '100%', minWidth: '460px', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ fontSize: '11px', color: '#94a3b8', borderBottom: '1px solid #f1f5f9' }}>
                    <th style={{ paddingBottom: '10px', fontWeight: '400', width: '28px' }}>No</th>
                    <th style={{ paddingBottom: '10px', fontWeight: '400' }}>Id Customer</th>
                    <th style={{ paddingBottom: '10px', fontWeight: '400' }}>Order Date</th>
                    <th style={{ paddingBottom: '10px', fontWeight: '400' }}>Status</th>
                    <th style={{ paddingBottom: '10px', fontWeight: '400', textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: '12px', color: '#1e293b' }}>
                  {ordersLoading ? (
                    <tr><td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontWeight: '400' }}>Loading transactions...</td></tr>
                  ) : ordersData?.data?.length > 0 ? ordersData.data.slice(0, 5).map((row, i) => (
                    <tr key={row._id} style={{ borderTop: '1px solid #f8fafc' }}>
                      <td style={{ padding: '11px 0', color: '#64748b', fontWeight: '400' }}>{i + 1}.</td>
                      <td style={{ padding: '11px 8px 11px 0', fontWeight: '600', maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.orderId}</td>
                      <td style={{ padding: '11px 8px 11px 0', color: '#64748b', fontWeight: '400', whiteSpace: 'nowrap' }}>{new Date(row.createdAt).toLocaleDateString('en-GB')}</td>
                      <td style={{ padding: '11px 8px 11px 0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: '700' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0, background: row.status === 'Delivered' ? '#10b981' : row.status === 'Cancelled' ? '#f43f5e' : '#f59e0b' }}></span>
                          {row.status}
                        </div>
                      </td>
                      <td style={{ padding: '11px 0', textAlign: 'right', fontWeight: '600' }}>{formatINR(row.totalPrice ?? row.price ?? 0)}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontWeight: '400' }}>No recent transactions found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end', paddingTop: '12px' }}>
              <button style={btnDetails}>Details</button>
            </div>
          </div>

          {/* Top Products */}
          <div style={{ ...card, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <p style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Top Products (This Week)</p>
              <span style={{ fontSize: '10px', color: '#3b82f6', cursor: 'pointer', fontWeight: '600' }}>All product</span>
            </div>
            <div style={{ position: 'relative', marginBottom: '14px' }}>
              <Search style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={11} />
              <input type="text" placeholder="Search" style={{ width: '100%', paddingLeft: '26px', paddingRight: '8px', paddingTop: '6px', paddingBottom: '6px', border: '1px solid #e2e8f0', borderRadius: '6px', background: '#f8fafc', fontSize: '11px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {statsLoading ? (
                <p style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'center' }}>Analyzing inventory trends...</p>
              ) : (statsData?.topProductsThisWeek || []).slice(0, 4).map((p, i) => (
                <div key={p._id || i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '6px', border: '1px solid #f1f5f9', background: '#f8fafc', overflow: 'hidden', flexShrink: 0, padding: '2px', boxSizing: 'border-box' }}>
                      <img
                        src={p.image && p.image.startsWith('http') ? p.image : `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=10b981&color=fff&bold=true`}
                        alt={p.name}
                        onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=10b981&color=fff&bold=true`; }}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '11px', fontWeight: '700', color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                      <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: '1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.totalQty} units sold</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#1e293b', flexShrink: 0 }}>{formatINR(p.totalRevenue)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── ROW 4: Best Selling + Add New ── */}
        <div className="dash-row-4">

          {/* Best selling */}
          <div style={{ ...card, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <p style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Best selling product</p>
              <button style={btnFilter}>Filter <Filter size={11} /></button>
            </div>
            <div className="dash-best-table-wrap">
              <table style={{ width: '100%', minWidth: '420px', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ fontSize: '10px', color: '#4c9f70', background: '#edf7ee' }}>
                    <th style={{ padding: '9px 12px', fontWeight: '700', letterSpacing: '0.07em', borderRadius: '8px 0 0 8px' }}>PRODUCT</th>
                    <th style={{ padding: '9px 12px', fontWeight: '700', letterSpacing: '0.07em' }}>TOTAL ORDER</th>
                    <th style={{ padding: '9px 12px', fontWeight: '700', letterSpacing: '0.07em' }}>STATUS</th>
                    <th style={{ padding: '9px 12px', fontWeight: '700', letterSpacing: '0.07em', textAlign: 'right', borderRadius: '0 8px 8px 0' }}>PRICE</th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: '12px', color: '#1e293b' }}>
                  {statsLoading ? (
                    <tr><td colSpan="4" style={{ padding: '20px', textAlign: 'center' }}>Fetching performance metrics...</td></tr>
                  ) : (statsData?.topProducts || []).slice(0, 5).map((p, i) => (
                    <tr key={p._id || i} style={{ borderBottom: '1px solid #f8fafc' }}>
                      <td style={{ padding: '11px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                          <div style={{ width: '28px', height: '28px', borderRadius: '5px', border: '1px solid #f1f5f9', background: '#f8fafc', overflow: 'hidden', flexShrink: 0, padding: '2px', boxSizing: 'border-box' }}>
                            <img
                              src={p.image && p.image.startsWith('http') ? p.image : `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=10b981&color=fff&bold=true`}
                              alt={p.name}
                              onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=10b981&color=fff&bold=true`; }}
                              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            />
                          </div>
                          <span style={{ fontSize: '11px', fontWeight: '600', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>{p.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '11px 12px', color: '#64748b', fontWeight: '800' }}>{p.totalQty}</td>
                      <td style={{ padding: '11px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: '700', color: '#10b981' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0, background: '#10b981' }}></span>
                          ACTIVE
                        </div>
                      </td>
                      <td style={{ padding: '11px 12px', textAlign: 'right', fontWeight: '700' }}>{formatINR(p.totalRevenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end', paddingTop: '12px' }}>
              <button style={btnDetails}>Details</button>
            </div>
          </div>

          {/* Add New Product */}
          <div style={{ ...card, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <p style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Add New Product</p>
              <button style={{ fontSize: '11px', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}>
                <div style={{ width: '14px', height: '14px', borderRadius: '3px', border: '1px solid #3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Plus size={9} strokeWidth={3} />
                </div>
                Add New
              </button>
            </div>

            <p style={{ fontSize: '11px', fontWeight: '500', color: '#94a3b8', margin: '14px 0 10px' }}>Product</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {displayProducts.slice(0, 3).map((p, i) => (
                <div key={p._id || i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #f1f5f9', background: '#f8fafc', overflow: 'hidden', flexShrink: 0, padding: '2px', boxSizing: 'border-box' }}>
                      <img
                        src={p.image && p.image.startsWith('http') ? p.image : `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=10b981&color=fff&bold=true`}
                        alt=""
                        onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=10b981&color=fff&bold=true`; }}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '11px', fontWeight: '700', color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                      <div style={{ fontSize: '10px', fontWeight: '700', color: '#4c9f70' }}>{formatINR(p.price)}</div>
                    </div>
                  </div>
                  <button style={{ display: 'flex', alignItems: 'center', gap: '3px', padding: '4px 10px', borderRadius: '6px', background: '#4c9f70', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '10px', fontWeight: '600', flexShrink: 0 }}>
                    <Plus size={8} strokeWidth={3} /> Add
                  </button>
                </div>
              ))}
              <div style={{ textAlign: 'center', paddingTop: '8px' }}>
                <button style={{ fontSize: '10px', color: '#3b82f6', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer' }}>See more</button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
};

export default Dashboard;
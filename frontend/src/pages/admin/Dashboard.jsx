import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Filter, Plus, IndianRupee, ShoppingBag, AlertCircle, Bell, Sun, Clock, MoreVertical, Search,
  ChevronDown, ChevronLeft, ChevronRight
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import { fetchProducts } from '../../features/products/productSlice';
import { useGetOrdersQuery, useGetOrderStatsQuery } from '../../features/orders/orderApi';
import { useGetCustomerStatsQuery } from '../../features/customers/customerApi';
import { formatCompactINR, formatINR } from '../../utils/currency';

/* ── Stat Card ── */
function StatCard({ title, value, badge, badgeUp, sub, onClick, loading, isFirst, icon: Icon, color }) {
  const accent = isFirst ? '#ffffff' : '#938359';
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border border-slate-100 p-5 shadow-sm transition-all hover:shadow-md flex flex-col justify-between h-full cursor-pointer ${isFirst ? 'bg-heritage' : 'bg-white'}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isFirst ? 'bg-white/20' : 'bg-slate-50 border border-slate-100'}`}
        >
          {Icon && <Icon size={20} style={{ color: accent }} />}
        </div>
        {badge && (
          <span
            className={`text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5 uppercase tracking-wide ${
              isFirst ? 'bg-white/20 text-white' : (badgeUp ? 'bg-amber-50 text-[#938359]' : 'bg-red-50 text-rose-600')
            }`}
          >
            {badgeUp ? '↑' : '↓'} {badge}
          </span>
        )}
      </div>
      <div>
        <div className={`text-2xl font-black tracking-tight leading-none mb-1 ${isFirst ? 'text-white' : 'text-heritage'}`}>
          {loading ? '...' : value}
        </div>
        <div className={`text-[12px] font-black uppercase tracking-widest ${isFirst ? 'text-white/70' : 'text-heritage/60'}`}>{title}</div>
        {sub && <div className={`text-[11px] font-bold mt-1 uppercase tracking-tight ${isFirst ? 'text-white/60' : 'text-slate-400'}`}>{sub}</div>}
      </div>
    </div>
  );
}

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

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-5 font-sans text-slate-800 w-full overflow-x-hidden">

      {/* Header */}
      <div className="flex justify-between items-center mb-5 gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-gray-800 m-0">Dashboard</h1>
          <p className="text-xs text-slate-400 mt-0.5 mb-0">Welcome back to your store overview</p>
        </div>
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <button className="bg-transparent border-none cursor-pointer text-slate-400 relative p-1.5 rounded-full">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 border-2 border-slate-50 rounded-full block"></span>
          </button>
          <div className="w-11 h-6 bg-amber-100 rounded-xl flex items-center p-0.5 cursor-pointer">
            <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
              <Sun size={11} color="#938359" strokeWidth={3} />
            </div>
          </div>
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="hidden sm:flex flex-col text-right">
              <p className="text-xs font-bold text-slate-800 m-0 leading-none">Admin</p>
              <p className="text-[10px] text-[#938359] font-semibold mt-0.5 mb-0">Verified</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#b09e6d] to-[#938359] flex items-center justify-center text-white font-bold text-base shrink-0 cursor-pointer border-2 border-white">
              A
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard 
          title="Total Sales" 
          value={statsLoading ? '...' : formatINR(statsData?.totalRevenue || 0)} 
          sub="Overall Revenue" 
          isFirst={true} 
          icon={IndianRupee} 
        />
        <StatCard 
          title="Total Orders" 
          value={statsLoading ? '...' : statsData?.total || 0} 
          sub={`Lifetime · ${statsData?.pending || 0} new`} 
          icon={ShoppingBag} 
        />
        <div className="grid grid-cols-2 gap-4">
          <StatCard 
            title="Pending" 
            value={statsLoading ? '...' : statsData?.pending || 0} 
            sub="Needs action" 
            icon={Clock} 
          />
          <StatCard 
            title="Canceled" 
            value={statsLoading ? '...' : statsData?.cancelled || 0} 
            sub="Lost revenue" 
            icon={AlertCircle} 
          />
        </div>
      </div>

      {/* ROW 2: Chart + Side Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 mb-3.5">

        {/* Report for this week - takes 2 cols */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-4 border border-slate-200 flex flex-col min-w-0 overflow-hidden">
          <div className="flex justify-between items-center mb-3.5 gap-2 flex-wrap">
            <p className="text-[13px] font-extrabold text-heritage m-0">Report for this week</p>
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="flex border border-amber-100 rounded-2xl p-0.5 bg-[#FFF5E2]">
                <button className="px-2.5 py-0.5 text-[11px] font-bold text-[#938359] bg-white rounded-2xl border-none cursor-pointer shadow-sm">This week</button>
                <button className="px-2.5 py-0.5 text-[11px] font-bold text-slate-400 bg-transparent border-none cursor-pointer">Last week</button>
              </div>
              <button className="bg-transparent border-none cursor-pointer text-slate-400"><MoreVertical size={15} /></button>
            </div>
          </div>

          {/* 5-stat row */}
          <div className="grid grid-cols-5 gap-1.5 mb-3.5">
            {[
              { val: customerLoading ? '...' : String(customerStats?.data?.totalCustomers || 0), name: 'Customers', active: true },
              { val: String(totalProducts), name: 'Total Prod.' },
              { val: String(stockProducts), name: 'In Stock' },
              { val: String(outOfStockProducts), name: 'Out of Stock' },
              { val: statsLoading ? '...' : formatCompactINR(statsData?.totalRevenue || 0), name: 'Revenue' },
            ].map((stat, i) => (
              <div key={i} className={`pb-2 min-w-0 ${stat.active ? 'border-b-2 border-[#938359] bg-amber-50/50' : 'border-b-2 border-slate-100'}`}>
                <div className="px-1">
                  <div className="text-[13px] font-bold text-slate-800 truncate">{stat.val}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5 font-bold uppercase tracking-[0.04em] truncate">{stat.name}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="w-full flex-1 min-h-[180px]">
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={dynamicAreaData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#938359" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#938359" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={(v) => formatCompactINR(v, { maximumFractionDigits: 0 })} />
                <Tooltip
                  cursor={{ stroke: '#938359', strokeWidth: 1, strokeDasharray: '3 3' }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#FFF5E2] border border-amber-100 text-[#938359] text-[11px] font-bold px-2.5 py-1.5 rounded-lg text-center shadow-sm">
                          {label}<br />{formatINR(payload[0].value)}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area type="monotone" dataKey="value" stroke="#938359" strokeWidth={2.5} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Users + Sales by Country */}
        <div className="flex flex-col gap-3.5 min-w-0">
          <div className="bg-white rounded-2xl p-4 border border-slate-200">
            <div className="flex justify-between items-start mb-1">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold text-heritage m-0">Users in last 30 minutes</p>
                <div className="text-2xl font-bold text-slate-800 mt-1">{statsLoading ? '...' : (statsData?.activeUsers30m || 0)}</div>
                <p className="text-[10px] text-slate-400 mt-1 mb-0">Live active users</p>
              </div>
              <button className="bg-transparent border-none cursor-pointer text-slate-400 shrink-0 ml-2"><MoreVertical size={15} /></button>
            </div>
            <div className="h-12 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dynamicBarData}>
                  <Bar dataKey="value" fill="#938359" radius={[2, 2, 0, 0]} barSize={5} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200 flex-1 flex flex-col min-w-0">
            <div className="flex justify-between items-center mb-3">
              <p className="text-xs font-bold text-slate-800 m-0">Sales by Country</p>
              <span className="text-[11px] font-bold text-slate-800 shrink-0">Revenue</span>
            </div>
            <div className="flex-1 flex flex-col gap-2 min-h-0">
              {statsLoading ? (
                <p className="text-[11px] text-slate-400 text-center">Loading...</p>
              ) : (statsData?.salesByCountry || []).length > 0 ? (
                statsData.salesByCountry.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center gap-2">
                    <span className="text-[11px] font-semibold text-slate-500 truncate">{item._id || 'Unknown'}</span>
                    <span className="text-[11px] font-bold text-slate-800 shrink-0">{formatINR(item.revenue)}</span>
                  </div>
                ))
              ) : (
                <p className="text-[11px] text-slate-400 text-center m-0">No global sales data.</p>
              )}
            </div>
            <button className="w-full mt-3 py-1.5 border border-amber-200 text-heritage bg-transparent text-[11px] font-semibold rounded-2xl cursor-pointer">
              View Insight
            </button>
          </div>
        </div>
      </div>

      {/* ROW 3: Transaction + Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 mb-3.5">

        {/* Transaction - 2 cols */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-4 border border-slate-200 flex flex-col min-w-0 overflow-hidden">
          <div className="flex justify-between items-center mb-3.5 gap-2 flex-wrap">
            <p className="text-[13px] font-bold text-heritage m-0">Transaction</p>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#938359] text-white text-[11px] font-medium rounded-lg border-none cursor-pointer shrink-0">
              Filter <Filter size={11} />
            </button>
          </div>
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse" style={{ minWidth: '400px' }}>
              <thead>
                <tr className="text-[11px] text-slate-400 border-b border-slate-100">
                  <th className="pb-2.5 font-normal w-7">No</th>
                  <th className="pb-2.5 font-normal">Id Customer</th>
                  <th className="pb-2.5 font-normal">Order Date</th>
                  <th className="pb-2.5 font-normal">Status</th>
                  <th className="pb-2.5 font-normal text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="text-xs text-slate-800">
                {ordersLoading ? (
                  <tr><td colSpan="5" className="p-5 text-center text-slate-400">Loading transactions...</td></tr>
                ) : ordersData?.data?.length > 0 ? ordersData.data.slice(0, 5).map((row, i) => (
                  <tr key={row._id} className="border-t border-slate-50">
                    <td className="py-2.5 text-slate-500 font-normal">{i + 1}.</td>
                    <td className="py-2.5 pr-2 font-semibold max-w-[120px] truncate">{row.orderId}</td>
                    <td className="py-2.5 pr-2 text-slate-500 font-normal whitespace-nowrap">{new Date(row.createdAt).toLocaleDateString('en-GB')}</td>
                    <td className="py-2.5 pr-2">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${row.status === 'Delivered' ? 'bg-[#938359]' : row.status === 'Cancelled' ? 'bg-rose-500' : 'bg-amber-400'}`}></span>
                        {row.status}
                      </div>
                    </td>
                    <td className="py-2.5 text-right font-semibold whitespace-nowrap">{formatINR(row.totalPrice ?? row.price ?? 0)}</td>
                  </tr>
                )) : (
                  <tr><td colSpan="5" className="p-5 text-center text-slate-400">No recent transactions found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end pt-3 mt-auto">
            <button className="px-3 py-1 border border-amber-200 text-heritage bg-transparent text-[11px] font-semibold rounded-2xl cursor-pointer">Details</button>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 min-w-0">
          <div className="flex justify-between items-center mb-3">
            <p className="text-xs font-bold text-heritage m-0 truncate flex-1">Top Products (This Week)</p>
            <span className="text-[10px] text-heritage cursor-pointer font-semibold shrink-0 ml-2">All product</span>
          </div>
          <div className="relative mb-3">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" size={11} />
            <input type="text" placeholder="Search" className="w-full pl-6 pr-2 py-1.5 border border-slate-200 rounded-md bg-slate-50 text-[11px] outline-none" />
          </div>
          <div className="flex flex-col gap-3">
            {statsLoading ? (
              <p className="text-[11px] text-slate-400 text-center">Analyzing inventory trends...</p>
            ) : (statsData?.topProductsThisWeek || []).slice(0, 4).map((p, i) => (
              <div key={p._id || i} className="flex justify-between items-center gap-2 min-w-0">
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-md border border-slate-100 bg-slate-50 overflow-hidden shrink-0">
                    <img
                      src={p.image && p.image.startsWith('http') ? p.image : `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=938359&color=fff&bold=true`}
                      alt={p.name}
                      onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=938359&color=fff&bold=true`; }}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] font-bold text-slate-800 truncate">{p.name}</div>
                    <div className="text-[9px] text-slate-400 mt-0.5">{p.totalQty} units sold</div>
                  </div>
                </div>
                <div className="text-[11px] font-bold text-slate-800 shrink-0">{formatINR(p.totalRevenue)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ROW 4: Best Selling + Add New */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">

        {/* Best selling - 2 cols */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-4 border border-slate-200 flex flex-col min-w-0 overflow-hidden">
          <div className="flex justify-between items-center mb-3.5 gap-2 flex-wrap">
            <p className="text-[13px] font-bold text-heritage m-0">Best selling product</p>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#938359] text-white text-[11px] font-medium rounded-lg border-none cursor-pointer shrink-0">
              Filter <Filter size={11} />
            </button>
          </div>
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse" style={{ minWidth: '380px' }}>
              <thead>
                <tr className="text-[10px] text-[#938359] bg-[#f9f5e8]">
                  <th className="py-2.5 px-3 font-bold tracking-[0.07em] rounded-l-lg">PRODUCT</th>
                  <th className="py-2.5 px-3 font-bold tracking-[0.07em]">TOTAL ORDER</th>
                  <th className="py-2.5 px-3 font-bold tracking-[0.07em]">STATUS</th>
                  <th className="py-2.5 px-3 font-bold tracking-[0.07em] text-right rounded-r-lg">PRICE</th>
                </tr>
              </thead>
              <tbody className="text-xs text-slate-800">
                {statsLoading ? (
                  <tr><td colSpan="4" className="p-5 text-center text-slate-400">Fetching performance metrics...</td></tr>
                ) : (statsData?.topProducts || []).slice(0, 5).map((p, i) => (
                  <tr key={p._id || i} className="border-b border-slate-50">
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-md border border-slate-100 bg-slate-50 overflow-hidden shrink-0">
                          <img
                            src={p.image && p.image.startsWith('http') ? p.image : `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=938359&color=fff&bold=true`}
                            alt={p.name}
                            onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=938359&color=fff&bold=true`; }}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <span className="text-[11px] font-semibold text-slate-900 truncate max-w-[130px]">{p.name}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 font-extrabold">{p.totalQty}</td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#938359]">
                        <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-[#938359]"></span>
                        ACTIVE
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold whitespace-nowrap">{formatINR(p.totalRevenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end pt-3 mt-auto">
            <button className="px-3 py-1 border border-amber-200 text-heritage bg-transparent text-[11px] font-semibold rounded-2xl cursor-pointer">Details</button>
          </div>
        </div>

        {/* Add New Product */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 flex flex-col min-w-0">
          <div className="flex justify-between items-center mb-3">
            <p className="text-xs font-bold text-heritage m-0">Add New Product</p>
            <button className="text-[11px] text-heritage flex items-center gap-1 font-semibold bg-transparent border-none cursor-pointer shrink-0">
              <div className="w-3.5 h-3.5 rounded border border-[#938359] flex items-center justify-center">
                <Plus size={9} strokeWidth={3} />
              </div>
              Add New
            </button>
          </div>
          <p className="text-[11px] font-medium text-slate-400 mb-2.5 mt-2">Product</p>
          <div className="flex flex-col gap-2.5">
            {displayProducts.slice(0, 3).map((p, i) => (
              <div key={p._id || i} className="flex justify-between items-center gap-2 min-w-0">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="w-7 h-7 rounded-md border border-slate-100 bg-slate-50 overflow-hidden shrink-0">
                    <img
                      src={p.image && p.image.startsWith('http') ? p.image : `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=938359&color=fff&bold=true`}
                      alt=""
                      onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=938359&color=fff&bold=true`; }}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] font-bold text-slate-800 truncate">{p.name}</div>
                    <div className="text-[10px] font-bold text-[#938359]">{formatINR(p.price)}</div>
                  </div>
                </div>
                <button className="flex items-center gap-0.5 px-2.5 py-1 rounded-md bg-[#938359] text-white border-none cursor-pointer text-[10px] font-semibold shrink-0">
                  <Plus size={8} strokeWidth={3} /> Add
                </button>
              </div>
            ))}
            <div className="text-center pt-1">
              <button className="text-[10px] text-heritage font-semibold bg-transparent border-none cursor-pointer">See more</button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
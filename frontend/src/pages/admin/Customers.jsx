import React, { useState, useEffect } from "react";
import {
  useGetCustomersQuery,
  useGetCustomerStatsQuery,
} from "../../features/customers/customerApi";
import {
  Search, ChevronLeft, ChevronRight, Users, TrendingUp, UserCheck,
  UserX, MoreHorizontal, Bell, Zap, ExternalLink, LogOut, ChevronDown,
  SlidersHorizontal, ArrowLeftRight, Calendar, Filter, LayoutDashboard,
  ClipboardList, Tag, Grid2x2, Heart, PlusSquare, Image, List, Star,
  ShieldCheck, Settings2
} from "lucide-react";
import { formatINR } from "../../utils/currency";

/* ── Palette ── */
const G = "#1a6b3c";
const LIGHT_G = "#e8f5ee";


/* ── Stat Card component ── */
function StatCard({ title, value, badge, badgeUp, sub, onClick, loading }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-[14px_16px] cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-[11px] text-slate-600">{title}</span>
        <MoreHorizontal size={14} color="#cbd5e1" className="cursor-pointer" onClick={(e) => {
          e.stopPropagation();
          alert(`More options for ${title}`);
        }} />
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-[22px] font-extrabold text-slate-900">
          {loading ? '...' : (value !== undefined && value !== null ? value : 0)}
        </span>
        {badge && (
          <span className={`text-[10px] font-bold py-0.5 px-1.5 rounded-full ${
            badgeUp ? 'bg-[#e8f5ee] text-[#1a6b3c]' : 'bg-[#fce8e8] text-[#c0392b]'
          }`}>{badge}</span>
        )}
      </div>
      <div className="text-[10px] text-slate-400 mt-0.5">{sub}</div>
    </div>
  );
}

/* ── Customer Growth Line Graph ── */
function CustomerGrowthGraph({ data, loading }) {
  const maxValue = Math.max(...(data?.map(d => d.count) || [50, 80, 120, 90, 150, 200, 180]), 1);
  
  const graphData = data || [
    { month: 'Jan', count: 50 },
    { month: 'Feb', count: 80 },
    { month: 'Mar', count: 120 },
    { month: 'Apr', count: 90 },
    { month: 'May', count: 150 },
    { month: 'Jun', count: 200 },
    { month: 'Jul', count: 180 },
  ];

  const points = graphData.map((item, idx) => {
    const x = (idx / (graphData.length - 1)) * 100;
    const y = 100 - (item.count / maxValue) * 80;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 mb-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-[13px] font-semibold text-slate-900">Customer Growth</span>
          <p className="text-[10px] text-slate-400 mt-0.5">Monthly new customer acquisition</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="text-[10px] text-slate-500 border border-slate-200 rounded-md px-2 py-1 flex items-center gap-1">
            <Calendar size={12} /> This Year <ChevronDown size={10} />
          </button>
          <button className="text-[10px] text-slate-500 border border-slate-200 rounded-md px-2 py-1 flex items-center gap-1">
            <Filter size={12} /> Filter
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="h-40 flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1a6b3c]"></div>
        </div>
      ) : (
        <div className="relative h-40">
          <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-between text-[9px] text-slate-400">
            <span>{maxValue}</span>
            <span>{Math.round(maxValue * 0.75)}</span>
            <span>{Math.round(maxValue * 0.5)}</span>
            <span>{Math.round(maxValue * 0.25)}</span>
            <span>0</span>
          </div>
          
          <div className="ml-8 h-full relative">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} className="border-t border-slate-100 w-full" />
              ))}
            </div>
            
            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
              <polygon
                points={`0,100 ${points} 100,100`}
                fill="url(#gradient)"
                opacity="0.3"
              />
              <polyline
                points={points}
                fill="none"
                stroke={G}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={G} stopOpacity="0.3" />
                  <stop offset="100%" stopColor={G} stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
            
            <div className="absolute inset-0">
              {graphData.map((item, idx) => {
                const left = `${(idx / (graphData.length - 1)) * 100}%`;
                const bottom = `${(item.count / maxValue) * 80}%`;
                return (
                  <div key={idx} className="absolute group" style={{ left, bottom: `calc(${bottom} - 5px)` }}>
                    <div className="w-2 h-2 rounded-full bg-white border-2 border-[#1a6b3c]"></div>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-slate-800 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
                      {item.month}: {item.count}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[9px] text-slate-400 mt-1">
              {graphData.map((item, idx) => (
                <span key={idx} style={{ width: `${100 / graphData.length}%`, textAlign: 'center' }}>{item.month}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Customer Details Modal ── */
function CustomerDetailsModal({ customer, onClose }) {
  if (!customer) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Customer Details</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
        <div className="space-y-3">
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wide">Full Name</p>
            <p className="text-sm font-medium text-slate-900">{customer.name}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wide">Customer ID</p>
            <p className="text-sm text-slate-600 font-mono">{customer._id}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wide">Total Orders</p>
            <p className="text-sm font-medium text-slate-900">{customer.orderCount || 0}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wide">Total Spent</p>
            <p className="text-sm font-medium text-slate-900">{formatINR(customer.totalSpend)}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wide">Status</p>
            <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold ${
              customer.status === 'VIP' ? 'bg-[#e8f5ee] text-[#1a6b3c]' :
              customer.status === 'Active' ? 'bg-[#e3f2fd] text-[#1565c0]' : 'bg-[#fce8e8] text-[#c0392b]'
            }`}>
              {customer.status || 'Standard'}
            </span>
          </div>
        </div>
        <div className="flex gap-2 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2 text-sm border border-slate-200 rounded-md hover:bg-slate-50"
          >
            Close
          </button>
          <button
            onClick={() => alert(`View orders for ${customer.name}`)}
            className="flex-1 py-2 text-sm bg-[#1a6b3c] text-white rounded-md hover:bg-[#145a32]"
          >
            View Orders
          </button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   MAIN CUSTOMER COMPONENT
════════════════════════════════════════════════ */
export default function Customers() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showMoreActions, setShowMoreActions] = useState(false);
  
  const itemsPerPage = 5;

  const { data: stats, isLoading: statsLoading, error: statsError } = useGetCustomerStatsQuery();
  const { data, isLoading, isFetching, error: customersError } = useGetCustomersQuery({ 
    page: currentPage, 
    search: searchQuery 
  });

  useEffect(() => {
    console.log('Stats API response:', stats);
    console.log('Stats error:', statsError);
    console.log('Customers API response:', data);
    console.log('Customers error:', customersError);
  }, [stats, statsError, data, customersError]);

  const totalCustomers = stats?.totalCustomers ?? stats?.total ?? stats?.data?.totalCustomers ?? 0;
  const newCustomers = stats?.newCustomers ?? stats?.new ?? stats?.data?.newCustomers ?? 0;
  const repeatCustomers = stats?.repeatCustomers ?? stats?.repeat ?? stats?.data?.repeatCustomers ?? 0;
  
  const customers = data?.data || data?.customers || data || [];
  const totalPages = data?.pagination?.pages || data?.totalPages || 1;

  const growthData = [
    { month: 'Jan', count: 45 },
    { month: 'Feb', count: 52 },
    { month: 'Mar', count: 68 },
    { month: 'Apr', count: 74 },
    { month: 'May', count: 89 },
    { month: 'Jun', count: 112 },
    { month: 'Jul', count: newCustomers || 134 },
  ];

  const getStatusStyle = (status) => {
    switch(status) {
      case 'VIP': return { background: '#e8f5ee', color: '#1a6b3c' };
      case 'Active': return { background: '#e3f2fd', color: '#1565c0' };
      default: return { background: '#fce8e8', color: '#c0392b' };
    }
  };

  if (statsError || customersError) {
    return (
      /* ── FIX: use w-full with NO nested flex that fights the sidebar ── */
      <div className="w-full min-h-[calc(100vh-60px)] bg-slate-50 p-5 flex items-center justify-center">
        <div className="bg-white rounded-lg border border-red-200 p-6 text-center">
          <p className="text-red-600 mb-2">Error loading data</p>
          <p className="text-xs text-slate-500">{statsError?.message || customersError?.message || 'Please check your API connection'}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-[#1a6b3c] text-white rounded-md text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    /*
     * FIX: Remove the outer `flex` wrapper that was causing the sidebar overlap.
     * The sidebar is rendered by a parent layout component and already occupies
     * its own column. This component only needs to fill the remaining space,
     * so we use `w-full` + `min-h` with overflow handling — no extra flex row.
     */
    <div className="w-full min-h-[calc(100vh-60px)] bg-slate-50 overflow-auto">
      <div className="p-5">

        {/* Top bar */}
        <div className="flex items-center justify-between mb-5">
          <span className="text-base font-bold text-slate-900">Customer Dashboard</span>
          
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg py-1.5 px-3 w-[220px] text-xs text-slate-400">
            <Search size={13} color="#94a3b8" />
            <input 
              type="text" 
              placeholder="Search customers..." 
              className="border-none outline-none w-full bg-transparent text-xs"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          
          <div className="flex items-center gap-2.5">
            <Bell size={18} color="#64748b" className="cursor-pointer" onClick={() => alert('Notifications')} />
            <Zap size={18} color="#64748b" className="cursor-pointer" onClick={() => alert('Quick actions')} />
            <div className="w-[30px] h-[30px] rounded-full bg-[#c8e6c9] flex items-center justify-center text-xs font-semibold text-[#1a6b3c] cursor-pointer">A</div>
          </div>
        </div>

        {/* Customer List header */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-[15px] font-bold text-slate-900">Customer List</span>
          <div className="flex gap-2 relative">
            <div className="relative">
              <button 
                onClick={() => setShowMoreActions(!showMoreActions)}
                className="flex items-center gap-1 bg-white text-slate-600 border border-slate-200 rounded-md py-1.5 px-3 text-xs cursor-pointer"
              >
                More Action <ChevronDown size={12} />
              </button>
              {showMoreActions && (
                <div className="absolute top-full right-0 bg-white border border-slate-200 rounded-md py-2 mt-1 min-w-[160px] shadow-md z-10">
                  {['Export CSV', 'Import', 'Bulk Email', 'Bulk SMS', 'Settings'].map((action) => (
                    <div 
                      key={action}
                      className="py-1.5 px-3 text-xs cursor-pointer hover:bg-slate-50"
                      onClick={() => {
                        alert(`${action} clicked`);
                        setShowMoreActions(false);
                      }}
                    >
                      {action}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          <StatCard 
            title="Total Customers" 
            value={totalCustomers} 
            badge="↑ 12.5%" 
            badgeUp 
            sub="vs last month" 
            loading={statsLoading}
          />
          <StatCard 
            title="New Customers" 
            value={newCustomers} 
            badge="↑ 23%" 
            badgeUp 
            sub="This month" 
            loading={statsLoading}
          />
          <StatCard 
            title="Repeat Customers" 
            value={repeatCustomers} 
            badge="↑ 8.2%" 
            badgeUp 
            sub="Returning rate" 
            loading={statsLoading}
          />
          <StatCard 
            title="Growth" 
            value="24%" 
            badge="↑ 5%" 
            badgeUp 
            sub="vs last month" 
            loading={false}
          />
        </div>

        {/* Customer Growth Graph */}
        <CustomerGrowthGraph data={growthData} loading={statsLoading} />

        {/* Table Card */}
        <div className="bg-white rounded-lg border border-slate-200 p-4">

          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">
                {isFetching ? 'Refreshing...' : `${Array.isArray(customers) ? customers.length : 0} customers shown`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={15} color="#64748b" className="cursor-pointer" onClick={() => alert('Filter options')} />
              <ArrowLeftRight size={15} color="#64748b" className="cursor-pointer" onClick={() => alert('Import/Export')} />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a6b3c]"></div>
            </div>
          ) : (
            <>
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-[#f0fdf4]">
                    <th className="py-2 px-2.5 text-left text-[11px] font-bold text-slate-600 uppercase tracking-wide">No</th>
                    <th className="py-2 px-2.5 text-left text-[11px] font-bold text-slate-600 uppercase tracking-wide">ID</th>
                    <th className="py-2 px-2.5 text-left text-[11px] font-bold text-slate-600 uppercase tracking-wide">Name</th>
                    <th className="py-2 px-2.5 text-left text-[11px] font-bold text-slate-600 uppercase tracking-wide">Orders</th>
                    <th className="py-2 px-2.5 text-left text-[11px] font-bold text-slate-600 uppercase tracking-wide">Spend</th>
                    <th className="py-2 px-2.5 text-left text-[11px] font-bold text-slate-600 uppercase tracking-wide">Status</th>
                    <th className="py-2 px-2.5 text-left text-[11px] font-bold text-slate-600 uppercase tracking-wide"></th>
                  </tr>
                </thead>
                <tbody>
                  {!Array.isArray(customers) || customers.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-8 text-slate-500">
                        No customers found
                      </td>
                    </tr>
                  ) : (
                    customers.map((customer, idx) => (
                      <tr 
                        key={customer._id || customer.id || idx} 
                        className="border-b border-slate-100 cursor-pointer hover:bg-slate-50"
                        onClick={() => setSelectedCustomer(customer)}
                      >
                        <td className="py-2.5 px-2.5 text-slate-600">
                          {((currentPage - 1) * itemsPerPage) + idx + 1}
                        </td>
                        <td className="py-2.5 px-2.5 text-[#1a6b3c] font-semibold font-mono text-[10px]">
                          {(customer._id || customer.id)?.slice(-12) || 'N/A'}
                        </td>
                        <td className="py-2.5 px-2.5">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-600 flex-shrink-0">
                              {customer.name?.charAt(0) || 'U'}
                            </div>
                            <span className="text-slate-900 font-medium">{customer.name}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-2.5 text-slate-600">{customer.orderCount || customer.orders || 0}</td>
                        <td className="py-2.5 px-2.5 text-slate-900 font-medium">
                          {formatINR(customer.totalSpend || customer.spend || 0)}
                        </td>
                        <td className="py-2.5 px-2.5">
                          <span 
                            className="text-[11px] font-semibold py-0.5 px-2.5 rounded-full"
                            style={getStatusStyle(customer.status)}
                          >
                            {customer.status || 'Standard'}
                          </span>
                        </td>
                        <td className="py-2.5 px-2.5">
                          <button 
                            className="text-slate-400 hover:text-slate-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCustomer(customer);
                            }}
                          >
                            <MoreHorizontal size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-3.5">
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className="flex items-center gap-1 bg-none border-none text-xs font-medium disabled:text-slate-300 disabled:cursor-not-allowed text-slate-600 cursor-pointer"
                  >
                    <ChevronLeft size={14} /> Previous
                  </button>
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button 
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`py-1 px-2.5 text-xs cursor-pointer border border-slate-200 rounded-md ${
                            currentPage === page ? 'bg-[#1a6b3c] text-white font-bold' : 'bg-white text-slate-600 font-normal'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    {totalPages > 5 && (
                      <>
                        <span className="flex items-center px-1">...</span>
                        <button 
                          onClick={() => setCurrentPage(totalPages)}
                          className={`py-1 px-2.5 text-xs cursor-pointer border border-slate-200 rounded-md ${
                            currentPage === totalPages ? 'bg-[#1a6b3c] text-white font-bold' : 'bg-white text-slate-600 font-normal'
                          }`}
                        >
                          {totalPages}
                        </button>
                      </>
                    )}
                  </div>
                  <button 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className="flex items-center gap-1 bg-none border-none text-xs font-medium disabled:text-slate-300 disabled:cursor-not-allowed text-slate-600 cursor-pointer"
                  >
                    Next <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <CustomerDetailsModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
        />
      )}
    </div>
  );
}

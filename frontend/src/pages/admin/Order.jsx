import React, { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import {
  MoreHorizontal,
  Search,
  ChevronDown,
  SlidersHorizontal,
  ArrowLeftRight,
  ChevronLeft,
  ChevronRight,
  Bell,
  Zap,
  Plus,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import {
  useGetOrdersQuery,
  useGetOrderStatsQuery,
  useUpdateOrderStatusMutation,
  useCreateOrderMutation,
} from '../../features/orders/orderApi';
import { formatINR } from '../../utils/currency';

/* ── Status badge styles ── */
const statusStyle = {
  Delivered: { background: '#e8f5ee', color: '#1a6b3c' },
  Pending: { background: '#e3f2fd', color: '#1565c0' },
  Shipped: { background: '#e8f5ee', color: '#1a6b3c' },
  Cancelled: { background: '#fce8e8', color: '#c0392b' },
};

const paymentDot = {
  Paid: '#1a6b3c',
  Unpaid: '#e65100',
};

/* ── Stat Card ── */
function StatCard({ title, value, badge, badgeUp, sub, onClick, loading }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl border border-slate-200 cursor-pointer hover:shadow-lg hover:border-slate-300 transition-all duration-200"
      style={{ padding: '20px 24px' }}
    >
      {/* Title row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <span style={{
          fontSize: '11px',
          fontWeight: 700,
          color: '#64748b',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}>
          {title}
        </span>
        <MoreHorizontal size={15} color="#cbd5e1" />
      </div>

      {/* Value + badge row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
        {loading ? (
          <div style={{
            width: '60px', height: '32px',
            background: '#f1f5f9', borderRadius: '8px',
          }} />
        ) : (
          <span style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>
            {value}
          </span>
        )}
        {badge && !loading && (
          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            padding: '4px 10px',
            borderRadius: '999px',
            whiteSpace: 'nowrap',
            lineHeight: 1,
            background: badgeUp ? '#dcfce7' : '#fee2e2',
            color: badgeUp ? '#166534' : '#991b1b',
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
          }}>
            {badgeUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {badge}
          </span>
        )}
      </div>

      {/* Sub label */}
      <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500 }}>{sub}</span>
    </div>
  );
}

/* ── Status Update Modal ── */
function StatusUpdateModal({ order, onClose, onUpdate }) {
  const [selectedStatus, setSelectedStatus] = useState(order?.status || 'Pending');
  const statuses = ['Pending', 'Shipped', 'Delivered', 'Cancelled'];
  if (!order) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-2xl border border-slate-100 max-h-[95vh] overflow-y-auto">
        <h3 className="text-lg font-bold text-slate-900 mb-1">Order Details</h3>
        <p className="text-xs text-slate-500 mb-5">
          Order ID:{' '}
          <span className="text-emerald-600 font-bold">#{order.orderId || order.id}</span>
        </p>

        {/* Order Metadata */}
        <div className="grid grid-cols-2 gap-3 mb-5 bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">User ID</p>
            <p className="text-sm text-slate-700 font-semibold">{order.userId || order.user || 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Order Date</p>
            <p className="text-sm text-slate-700 font-semibold">{order.date || new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Payment Status</p>
            <p className="text-sm font-semibold" style={{ color: order.payment === 'Paid' ? '#10b981' : '#f97316' }}>{order.payment || 'Unpaid'}</p>
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Payment Method</p>
            <p className="text-sm text-slate-700 font-semibold">{order.paymentMethod || 'COD'}</p>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="mb-5 bg-slate-50 p-4 rounded-xl border border-slate-100">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Shipping Address</h4>
          <p className="text-sm text-slate-700"><strong>Name:</strong> {order.shippingAddress?.fullName || 'N/A'}</p>
          <p className="text-sm text-slate-700"><strong>Address:</strong> {order.shippingAddress?.address || 'N/A'}</p>
          <p className="text-sm text-slate-700"><strong>City:</strong> {order.shippingAddress?.city || 'N/A'}</p>
          <p className="text-sm text-slate-700"><strong>Postal Code:</strong> {order.shippingAddress?.postalCode || 'N/A'}</p>
          <p className="text-sm text-slate-700"><strong>Country:</strong> {order.shippingAddress?.country || 'N/A'}</p>
        </div>

        {/* Product Details */}
        <div className="mb-5 bg-slate-50 p-4 rounded-xl border border-slate-100 overflow-y-auto max-h-48">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Purchased Items ({order.orderItems?.length || 0})</h4>
          {order.orderItems?.map((item, index) => (
            <div key={index} className="flex items-center gap-3 mb-3 border-b border-slate-200 pb-2 last:border-0 last:pb-0">
              <img
                src={item.image && item.image.startsWith('http') ? item.image : `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name || 'Item')}&background=random&size=80&bold=true`}
                alt={item.name}
                className="w-12 h-12 object-cover rounded-md border border-slate-200"
                onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name || 'Item')}&background=random&size=80&bold=true`; }}
              />
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-800">{item.name}</p>
                <p className="text-xs text-slate-500">Qty: {item.qty} × {formatINR(item.price)} = {formatINR(item.qty * item.price)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Order Totals */}
        <div className="mb-5 bg-blue-50 p-4 rounded-xl border border-blue-200">
          <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-3">Price Breakdown</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Items Total:</span><strong>{formatINR(order.itemsPrice || 0)}</strong></div>
            <div className="flex justify-between"><span>Shipping:</span><strong>{formatINR(order.shippingPrice || 0)}</strong></div>
            <div className="flex justify-between"><span>Tax (GST):</span><strong>{formatINR(order.taxPrice || 0)}</strong></div>
            <div className="border-t border-blue-200 pt-2 flex justify-between font-bold text-base">
              <span>Total Amount:</span>
              <span className="text-blue-600">{formatINR(order.totalPrice || order.price || 0)}</span>
            </div>
          </div>
        </div>

        {/* Status Update */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              New Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
            >
              {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onUpdate(order.orderId || order.id, selectedStatus)}
              className="flex-1 px-4 py-2.5 text-xs font-bold bg-[#1a6b3c] text-white rounded-xl hover:bg-[#145a32] shadow-lg shadow-emerald-700/20 transition-all active:scale-95"
            >
              Update Status
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN ORDER MANAGEMENT PAGE
══════════════════════════════════════════════ */
export default function OrderManagement() {
  const [activeTab, setActiveTab] = useState('All order');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showMoreActions, setShowMoreActions] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const tabs = ['All order', 'Completed', 'Pending', 'Canceled'];
  const itemsPerPage = 6;

  const statusFilter =
    activeTab === 'Completed' ? 'Delivered' :
      activeTab === 'Pending' ? 'Pending' :
        activeTab === 'Canceled' ? 'Cancelled' : null;

  const { data: ordersResponse, isLoading: ordersLoading, error: ordersError } =
    useGetOrdersQuery(statusFilter);
  const { data: statsData, isLoading: statsLoading } = useGetOrderStatsQuery();
  const [updateStatus] = useUpdateOrderStatusMutation();
  const [createOrder] = useCreateOrderMutation();

  const handleManualOrder = async () => {
    try {
      await createOrder({
        orderItems: [{
          name: 'Manual Order Product', qty: 1,
          image: 'https://cdn-icons-png.flaticon.com/512/3081/3081559.png',
          price: 99.99, product: '65f1234567890abcdef00001',
        }],
        itemsPrice: 99.99, totalPrice: 99.99, isPaid: true, status: 'Pending',
      }).unwrap();
      toast.success('Manual order created for testing');
    } catch {
      toast.error('Failed to create order');
    }
  };

  function getProductEmoji(productName) {
    const map = { headphone: '🎧', shirt: '👕', wallet: '👛', pillow: '🛏', dumbbell: '🏋', coffee: '☕', cap: '🧢', webcam: '📷', bulb: '💡' };
    const lower = productName?.toLowerCase() || '';
    for (const [key, emoji] of Object.entries(map)) if (lower.includes(key)) return emoji;
    return '📦';
  }

  function getImageUrl(path) {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return path; // Vite proxy handles /uploads paths
  }

  const orders = useMemo(() =>
    ordersResponse?.data?.map((order) => {
      const firstItem = order.orderItems?.[0] || {};
      return {
        id: order.orderId || order._id,
        orderId: order.orderId,
        product: firstItem.name || 'Product Asset',
        variant: firstItem.variant || '',
        image: firstItem.image,
        emoji: getProductEmoji(firstItem.name),
        date: new Date(order.createdAt).toLocaleDateString('en-GB'),
        price: order.totalPrice || order.price || 0,
        payment: order.isPaid ? 'Paid' : 'Unpaid',
        status: order.status || (order.isDelivered ? 'Delivered' : 'Pending'),
        shippingAddress: order.shippingAddress || {},
        orderItems: order.orderItems || [],
      };
    }) || [],
    [ordersResponse]);

  const filteredOrders = useMemo(() =>
    orders.filter((o) =>
      (o.product?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (o.id?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    ),
    [orders, searchQuery]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = useMemo(() =>
    filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [filteredOrders, currentPage]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await updateStatus({ orderId, status: newStatus }).unwrap();
      setSelectedOrder(null);
      toast.success('Order status updated successfully');
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleExport = () => {
    toast.loading('Exporting orders...');
    setTimeout(() => { toast.dismiss(); toast.success('Orders exported!'); }, 1000);
  };

  if (ordersError) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <p className="text-rose-600 font-bold mb-4">Failed to load orders</p>
        <p className="text-xs text-slate-500 mb-6">{ordersError.message || 'Connecting to server failed.'}</p>
        <button onClick={() => window.location.reload()}
          className="px-6 py-2 bg-[#1a6b3c] text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors">
          Try Again
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex-1 min-w-0" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
            Order Management
          </h1>
          <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px', fontWeight: 500, marginBottom: 0 }}>
            Control and track all customer transactions
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Search by ID or Product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                paddingLeft: '34px', paddingRight: '16px', paddingTop: '9px', paddingBottom: '9px',
                background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px',
                fontSize: '12px', width: '230px', outline: 'none', color: '#1e293b',
              }}
            />
          </div>
          <div style={{ position: 'relative', padding: '9px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', cursor: 'pointer', lineHeight: 0 }}>
            <Bell size={17} color="#64748b" />
            <span style={{ position: 'absolute', top: '8px', right: '8px', width: '6px', height: '6px', background: '#ef4444', borderRadius: '50%' }} />
          </div>
          <div style={{ padding: '9px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', cursor: 'pointer', lineHeight: 0 }}>
            <Zap size={17} color="#64748b" />
          </div>
        </div>
      </div>

      {/* ── Stat Cards — responsive grid that never squishes ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px',
      }}>
        <StatCard title="Total Orders" value={statsData?.total ?? 0} badge="14.4%" badgeUp sub="Last 30 days" onClick={() => setActiveTab('All order')} loading={statsLoading} />
        <StatCard title="New Orders" value={statsData?.pending ?? 0} badge="20%" badgeUp sub="Needs processing" onClick={() => setActiveTab('Pending')} loading={statsLoading} />
        <StatCard title="Completed" value={statsData?.delivered ?? 0} badge="83%" badgeUp sub="Successfully delivered" onClick={() => setActiveTab('Completed')} loading={statsLoading} />
        <StatCard title="Cancelled" value={statsData?.cancelled ?? 0} badge="3.2%" badgeUp={false} sub="Lost opportunities" onClick={() => setActiveTab('Canceled')} loading={statsLoading} />
      </div>

      {/* ── Order Table Card ── */}
      <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #f1f5f9', boxShadow: '0 4px 24px rgba(0,0,0,0.04)', overflow: 'hidden' }}>

        {/* Top bar */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <span style={{ fontSize: '12px', fontWeight: 900, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Order Repository
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleManualOrder}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: '#1a6b3c', color: 'white',
                border: 'none', borderRadius: '12px',
                padding: '8px 16px', fontSize: '11px', fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Plus size={13} strokeWidth={3} /> Add Order
            </button>
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowMoreActions(!showMoreActions)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  background: 'white', color: '#475569',
                  border: '1px solid #e2e8f0', borderRadius: '12px',
                  padding: '8px 16px', fontSize: '11px', fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                More Actions
                <ChevronDown size={13} style={{ transform: showMoreActions ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>
              {showMoreActions && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 6px)', right: 0,
                  background: 'white', border: '1px solid #e2e8f0',
                  borderRadius: '14px', padding: '6px', minWidth: '160px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.1)', zIndex: 20,
                }}>
                  {['Export Data', 'Print Manifest', 'Bulk Approval', 'Settings'].map((action) => (
                    <div
                      key={action}
                      onClick={() => { if (action.includes('Export')) handleExport(); setShowMoreActions(false); }}
                      style={{ padding: '9px 14px', fontSize: '11px', fontWeight: 700, color: '#475569', cursor: 'pointer', borderRadius: '9px', transition: 'all 0.1s' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#f0fdf4'; e.currentTarget.style.color = '#1a6b3c'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#475569'; }}
                    >
                      {action}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs + filters */}
        <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid #f8fafc' }}>
          <div style={{ display: 'flex', gap: '4px', background: '#f8fafc', padding: '4px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            {tabs.map((tab) => {
              const active = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
                  style={{
                    padding: '7px 16px',
                    fontSize: '11px', fontWeight: 800,
                    borderRadius: '9px', border: 'none',
                    cursor: 'pointer', whiteSpace: 'nowrap',
                    transition: 'all 0.15s',
                    background: active ? 'white' : 'transparent',
                    color: active ? '#059669' : '#94a3b8',
                    boxShadow: active ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                  }}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {[{ icon: <SlidersHorizontal size={13} />, label: 'Filters' }, { icon: <ArrowLeftRight size={13} />, label: 'Relational' }].map(({ icon, label }) => (
              <button key={label} style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '7px 14px', background: 'white',
                border: '1px solid #e2e8f0', borderRadius: '10px',
                fontSize: '11px', fontWeight: 700, color: '#64748b', cursor: 'pointer',
              }}>
                {icon} {label}
              </button>
            ))}
          </div>
        </div>

        {/* Table area */}
        <div style={{ overflowX: 'auto', minHeight: '340px', padding: '0 24px 24px' }}>
          {ordersLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: '16px' }}>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <div style={{ width: '44px', height: '44px', border: '4px solid #d1fae5', borderTopColor: '#059669', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                Synchronizing Local Cluster...
              </span>
            </div>
          ) : (
            <>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {[
                      { label: '#', align: 'left' },
                      { label: 'Order ID', align: 'left' },
                      { label: 'Product', align: 'left' },
                      { label: 'Date', align: 'center' },
                      { label: 'Price', align: 'center' },
                      { label: 'Payment', align: 'center' },
                      { label: 'Status', align: 'center' },
                    ].map(({ label, align }) => (
                      <th key={label} style={{
                        padding: '14px 12px',
                        fontSize: '10px', fontWeight: 800,
                        color: '#4c9f70',
                        textTransform: 'uppercase', letterSpacing: '0.08em',
                        textAlign: align,
                        whiteSpace: 'nowrap',
                        background: '#fafafa',
                        borderBottom: '1px solid #f1f5f9',
                      }}>
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '60px 0', color: '#cbd5e1' }}>
                        <ArrowLeftRight size={40} style={{ margin: '0 auto 10px', display: 'block', opacity: 0.25 }} />
                        <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                          No orders found
                        </span>
                      </td>
                    </tr>
                  ) : (
                    paginatedOrders.map((o, i) => (
                      <tr
                        key={o.id}
                        onClick={() => setSelectedOrder(o)}
                        style={{ borderBottom: '1px solid #f8fafc', cursor: 'pointer', transition: 'background 0.12s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#fafafa'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <td style={{ padding: '14px 12px', fontSize: '11px', fontWeight: 700, color: '#94a3b8' }}>
                          {(currentPage - 1) * itemsPerPage + i + 1}
                        </td>
                        <td style={{ padding: '14px 12px', fontSize: '11px', fontWeight: 800, color: '#1a6b3c', whiteSpace: 'nowrap' }}>
                          #{o.id}
                        </td>
                        <td style={{ padding: '14px 12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '44px', height: '44px', flexShrink: 0,
                              background: '#f1f5f9', borderRadius: '10px',
                              overflow: 'hidden',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              border: '1px solid #e2e8f0',
                            }}>
                              {o.image ? (
                                <img
                                  src={getImageUrl(o.image)}
                                  alt={o.product}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.style.display = 'none';
                                    e.target.parentElement.innerHTML = `<span style="font-size:18px">${o.emoji}</span>`;
                                  }}
                                />
                              ) : (
                                <span style={{ fontSize: '20px', lineHeight: 1 }}>{o.emoji}</span>
                              )}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {o.product}
                              </span>
                              {o.variant && (
                                <span style={{ fontSize: '10px', fontWeight: 600, color: '#64748b' }}>
                                  Variant: {o.variant}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '14px 12px', fontSize: '11px', fontWeight: 600, color: '#64748b', textAlign: 'center', whiteSpace: 'nowrap' }}>
                          {o.date}
                        </td>
                        <td style={{ padding: '14px 12px', fontSize: '13px', fontWeight: 900, color: '#0f172a', textAlign: 'center', whiteSpace: 'nowrap' }}>
                          {formatINR(o.price)}
                        </td>
                        <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '5px',
                            padding: '4px 12px', borderRadius: '999px',
                            background: '#f8fafc', border: '1px solid #e2e8f0',
                            fontSize: '10px', fontWeight: 800, color: '#475569',
                            textTransform: 'uppercase', whiteSpace: 'nowrap',
                          }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0, background: paymentDot[o.payment] || '#94a3b8' }} />
                            {o.payment}
                          </span>
                        </td>
                        <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 14px', borderRadius: '999px',
                            fontSize: '10px', fontWeight: 800,
                            textTransform: 'uppercase', letterSpacing: '0.06em',
                            whiteSpace: 'nowrap',
                            ...(statusStyle[o.status] || {}),
                          }}>
                            {o.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              {filteredOrders.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '24px' }}>
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '4px',
                      padding: '8px 16px', background: 'white',
                      border: '1px solid #e2e8f0', borderRadius: '12px',
                      fontSize: '11px', fontWeight: 800, color: '#1a6b3c',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      opacity: currentPage === 1 ? 0.35 : 1,
                      textTransform: 'uppercase', letterSpacing: '0.05em',
                    }}
                  >
                    <ChevronLeft size={15} /> Prev
                  </button>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        style={{
                          width: '32px', height: '32px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          borderRadius: '10px', fontSize: '12px', fontWeight: 800,
                          border: currentPage === i + 1 ? 'none' : '1px solid #e2e8f0',
                          background: currentPage === i + 1 ? '#1a6b3c' : 'white',
                          color: currentPage === i + 1 ? 'white' : '#64748b',
                          cursor: 'pointer',
                        }}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '4px',
                      padding: '8px 16px', background: 'white',
                      border: '1px solid #e2e8f0', borderRadius: '12px',
                      fontSize: '11px', fontWeight: 800, color: '#1a6b3c',
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      opacity: currentPage === totalPages ? 0.35 : 1,
                      textTransform: 'uppercase', letterSpacing: '0.05em',
                    }}
                  >
                    Next <ChevronRight size={15} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal */}
      {selectedOrder && (
        <StatusUpdateModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdate={handleUpdateStatus}
        />
      )}
    </div>
  );
}

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
  Package,
  X,
  MapPin,
  CreditCard,
  ShoppingCart,
  Receipt,
} from 'lucide-react';
import {
  useGetOrdersQuery,
  useGetOrderStatsQuery,
  useUpdateOrderStatusMutation,
  useCreateOrderMutation,
} from '../../features/orders/orderApi';
import { formatINR } from '../../utils/currency';

const statusStyle = {
  Delivered: { bg: 'bg-green-100 text-green-800 border border-green-200' },
  Pending:   { bg: 'bg-blue-100 text-blue-800 border border-blue-200' },
  Shipped:   { bg: 'bg-yellow-100 text-yellow-800 border border-yellow-100' },
  Cancelled: { bg: 'bg-red-100 text-red-800 border border-red-200' },
};

const paymentDotColor = {
  Paid:   'bg-green-600',
  Unpaid: 'bg-orange-500',
};

/* ── Stat Card ── */
function StatCard({ title, value, badge, badgeUp, sub, onClick, loading }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl border border-slate-200 cursor-pointer hover:shadow-lg hover:border-slate-300 transition-all duration-200 px-4 py-4 min-w-0"
    >
      <div className="flex justify-between items-center mb-3">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.08em] truncate pr-1">{title}</span>
        <MoreHorizontal size={15} className="text-slate-300 shrink-0" />
      </div>
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        {loading ? (
          <div className="w-14 h-7 bg-slate-100 rounded-lg" />
        ) : (
          <span className="text-[24px] font-black text-slate-900 leading-none">{value}</span>
        )}
        {badge && !loading && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap leading-none flex items-center gap-0.5 ${badgeUp ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {badgeUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {badge}
          </span>
        )}
      </div>
      <span className="text-[11px] text-slate-400 font-medium">{sub}</span>
    </div>
  );
}

/* ── Info Row helper ── */
function InfoRow({ label, value, valueColor }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.1em]">{label}</span>
      <span className={`text-[13px] font-semibold ${valueColor || 'text-slate-800'}`}>{value || 'N/A'}</span>
    </div>
  );
}

/* ── Status Update Modal ── */
function StatusUpdateModal({ order, onClose, onUpdate, isUpdating }) {
  const [selectedStatus, setSelectedStatus] = useState(order?.status || 'Pending');
  const statuses = ['Pending', 'Shipped', 'Delivered', 'Cancelled'];
  if (!order) return null;

  const itemsTotal   = Number(order.itemsPrice)   || 0;
  const shippingCost = Number(order.shippingPrice) || 0;
  const taxAmount    = Number(order.taxPrice)      || 0;
  const grandTotal   = Number(order.totalPrice || order.price) || 0;

  const derivedItemsTotal = itemsTotal > 0
    ? itemsTotal
    : (order.orderItems || []).reduce((sum, item) => sum + (Number(item.price) * Number(item.qty || item.quantity || 1)), 0);

  const statusColors = {
    Delivered: 'bg-green-100 text-green-800',
    Pending:   'bg-blue-100 text-blue-800',
    Shipped:   'bg-yellow-100 text-yellow-800',
    Cancelled: 'bg-red-100 text-red-800',
  };
  const sc = statusColors[order.status] || 'bg-slate-100 text-slate-600';

  return (
    <div
      className="fixed inset-0 bg-slate-900/55 backdrop-blur-[6px] flex items-center justify-center z-50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-3xl w-full max-w-[560px] shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">

        {/* Modal Header */}
        <div className="px-6 pt-5 pb-4 border-b border-slate-100 flex items-start justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-8 h-8 bg-green-50 rounded-xl flex items-center justify-center">
                <Package size={16} className="text-green-600" />
              </div>
              <h3 className="text-base font-black text-slate-900 m-0">Order Details</h3>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-500 font-medium">Order ID:</span>
              <span className="text-xs font-extrabold text-emerald-600 bg-green-50 px-2.5 py-0.5 rounded-full border border-green-200">
                #{order.orderId || order.id}
              </span>
              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-[0.06em] ${sc}`}>
                {order.status}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center cursor-pointer shrink-0 ml-3"
          >
            <X size={15} className="text-slate-500" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">

          {/* Order Meta */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <InfoRow label="User ID" value={order.userId || order.user} />
            <InfoRow label="Order Date" value={order.date || (order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN') : 'N/A')} />
            <InfoRow label="Payment Status" value={order.payment || 'Unpaid'} valueColor={order.payment === 'Paid' ? 'text-green-600' : 'text-orange-500'} />
            <InfoRow label="Payment Method" value={order.paymentMethod || 'COD'} />
          </div>

          {/* Shipping Address */}
          <div className="bg-slate-50 rounded-2xl p-4 mb-4 border border-slate-100">
            <div className="flex items-center gap-1.5 mb-2.5">
              <MapPin size={13} className="text-emerald-600" />
              <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-[0.1em]">Shipping Address</span>
            </div>
            <div className="flex flex-col gap-1">
              {[
                ['Name', order.shippingAddress?.fullName],
                ['Address', order.shippingAddress?.address],
                ['City', order.shippingAddress?.city],
                ['Postal Code', order.shippingAddress?.postalCode],
                ['Country', order.shippingAddress?.country],
              ].map(([label, val]) => (
                <div key={label} className="flex gap-1.5 text-xs">
                  <span className="text-slate-400 font-semibold min-w-[80px]">{label}:</span>
                  <span className="text-slate-700 font-semibold">{val || 'N/A'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Purchased Items */}
          <div className="bg-slate-50 rounded-2xl p-4 mb-4 border border-slate-100">
            <div className="flex items-center gap-1.5 mb-3">
              <ShoppingCart size={13} className="text-emerald-600" />
              <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-[0.1em]">
                Purchased Items ({order.orderItems?.length || 0})
              </span>
            </div>
            <div className="flex flex-col gap-2.5 max-h-[180px] overflow-y-auto">
              {order.orderItems?.length > 0 ? order.orderItems.map((item, idx) => {
                const qty   = Number(item.qty || item.quantity || 1);
                const price = Number(item.price) || 0;
                return (
                  <div key={idx} className={`flex items-center gap-3 ${idx < order.orderItems.length - 1 ? 'pb-2.5 border-b border-slate-200' : ''}`}>
                    <div className="w-11 h-11 shrink-0 rounded-xl overflow-hidden bg-slate-200 border border-slate-200">
                      {item.image
                        ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-xl">📦</div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold text-slate-800 m-0 mb-0.5 overflow-hidden text-ellipsis whitespace-nowrap">{item.name}</p>
                      <p className="text-[11px] text-slate-500 m-0 font-medium">Qty: {qty} × {formatINR(price)}</p>
                    </div>
                    <span className="text-[13px] font-extrabold text-slate-900 shrink-0">{formatINR(qty * price)}</span>
                  </div>
                );
              }) : (
                <p className="text-xs text-slate-400 text-center py-3">No items found</p>
              )}
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="bg-blue-50 rounded-2xl p-4 mb-5 border border-blue-100">
            <div className="flex items-center gap-1.5 mb-3">
              <Receipt size={13} className="text-blue-600" />
              <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-[0.1em]">Price Breakdown</span>
            </div>
            <div className="flex flex-col gap-2">
              {[
                { label: 'Items Total', value: derivedItemsTotal },
                { label: 'Shipping Charge', value: shippingCost },
                { label: 'Tax (GST)', value: taxAmount },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center">
                  <span className="text-xs text-slate-500 font-medium">{label}</span>
                  <span className={`text-[13px] font-bold ${value > 0 ? 'text-slate-800' : 'text-slate-400'}`}>
                    {value > 0 ? formatINR(value) : <span className="text-[11px]">—</span>}
                  </span>
                </div>
              ))}
              <div className="border-t border-blue-200 mt-1 pt-2.5 flex justify-between items-center">
                <span className="text-[13px] font-extrabold text-slate-800">Total Amount</span>
                <span className="text-base font-black text-blue-600">{formatINR(grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Status Update */}
          <div>
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.1em] block mb-2">
              Update Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              disabled={isUpdating}
              className="w-full px-3.5 py-2.5 bg-white border-[1.5px] border-slate-200 rounded-xl text-[13px] font-semibold text-slate-800 outline-none cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 flex gap-3 shrink-0">
          <button
            onClick={onClose}
            disabled={isUpdating}
            className="flex-1 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 cursor-pointer hover:bg-slate-100 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => onUpdate(order, selectedStatus)}
            disabled={isUpdating || selectedStatus === order.status}
            className={`flex-[2] py-2.5 rounded-xl text-xs font-extrabold text-white border-none flex items-center justify-center gap-2 transition-all
              ${isUpdating ? 'bg-green-400 cursor-not-allowed' : selectedStatus === order.status ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#1a6b3c] cursor-pointer hover:bg-[#145a32] shadow-lg shadow-green-900/30'}`}
          >
            {isUpdating ? (
              <>
                <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin shrink-0" />
                Updating...
              </>
            ) : 'Update Status'}
          </button>
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
  const [statusOverrides, setStatusOverrides] = useState({});

  const tabs = ['All order', 'Completed', 'Pending', 'Canceled'];
  const itemsPerPage = 6;

  const statusFilter =
    activeTab === 'Completed' ? 'Delivered' :
      activeTab === 'Pending' ? 'Pending' :
        activeTab === 'Canceled' ? 'Cancelled' : null;

  const { data: ordersResponse, isLoading: ordersLoading, error: ordersError, refetch } = useGetOrdersQuery(statusFilter);
  const { data: statsData, isLoading: statsLoading } = useGetOrderStatsQuery();
  const [updateStatus, { isLoading: isUpdating }] = useUpdateOrderStatusMutation();
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
    const map = { headphone: '🎧', shirt: '👕', wallet: '👛', pillow: '🛏', dumbbell: '🏋', coffee: '☕', cap: '🧢', webcam: '📷', bulb: '💡', saree: '🥻', dress: '👗' };
    const lower = productName?.toLowerCase() || '';
    for (const [key, emoji] of Object.entries(map)) if (lower.includes(key)) return emoji;
    return '📦';
  }

  const orders = useMemo(() =>
    ordersResponse?.data?.map((order) => {
      const firstItem = order.orderItems?.[0] || {};
      const rawId = order._id;
      const displayId = order.orderId || order._id;
      const resolvedStatus = statusOverrides[rawId] || order.status || (order.isDelivered ? 'Delivered' : 'Pending');
      return {
        _id: rawId,
        id: displayId,
        orderId: order.orderId,
        product: firstItem.name || 'Product Asset',
        variant: firstItem.variant || '',
        image: firstItem.image,
        emoji: getProductEmoji(firstItem.name),
        date: new Date(order.createdAt).toLocaleDateString('en-GB'),
        price: order.totalPrice || order.price || 0,
        itemsPrice: order.itemsPrice || 0,
        shippingPrice: order.shippingPrice || 0,
        taxPrice: order.taxPrice || 0,
        totalPrice: order.totalPrice || order.price || 0,
        payment: order.isPaid ? 'Paid' : 'Unpaid',
        paymentMethod: order.paymentMethod || 'COD',
        status: resolvedStatus,
        userId: order.user || order.userId,
        createdAt: order.createdAt,
        shippingAddress: order.shippingAddress || {},
        orderItems: order.orderItems || [],
      };
    }) || [],
    [ordersResponse, statusOverrides]);

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

  const handleUpdateStatus = async (order, newStatus) => {
    const apiId = order._id || order.orderId || order.id;
    const overrideKey = order._id || order.orderId || order.id;

    try {
      await updateStatus({ id: apiId, orderId: apiId, status: newStatus }).unwrap();
      setStatusOverrides((prev) => ({ ...prev, [overrideKey]: newStatus }));
      setSelectedOrder((prev) => prev ? { ...prev, status: newStatus } : prev);
      toast.success(`Order status updated to "${newStatus}"`);
      refetch().then(() => {
        setStatusOverrides((prev) => {
          const next = { ...prev };
          delete next[overrideKey];
          return next;
        });
      });
      setTimeout(() => setSelectedOrder(null), 600);
    } catch (err) {
      setStatusOverrides((prev) => {
        const next = { ...prev };
        delete next[overrideKey];
        return next;
      });
      const message = err?.data?.message || err?.message || 'Failed to update status';
      toast.error(message);
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
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div className="w-full min-w-0 flex flex-col gap-5 p-4 md:p-5">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight m-0">Order Management</h1>
            <p className="text-xs text-slate-400 mt-1 font-medium mb-0">Control and track all customer transactions</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by ID or Product..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="pl-8 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs w-48 md:w-56 outline-none text-slate-800"
              />
            </div>
            <div className="relative p-2 bg-white border border-slate-200 rounded-xl cursor-pointer leading-none shrink-0">
              <Bell size={16} className="text-slate-500" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
            </div>
            <div className="p-2 bg-white border border-slate-200 rounded-xl cursor-pointer leading-none shrink-0">
              <Zap size={16} className="text-slate-500" />
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard title="Total Orders"  value={statsData?.total     ?? 0} badge="14.4%" badgeUp    sub="Last 30 days"           onClick={() => setActiveTab('All order')} loading={statsLoading} />
          <StatCard title="New Orders"    value={statsData?.pending   ?? 0} badge="20%"   badgeUp    sub="Needs processing"       onClick={() => setActiveTab('Pending')}   loading={statsLoading} />
          <StatCard title="Completed"     value={statsData?.delivered ?? 0} badge="83%"   badgeUp    sub="Successfully delivered" onClick={() => setActiveTab('Completed')} loading={statsLoading} />
          <StatCard title="Cancelled"     value={statsData?.cancelled ?? 0} badge="3.2%"  badgeUp={false} sub="Lost opportunities" onClick={() => setActiveTab('Canceled')}  loading={statsLoading} />
        </div>

        {/* Order Table Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

          {/* Top bar */}
          <div className="px-4 md:px-6 py-4 border-b border-slate-50 flex justify-between items-center flex-wrap gap-3">
            <span className="text-xs font-black text-slate-800 uppercase tracking-[0.1em]">Order Repository</span>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleManualOrder}
                className="flex items-center gap-1.5 bg-[#1a6b3c] text-white border-none rounded-xl px-3 py-2 text-[11px] font-bold cursor-pointer whitespace-nowrap"
              >
                <Plus size={13} strokeWidth={3} /> Add Order
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowMoreActions(!showMoreActions)}
                  className="flex items-center gap-1.5 bg-white text-slate-500 border border-slate-200 rounded-xl px-3 py-2 text-[11px] font-bold cursor-pointer whitespace-nowrap"
                >
                  More Actions
                  <ChevronDown size={13} className={`transition-transform duration-200 ${showMoreActions ? 'rotate-180' : ''}`} />
                </button>
                {showMoreActions && (
                  <div className="absolute top-[calc(100%+6px)] right-0 bg-white border border-slate-200 rounded-2xl p-1.5 min-w-[160px] shadow-xl z-20">
                    {['Export Data', 'Print Manifest', 'Bulk Approval', 'Settings'].map((action) => (
                      <div
                        key={action}
                        onClick={() => { if (action.includes('Export')) handleExport(); setShowMoreActions(false); }}
                        className="px-3.5 py-2 text-[11px] font-bold text-slate-500 cursor-pointer rounded-xl hover:bg-green-50 hover:text-[#1a6b3c] transition-all"
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
          <div className="px-4 md:px-6 py-3 flex justify-between items-center flex-wrap gap-3 border-b border-slate-50">
            <div className="flex gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200 flex-wrap">
              {tabs.map((tab) => {
                const active = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
                    className={`px-3 py-1.5 text-[11px] font-extrabold rounded-xl border-none cursor-pointer whitespace-nowrap transition-all
                      ${active ? 'bg-white text-emerald-600 shadow-sm' : 'bg-transparent text-slate-400'}`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2">
              {[{ icon: <SlidersHorizontal size={13} />, label: 'Filters' }, { icon: <ArrowLeftRight size={13} />, label: 'Relational' }].map(({ icon, label }) => (
                <button key={label} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-[11px] font-bold text-slate-500 cursor-pointer whitespace-nowrap">
                  {icon} {label}
                </button>
              ))}
            </div>
          </div>

          {/* Table area */}
          <div className="overflow-x-auto min-h-[300px] px-4 md:px-6 pb-6">
            {ordersLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-11 h-11 border-4 border-green-100 border-t-emerald-600 rounded-full" style={{ animation: 'spin 0.8s linear infinite' }} />
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">
                  Synchronizing Local Cluster...
                </span>
              </div>
            ) : (
              <>
                <table className="w-full border-collapse" style={{ minWidth: '500px' }}>
                  <thead>
                    <tr>
                      {[
                        { label: '#',        align: 'text-left',   cls: 'hidden sm:table-cell' },
                        { label: 'Order ID', align: 'text-left',   cls: '' },
                        { label: 'Product',  align: 'text-left',   cls: '' },
                        { label: 'Date',     align: 'text-center', cls: 'hidden md:table-cell' },
                        { label: 'Price',    align: 'text-center', cls: 'hidden sm:table-cell' },
                        { label: 'Payment',  align: 'text-center', cls: 'hidden md:table-cell' },
                        { label: 'Status',   align: 'text-center', cls: '' },
                      ].map(({ label, align, cls }) => (
                        <th key={label} className={`px-3 py-3.5 text-[10px] font-extrabold text-[#4c9f70] uppercase tracking-[0.08em] ${align} whitespace-nowrap bg-gray-50 border-b border-slate-100 ${cls}`}>
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-16 text-slate-300">
                          <ArrowLeftRight size={40} className="mx-auto mb-2.5 block opacity-25" />
                          <span className="text-[11px] font-bold uppercase tracking-[0.1em]">No orders found</span>
                        </td>
                      </tr>
                    ) : (
                      paginatedOrders.map((o, i) => (
                        <tr
                          key={o._id || o.id}
                          onClick={() => setSelectedOrder(o)}
                          className="border-b border-slate-50 cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                          <td className="hidden sm:table-cell px-3 py-3 text-[11px] font-bold text-slate-400">
                            {(currentPage - 1) * itemsPerPage + i + 1}
                          </td>
                          <td className="px-3 py-3 text-[11px] font-extrabold text-[#1a6b3c] whitespace-nowrap">
                            #{o.id}
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-9 h-9 shrink-0 bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center border border-slate-200">
                                {o.image ? (
                                  <img src={o.image} alt={o.product} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-base">{o.emoji}</span>
                                )}
                              </div>
                              <div className="min-w-0">
                                <span className="text-[12px] font-bold text-slate-800 max-w-[120px] overflow-hidden text-ellipsis whitespace-nowrap block">
                                  {o.product}
                                </span>
                                {o.variant && (
                                  <span className="text-[10px] font-semibold text-slate-500">Variant: {o.variant}</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="hidden md:table-cell px-3 py-3 text-[11px] font-semibold text-slate-500 text-center whitespace-nowrap">
                            {o.date}
                          </td>
                          <td className="hidden sm:table-cell px-3 py-3 text-[13px] font-black text-slate-900 text-center whitespace-nowrap">
                            {formatINR(o.price)}
                          </td>
                          <td className="hidden md:table-cell px-3 py-3 text-center">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-[10px] font-extrabold text-slate-500 uppercase whitespace-nowrap">
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${paymentDotColor[o.payment] || 'bg-slate-400'}`} />
                              {o.payment}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-center">
                            <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-[0.06em] whitespace-nowrap ${statusStyle[o.status]?.bg || 'bg-slate-100 text-slate-600'}`}>
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
                  <div className="flex items-center justify-between pt-5 flex-wrap gap-3">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="flex items-center gap-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-[11px] font-extrabold text-[#1a6b3c] uppercase tracking-[0.05em] disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ChevronLeft size={14} /> Prev
                    </button>

                    <div className="flex gap-1 flex-wrap">
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`w-8 h-8 flex items-center justify-center rounded-xl text-xs font-extrabold cursor-pointer
                            ${currentPage === i + 1 ? 'bg-[#1a6b3c] text-white border-none' : 'bg-white border border-slate-200 text-slate-500'}`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>

                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className="flex items-center gap-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-[11px] font-extrabold text-[#1a6b3c] uppercase tracking-[0.05em] disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Next <ChevronRight size={14} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedOrder && (
        <StatusUpdateModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdate={handleUpdateStatus}
          isUpdating={isUpdating}
        />
      )}
    </>
  );
}
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

/* ── Status badge styles ── */
const statusStyle = {
  Delivered: { background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' },
  Pending:   { background: '#dbeafe', color: '#1e40af', border: '1px solid #bfdbfe' },
  Shipped:   { background: '#fef9c3', color: '#854d0e', border: '1px solid #fef08a' },
  Cancelled: { background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' },
};

const paymentDot = {
  Paid:   '#16a34a',
  Unpaid: '#ea580c',
};

/* ── Stat Card ── */
function StatCard({ title, value, badge, badgeUp, sub, onClick, loading }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl border border-slate-200 cursor-pointer hover:shadow-lg hover:border-slate-300 transition-all duration-200"
      style={{ padding: '20px 24px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {title}
        </span>
        <MoreHorizontal size={15} color="#cbd5e1" />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
        {loading ? (
          <div style={{ width: '60px', height: '32px', background: '#f1f5f9', borderRadius: '8px' }} />
        ) : (
          <span style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>{value}</span>
        )}
        {badge && !loading && (
          <span style={{
            fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '999px',
            whiteSpace: 'nowrap', lineHeight: 1,
            background: badgeUp ? '#dcfce7' : '#fee2e2',
            color: badgeUp ? '#166534' : '#991b1b',
            display: 'flex', alignItems: 'center', gap: '3px',
          }}>
            {badgeUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {badge}
          </span>
        )}
      </div>
      <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500 }}>{sub}</span>
    </div>
  );
}

/* ── Info Row helper ── */
function InfoRow({ label, value, valueColor }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
      <span style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        {label}
      </span>
      <span style={{ fontSize: '13px', fontWeight: 600, color: valueColor || '#1e293b' }}>
        {value || 'N/A'}
      </span>
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
    Delivered: { bg: '#dcfce7', color: '#166534' },
    Pending:   { bg: '#dbeafe', color: '#1e40af' },
    Shipped:   { bg: '#fef9c3', color: '#854d0e' },
    Cancelled: { bg: '#fee2e2', color: '#991b1b' },
  };
  const sc = statusColors[order.status] || { bg: '#f1f5f9', color: '#475569' };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)',
        backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', zIndex: 50, padding: '16px',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: 'white', borderRadius: '24px',
        width: '100%', maxWidth: '560px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.18)',
        maxHeight: '92vh', display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>

        {/* ── Modal Header ── */}
        <div style={{
          padding: '20px 24px 16px',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <div style={{ width: '32px', height: '32px', background: '#f0fdf4', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Package size={16} color="#16a34a" />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#0f172a', margin: 0 }}>Order Details</h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Order ID:</span>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#059669', background: '#f0fdf4', padding: '2px 10px', borderRadius: '999px', border: '1px solid #bbf7d0' }}>
                #{order.orderId || order.id}
              </span>
              <span style={{
                fontSize: '10px', fontWeight: 800, padding: '2px 10px', borderRadius: '999px',
                background: sc.bg, color: sc.color, textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>
                {order.status}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ width: '32px', height: '32px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
          >
            <X size={15} color="#64748b" />
          </button>
        </div>

        {/* ── Scrollable Body ── */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '20px 24px' }}>

          {/* Order Meta */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <InfoRow label="User ID" value={order.userId || order.user} />
            <InfoRow label="Order Date" value={order.date || (order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN') : 'N/A')} />
            <InfoRow
              label="Payment Status"
              value={order.payment || 'Unpaid'}
              valueColor={order.payment === 'Paid' ? '#16a34a' : '#ea580c'}
            />
            <InfoRow label="Payment Method" value={order.paymentMethod || 'COD'} />
          </div>

          {/* Shipping Address */}
          <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '14px 16px', marginBottom: '16px', border: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
              <MapPin size={13} color="#059669" />
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Shipping Address
              </span>
            </div>
            <div style={{ display: 'grid', gap: '4px' }}>
              {[
                ['Name', order.shippingAddress?.fullName],
                ['Address', order.shippingAddress?.address],
                ['City', order.shippingAddress?.city],
                ['Postal Code', order.shippingAddress?.postalCode],
                ['Country', order.shippingAddress?.country],
              ].map(([label, val]) => (
                <div key={label} style={{ display: 'flex', gap: '6px', fontSize: '12px' }}>
                  <span style={{ color: '#94a3b8', fontWeight: 600, minWidth: '80px' }}>{label}:</span>
                  <span style={{ color: '#334155', fontWeight: 600 }}>{val || 'N/A'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Purchased Items */}
          <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '14px 16px', marginBottom: '16px', border: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
              <ShoppingCart size={13} color="#059669" />
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Purchased Items ({order.orderItems?.length || 0})
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '180px', overflowY: 'auto' }}>
              {order.orderItems?.length > 0 ? order.orderItems.map((item, idx) => {
                const qty   = Number(item.qty || item.quantity || 1);
                const price = Number(item.price) || 0;
                return (
                  <div key={idx} style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    paddingBottom: idx < order.orderItems.length - 1 ? '10px' : 0,
                    borderBottom: idx < order.orderItems.length - 1 ? '1px solid #e2e8f0' : 'none',
                  }}>
                    <div style={{ width: '44px', height: '44px', flexShrink: 0, borderRadius: '10px', overflow: 'hidden', background: '#e2e8f0', border: '1px solid #e2e8f0' }}>
                      {item.image
                        ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>📦</div>
                      }
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.name}
                      </p>
                      <p style={{ fontSize: '11px', color: '#64748b', margin: 0, fontWeight: 500 }}>
                        Qty: {qty} × {formatINR(price)}
                      </p>
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', flexShrink: 0 }}>
                      {formatINR(qty * price)}
                    </span>
                  </div>
                );
              }) : (
                <p style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center', padding: '12px 0' }}>No items found</p>
              )}
            </div>
          </div>

          {/* Price Breakdown */}
          <div style={{ background: '#eff6ff', borderRadius: '14px', padding: '14px 16px', marginBottom: '20px', border: '1px solid #dbeafe' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
              <Receipt size={13} color="#2563eb" />
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Price Breakdown
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { label: 'Items Total', value: derivedItemsTotal },
                { label: 'Shipping Charge', value: shippingCost },
                { label: 'Tax (GST)', value: taxAmount },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#475569', fontWeight: 500 }}>{label}</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: value > 0 ? '#1e293b' : '#94a3b8' }}>
                    {value > 0 ? formatINR(value) : <span style={{ fontSize: '11px' }}>—</span>}
                  </span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid #bfdbfe', marginTop: '4px', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#1e293b' }}>Total Amount</span>
                <span style={{ fontSize: '16px', fontWeight: 900, color: '#2563eb' }}>{formatINR(grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Status Update */}
          <div>
            <label style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '8px' }}>
              Update Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              disabled={isUpdating}
              style={{
                width: '100%', padding: '11px 14px',
                background: isUpdating ? '#f8fafc' : 'white',
                border: '1.5px solid #e2e8f0',
                borderRadius: '12px', fontSize: '13px', fontWeight: 600, color: '#1e293b',
                outline: 'none', cursor: isUpdating ? 'not-allowed' : 'pointer',
                appearance: 'auto', opacity: isUpdating ? 0.7 : 1,
                transition: 'opacity 0.15s',
              }}
            >
              {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* ── Footer Actions ── */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #f1f5f9',
          display: 'flex', gap: '12px',
          flexShrink: 0,
        }}>
          <button
            onClick={onClose}
            disabled={isUpdating}
            style={{
              flex: 1, padding: '11px', background: '#f8fafc',
              border: '1px solid #e2e8f0', borderRadius: '12px',
              fontSize: '12px', fontWeight: 700, color: '#475569',
              cursor: isUpdating ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s', opacity: isUpdating ? 0.6 : 1,
            }}
            onMouseEnter={(e) => { if (!isUpdating) e.currentTarget.style.background = '#f1f5f9'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#f8fafc'; }}
          >
            Cancel
          </button>
          <button
            onClick={() => onUpdate(order, selectedStatus)}
            disabled={isUpdating || selectedStatus === order.status}
            style={{
              flex: 2, padding: '11px',
              background: isUpdating ? '#4ade80' : selectedStatus === order.status ? '#94a3b8' : '#1a6b3c',
              border: 'none', borderRadius: '12px',
              fontSize: '12px', fontWeight: 800, color: 'white',
              cursor: (isUpdating || selectedStatus === order.status) ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s',
              boxShadow: isUpdating || selectedStatus === order.status ? 'none' : '0 4px 12px rgba(26,107,60,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}
            onMouseEnter={(e) => { if (!isUpdating && selectedStatus !== order.status) e.currentTarget.style.background = '#145a32'; }}
            onMouseLeave={(e) => { if (!isUpdating && selectedStatus !== order.status) e.currentTarget.style.background = '#1a6b3c'; }}
          >
            {isUpdating ? (
              <>
                <span style={{
                  width: '13px', height: '13px',
                  border: '2px solid rgba(255,255,255,0.4)',
                  borderTopColor: 'white', borderRadius: '50%',
                  animation: 'spin 0.7s linear infinite',
                  flexShrink: 0,
                }} />
                Updating...
              </>
            ) : (
              'Update Status'
            )}
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

  // Track optimistic status overrides locally — key = raw _id, value = new status
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
      // Use raw _id as the stable key for overrides, orderId for display
      const rawId    = order._id;
      const displayId = order.orderId || order._id;
      const resolvedStatus = statusOverrides[rawId] || order.status || (order.isDelivered ? 'Delivered' : 'Pending');
      return {
        // Keep both so we always have the raw _id for the API call
        _id:           rawId,
        id:            displayId,
        orderId:       order.orderId,
        product:       firstItem.name || 'Product Asset',
        variant:       firstItem.variant || '',
        image:         firstItem.image,
        emoji:         getProductEmoji(firstItem.name),
        date:          new Date(order.createdAt).toLocaleDateString('en-GB'),
        price:         order.totalPrice || order.price || 0,
        itemsPrice:    order.itemsPrice    || 0,
        shippingPrice: order.shippingPrice || 0,
        taxPrice:      order.taxPrice      || 0,
        totalPrice:    order.totalPrice    || order.price || 0,
        payment:        order.isPaid ? 'Paid' : 'Unpaid',
        paymentMethod:  order.paymentMethod || 'COD',
        status:         resolvedStatus,
        userId:         order.user || order.userId,
        createdAt:      order.createdAt,
        shippingAddress: order.shippingAddress || {},
        orderItems:     order.orderItems || [],
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

  /**
   * FIX: Accept the full order object so we always have access to the raw _id.
   * The mutation payload uses _id (MongoDB ObjectId) which is what the backend route
   * expects — e.g. PUT /api/orders/:id/status.  orderId is a human-readable display
   * field and may not match the route param.
   */
  const handleUpdateStatus = async (order, newStatus) => {
    // Resolve the correct ID to send to the API.
    // Prefer the raw MongoDB _id; fall back to orderId / id.
    const apiId  = order._id || order.orderId || order.id;
    // The override key must be consistent with what we store in the orders memo.
    const overrideKey = order._id || order.orderId || order.id;

    try {
      // ── Call the RTK-Query mutation ──────────────────────────────────────────
      // Pass both id fields so the mutation can pick whichever matches the slice.
      await updateStatus({ id: apiId, orderId: apiId, status: newStatus }).unwrap();

      // ── Optimistic local update ──────────────────────────────────────────────
      setStatusOverrides((prev) => ({ ...prev, [overrideKey]: newStatus }));

      // ── Reflect in the open modal immediately ────────────────────────────────
      setSelectedOrder((prev) => prev ? { ...prev, status: newStatus } : prev);

      toast.success(`Order status updated to "${newStatus}"`);

      // ── Re-sync from server in background, then clear the override ───────────
      refetch().then(() => {
        setStatusOverrides((prev) => {
          const next = { ...prev };
          delete next[overrideKey];
          return next;
        });
      });

      // Close modal after user can see the change
      setTimeout(() => setSelectedOrder(null), 600);
    } catch (err) {
      // Roll back the optimistic override on error
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
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }

        .orders-wrapper {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        /* ── Header ── */
        .orders-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }
        .orders-header-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .orders-search-wrap {
          position: relative;
        }
        .orders-search-wrap svg {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          pointer-events: none;
        }
        .orders-search-input {
          padding-left: 34px;
          padding-right: 16px;
          padding-top: 9px;
          padding-bottom: 9px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          font-size: 12px;
          width: 230px;
          outline: none;
          color: #1e293b;
        }

        /* ── Tabs toolbar ── */
        .orders-tabs-row {
          padding: 16px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
          border-bottom: 1px solid #f8fafc;
        }
        .orders-tabs {
          display: flex;
          gap: 4px;
          background: #f8fafc;
          padding: 4px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          flex-wrap: wrap;
        }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .orders-header { flex-direction: column; }
          .orders-header-actions { width: 100%; }
          .orders-search-input { width: 100%; }
          .orders-search-wrap { width: 100%; flex: 1; }
          .orders-tabs-row { padding: 12px 16px; }
          .col-date    { display: none; }
          .col-payment { display: none; }
        }

        @media (max-width: 540px) {
          .col-price { display: none; }
          .col-num   { display: none; }
          .orders-header-actions { flex-direction: column; align-items: stretch; }
        }
      `}</style>

      <div className="orders-wrapper">

        {/* ── Header ── */}
        <div className="orders-header">
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
              Order Management
            </h1>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px', fontWeight: 500, marginBottom: 0 }}>
              Control and track all customer transactions
            </p>
          </div>

          <div className="orders-header-actions">
            <div className="orders-search-wrap">
              <Search size={13} />
              <input
                type="text"
                placeholder="Search by ID or Product..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="orders-search-input"
              />
            </div>
            <div style={{ position: 'relative', padding: '9px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', cursor: 'pointer', lineHeight: 0, flexShrink: 0 }}>
              <Bell size={17} color="#64748b" />
              <span style={{ position: 'absolute', top: '8px', right: '8px', width: '6px', height: '6px', background: '#ef4444', borderRadius: '50%' }} />
            </div>
            <div style={{ padding: '9px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', cursor: 'pointer', lineHeight: 0, flexShrink: 0 }}>
              <Zap size={17} color="#64748b" />
            </div>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' }}>
          <StatCard title="Total Orders"  value={statsData?.total     ?? 0} badge="14.4%" badgeUp    sub="Last 30 days"           onClick={() => setActiveTab('All order')} loading={statsLoading} />
          <StatCard title="New Orders"    value={statsData?.pending   ?? 0} badge="20%"   badgeUp    sub="Needs processing"       onClick={() => setActiveTab('Pending')}   loading={statsLoading} />
          <StatCard title="Completed"     value={statsData?.delivered ?? 0} badge="83%"   badgeUp    sub="Successfully delivered" onClick={() => setActiveTab('Completed')} loading={statsLoading} />
          <StatCard title="Cancelled"     value={statsData?.cancelled ?? 0} badge="3.2%"  badgeUp={false} sub="Lost opportunities" onClick={() => setActiveTab('Canceled')}  loading={statsLoading} />
        </div>

        {/* ── Order Table Card ── */}
        <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #f1f5f9', boxShadow: '0 4px 24px rgba(0,0,0,0.04)', overflow: 'hidden' }}>

          {/* Top bar */}
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: 900, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Order Repository
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={handleManualOrder}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#1a6b3c', color: 'white', border: 'none', borderRadius: '12px', padding: '8px 16px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                <Plus size={13} strokeWidth={3} /> Add Order
              </button>
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowMoreActions(!showMoreActions)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'white', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '8px 16px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
                >
                  More Actions
                  <ChevronDown size={13} style={{ transform: showMoreActions ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>
                {showMoreActions && (
                  <div style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, background: 'white', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '6px', minWidth: '160px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', zIndex: 20 }}>
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
          <div className="orders-tabs-row">
            <div className="orders-tabs">
              {tabs.map((tab) => {
                const active = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
                    style={{
                      padding: '7px 16px', fontSize: '11px', fontWeight: 800,
                      borderRadius: '9px', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
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
                <button key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '11px', fontWeight: 700, color: '#64748b', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  {icon} {label}
                </button>
              ))}
            </div>
          </div>

          {/* Table area */}
          <div style={{ overflowX: 'auto', minHeight: '340px', padding: '0 24px 24px' }}>
            {ordersLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: '16px' }}>
                <div style={{ width: '44px', height: '44px', border: '4px solid #d1fae5', borderTopColor: '#059669', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <span style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                  Synchronizing Local Cluster...
                </span>
              </div>
            ) : (
              <>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '400px' }}>
                  <thead>
                    <tr>
                      {[
                        { label: '#',        align: 'left',   cls: 'col-num' },
                        { label: 'Order ID', align: 'left',   cls: '' },
                        { label: 'Product',  align: 'left',   cls: '' },
                        { label: 'Date',     align: 'center', cls: 'col-date' },
                        { label: 'Price',    align: 'center', cls: 'col-price' },
                        { label: 'Payment',  align: 'center', cls: 'col-payment' },
                        { label: 'Status',   align: 'center', cls: '' },
                      ].map(({ label, align, cls }) => (
                        <th key={label} className={cls} style={{
                          padding: '14px 12px', fontSize: '10px', fontWeight: 800, color: '#4c9f70',
                          textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: align,
                          whiteSpace: 'nowrap', background: '#fafafa', borderBottom: '1px solid #f1f5f9',
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
                          <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>No orders found</span>
                        </td>
                      </tr>
                    ) : (
                      paginatedOrders.map((o, i) => (
                        <tr
                          key={o._id || o.id}
                          onClick={() => setSelectedOrder(o)}
                          style={{ borderBottom: '1px solid #f8fafc', cursor: 'pointer', transition: 'background 0.12s' }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = '#fafafa'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                        >
                          <td className="col-num" style={{ padding: '14px 12px', fontSize: '11px', fontWeight: 700, color: '#94a3b8' }}>
                            {(currentPage - 1) * itemsPerPage + i + 1}
                          </td>
                          <td style={{ padding: '14px 12px', fontSize: '11px', fontWeight: 800, color: '#1a6b3c', whiteSpace: 'nowrap' }}>
                            #{o.id}
                          </td>
                          <td style={{ padding: '14px 12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ width: '40px', height: '40px', flexShrink: 0, background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0' }}>
                                {o.image ? (
                                  <img src={o.image} alt={o.product} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                  <span style={{ fontSize: '18px' }}>{o.emoji}</span>
                                )}
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', maxWidth: '130px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {o.product}
                                </span>
                                {o.variant && (
                                  <span style={{ fontSize: '10px', fontWeight: 600, color: '#64748b' }}>Variant: {o.variant}</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="col-date" style={{ padding: '14px 12px', fontSize: '11px', fontWeight: 600, color: '#64748b', textAlign: 'center', whiteSpace: 'nowrap' }}>
                            {o.date}
                          </td>
                          <td className="col-price" style={{ padding: '14px 12px', fontSize: '13px', fontWeight: 900, color: '#0f172a', textAlign: 'center', whiteSpace: 'nowrap' }}>
                            {formatINR(o.price)}
                          </td>
                          <td className="col-payment" style={{ padding: '14px 12px', textAlign: 'center' }}>
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
                              display: 'inline-block', padding: '4px 14px', borderRadius: '999px',
                              fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em',
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
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '24px', flexWrap: 'wrap', gap: '12px' }}>
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

                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
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
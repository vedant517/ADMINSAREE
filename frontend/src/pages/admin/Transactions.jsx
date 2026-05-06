import React, { useState } from 'react';
import {
  Search, Bell, Filter, MoreHorizontal, ChevronLeft, ChevronRight,
  ArrowUpRight, ArrowDownRight, IndianRupee, RefreshCw, Eye, RotateCcw,
  CheckCircle2, XCircle, Clock, AlertCircle, CreditCard
} from 'lucide-react';
import {
  useGetTransactionsQuery,
  useGetTransactionStatsQuery,
  useRefundTransactionMutation,
} from '../../features/transactions/transactionApi';
import toast from 'react-hot-toast';
import { formatINR } from '../../utils/currency';

const statusConfig = {
  captured: { bg: '#e8f5ee', color: '#1a6b3c', icon: CheckCircle2, label: 'Success' },
  created: { bg: '#e3f2fd', color: '#1565c0', icon: Clock, label: 'Pending' },
  failed: { bg: '#fce8e8', color: '#c0392b', icon: XCircle, label: 'Failed' },
  refunded: { bg: '#fff3e0', color: '#e65100', icon: RotateCcw, label: 'Refunded' },
  authorized: { bg: '#e8f5ee', color: '#2e7d32', icon: CheckCircle2, label: 'Authorized' },
};

function StatCard({ title, value, icon: Icon, color, sub, trend, trendUp }) {
  return (
    <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #f1f5f9', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: color + '18', flexShrink: 0 }}>
          <Icon size={20} style={{ color }} />
        </div>
        {trend && (
          <span style={{
            fontSize: '10px', fontWeight: 800, padding: '3px 8px', borderRadius: '999px',
            display: 'flex', alignItems: 'center', gap: '2px',
            background: trendUp ? '#f0fdf4' : '#fff1f2',
            color: trendUp ? '#059669' : '#e11d48',
          }}>
            {trendUp ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />} {trend}
          </span>
        )}
      </div>
      <div style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>{value}</div>
      <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{title}</div>
      {sub && <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>{sub}</div>}
    </div>
  );
}

function TransactionDetailModal({ transaction, onClose, onRefund }) {
  if (!transaction) return null;
  const sc = statusConfig[transaction.status] || statusConfig.created;
  const StatusIcon = sc.icon;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }}>
      <div style={{ background: 'white', borderRadius: '24px', boxShadow: '0 24px 60px rgba(0,0,0,0.15)', padding: '32px', width: '100%', maxWidth: '480px', border: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', margin: 0 }}>Transaction Details</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#94a3b8', lineHeight: 1 }}>&times;</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#f8fafc', borderRadius: '12px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Status</span>
            <span style={{ padding: '4px 12px', borderRadius: '999px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px', background: sc.bg, color: sc.color }}>
              <StatusIcon size={12} /> {sc.label}
            </span>
          </div>
          {[
            ['Transaction ID', transaction.transactionId],
            ['Razorpay Order', transaction.razorpayOrderId],
            ['Payment ID', transaction.razorpayPaymentId || '—'],
            ['Amount', formatINR(transaction.amount)],
            ['Currency', transaction.currency || 'INR'],
            ['Receipt', transaction.receipt || '—'],
            ['Date', new Date(transaction.createdAt).toLocaleString('en-IN')],
          ].map(([label, value]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f8fafc' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#1e293b', fontFamily: 'monospace' }}>{value}</span>
            </div>
          ))}
          {transaction.order && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f8fafc' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Linked Order</span>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#059669' }}>{transaction.order?.orderId || transaction.order}</span>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '12px', fontSize: '12px', fontWeight: 700, color: '#475569', background: '#f1f5f9', border: 'none', borderRadius: '12px', cursor: 'pointer' }}>Close</button>
          {transaction.status === 'captured' && (
            <button onClick={() => onRefund(transaction._id)} style={{ flex: 1, padding: '12px', fontSize: '12px', fontWeight: 700, color: 'white', background: '#f59e0b', border: 'none', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <RotateCcw size={14} /> Initiate Refund
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Transactions() {
  const [activeFilter, setActiveFilter] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTxn, setSelectedTxn] = useState(null);
  const itemsPerPage = 10;

  const filters = [
    { label: 'All', value: null },
    { label: 'Success', value: 'captured' },
    { label: 'Pending', value: 'created' },
    { label: 'Failed', value: 'failed' },
    { label: 'Refunded', value: 'refunded' },
  ];

  const { data: txnResponse, isLoading } = useGetTransactionsQuery({ status: activeFilter, page: currentPage, limit: itemsPerPage });
  const { data: stats, isLoading: statsLoading } = useGetTransactionStatsQuery();
  const [refundTxn] = useRefundTransactionMutation();

  const transactions = txnResponse?.data || [];
  const totalPages = txnResponse?.pages || 1;

  const filtered = transactions.filter((t) =>
    (t.transactionId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.razorpayOrderId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.razorpayPaymentId || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRefund = async (id) => {
    if (!window.confirm('Are you sure you want to initiate a refund?')) return;
    try {
      await refundTxn({ id, reason: 'Admin initiated refund' }).unwrap();
      toast.success('Refund initiated successfully');
      setSelectedTxn(null);
    } catch (err) {
      toast.error(err?.data?.message || 'Refund failed');
    }
  };

  return (
    <div className="flex-1 min-w-0" style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '24px' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
            <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CreditCard size={20} color="white" />
            </div>
            Transactions
          </h1>
          <p style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: '6px', marginLeft: '52px' }}>
            Razorpay Payment Gateway · Real-time Ledger
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={13} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input type="text" placeholder="Search by ID or Payment..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '36px', paddingRight: '16px', paddingTop: '9px', paddingBottom: '9px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '12px', width: '240px', outline: 'none' }} />
          </div>
          <button style={{ padding: '9px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', cursor: 'pointer', lineHeight: 0 }}>
            <Bell size={17} color="#64748b" />
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' }}>
        <StatCard title="Total Transactions" value={statsLoading ? '...' : stats?.total || 0} icon={CreditCard} color="#6366f1" trend="All time" />
        <StatCard title="Total Revenue" value={statsLoading ? '...' : formatINR(stats?.totalRevenue || 0)} icon={IndianRupee} color="#10b981" trend="+12.5%" trendUp />
        <StatCard title="Successful" value={statsLoading ? '...' : stats?.captured || 0} icon={CheckCircle2} color="#22c55e" />
        <StatCard title="Pending" value={statsLoading ? '...' : stats?.pending || 0} icon={Clock} color="#f59e0b" />
        <StatCard title="Failed / Refunded" value={statsLoading ? '...' : (stats?.failed || 0) + (stats?.refunded || 0)} icon={XCircle} color="#ef4444" />
      </div>

      {/* ── Table Card ── */}
      <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #f1f5f9', boxShadow: '0 4px 16px rgba(0,0,0,0.04)', overflow: 'hidden' }}>

        {/* Filters bar */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '4px', background: '#f8fafc', padding: '4px', borderRadius: '12px', border: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
            {filters.map((f) => (
              <button key={f.label} onClick={() => { setActiveFilter(f.value); setCurrentPage(1); }}
                style={{
                  padding: '7px 14px', fontSize: '11px', fontWeight: 800, borderRadius: '9px', border: 'none',
                  cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s',
                  background: activeFilter === f.value ? 'white' : 'transparent',
                  color: activeFilter === f.value ? '#6366f1' : '#94a3b8',
                  boxShadow: activeFilter === f.value ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                }}>
                {f.label}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[{ icon: <Filter size={14} />, label: 'Advanced' }, { icon: <RefreshCw size={14} />, label: 'Refresh' }].map(({ icon, label }) => (
              <button key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '11px', fontWeight: 700, color: '#64748b', cursor: 'pointer' }}>
                {icon} {label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto', minHeight: '300px' }}>
          {isLoading ? (
            <div style={{ padding: '60px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <div style={{ width: '44px', height: '44px', border: '4px solid #e0e7ff', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Syncing Razorpay Ledger...</span>
            </div>
          ) : (
            <>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#fafafa', borderBottom: '1px solid #f1f5f9' }}>
                    {['#', 'Transaction ID', 'Razorpay Order', 'Amount', 'Method', 'Date', 'Status', 'Action'].map((h, i) => (
                      <th key={h} style={{ padding: '14px 14px', fontSize: '10px', fontWeight: 800, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: i === 0 || i >= 3 ? 'center' : 'left', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '60px 0' }}>
                        <CreditCard size={40} color="#e2e8f0" style={{ margin: '0 auto 12px', display: 'block' }} />
                        <p style={{ fontSize: '11px', fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.1em' }}>No transactions found</p>
                        <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Transactions will appear once Razorpay payments are processed</p>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((t, i) => {
                      const sc = statusConfig[t.status] || statusConfig.created;
                      const StatusIcon = sc.icon;
                      return (
                        <tr key={t._id} onClick={() => setSelectedTxn(t)} style={{ borderBottom: '1px solid #f8fafc', cursor: 'pointer', transition: 'background 0.1s' }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#fafafa'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <td style={{ padding: '14px', textAlign: 'center', fontSize: '11px', fontWeight: 700, color: '#94a3b8' }}>{(currentPage - 1) * itemsPerPage + i + 1}</td>
                          <td style={{ padding: '14px', fontSize: '11px', fontWeight: 800, color: '#6366f1', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{t.transactionId}</td>
                          <td style={{ padding: '14px', fontSize: '11px', fontWeight: 700, color: '#64748b', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{t.razorpayOrderId?.slice(0, 20)}...</td>
                          <td style={{ padding: '14px', textAlign: 'center', fontSize: '13px', fontWeight: 900, color: '#0f172a', whiteSpace: 'nowrap' }}>{formatINR(t.amount)}</td>
                          <td style={{ padding: '14px', textAlign: 'center' }}>
                            {(() => {
                              const method = t.paymentMethod || t.order?.paymentMethod || 'Razorpay';
                              const isCod = method.toLowerCase() === 'cod' || method.toLowerCase() === 'cash on delivery';
                              return (
                                <span style={{ fontSize: '10px', fontWeight: 700, color: isCod ? '#b45309' : '#1e40af', background: isCod ? '#fef3c7' : '#dbeafe', padding: '4px 10px', borderRadius: '999px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                                  {isCod ? 'COD' : 'Razorpay'}
                                </span>
                              );
                            })()}
                          </td>
                          <td style={{ padding: '14px', textAlign: 'center', fontSize: '11px', fontWeight: 600, color: '#64748b', whiteSpace: 'nowrap' }}>
                            {new Date(t.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>
                          <td style={{ padding: '14px', textAlign: 'center' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: 800, padding: '4px 12px', borderRadius: '999px', textTransform: 'uppercase', whiteSpace: 'nowrap', background: sc.bg, color: sc.color }}>
                              <StatusIcon size={10} /> {sc.label}
                            </span>
                          </td>
                          <td style={{ padding: '14px', textAlign: 'center' }}>
                            <button onClick={(e) => { e.stopPropagation(); setSelectedTxn(t); }} style={{ padding: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1', borderRadius: '6px', transition: 'all 0.1s' }}
                              onMouseEnter={(e) => { e.currentTarget.style.color = '#6366f1'; e.currentTarget.style.background = '#eef2ff'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.color = '#cbd5e1'; e.currentTarget.style.background = 'none'; }}>
                              <Eye size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>

              {txnResponse?.total > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderTop: '1px solid #f8fafc', flexWrap: 'wrap', gap: '12px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    Page {currentPage} of {totalPages} · {txnResponse?.total || 0} records
                  </span>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '7px 14px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '11px', fontWeight: 800, color: '#64748b', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.35 : 1 }}>
                      <ChevronLeft size={14} /> Prev
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => (
                      <button key={i} onClick={() => setCurrentPage(i + 1)}
                        style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', fontSize: '12px', fontWeight: 800, border: currentPage === i + 1 ? 'none' : '1px solid #e2e8f0', background: currentPage === i + 1 ? '#6366f1' : 'white', color: currentPage === i + 1 ? 'white' : '#64748b', cursor: 'pointer' }}>
                        {i + 1}
                      </button>
                    ))}
                    <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '7px 14px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '11px', fontWeight: 800, color: '#64748b', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.35 : 1 }}>
                      Next <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {selectedTxn && <TransactionDetailModal transaction={selectedTxn} onClose={() => setSelectedTxn(null)} onRefund={handleRefund} />}
    </div>
  );
}

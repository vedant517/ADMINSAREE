import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  Plus, Search, Tag, Percent, DollarSign, Calendar, Trash2,
  ToggleLeft, ToggleRight, Edit3, X, Copy, CheckCircle,
  Clock, AlertCircle, Zap, Users, ShoppingCart, ChevronLeft,
  ChevronRight, RefreshCw,
} from 'lucide-react';
import api from '../../services/api';

const API_BASE = '/coupons';

/* ── colour tokens ── */
const G  = '#1a6b3c';
const LG = '#e8f5ee';

/* ── shared input style ── */
const inp = {
  width: '100%', padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: '10px',
  fontSize: '13px', color: '#0f172a', outline: 'none', background: '#f8fafc', boxSizing: 'border-box',
};

/* ── helpers ── */
const formatINR = (v) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v || 0);

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const isExpired  = (d) => d && new Date(d) < new Date();
const isExpiring = (d) => {
  if (!d) return false;
  const diff = new Date(d) - new Date();
  return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000;
};

/* ── API calls ── */
// apiFetch now uses the centralized api (axios) instance
async function apiFetch(path, options = {}) {
  const method = (options.method || 'GET').toLowerCase();
  const res = await api({
    url: `${API_BASE}${path}`,
    method,
    data: options.body ? JSON.parse(options.body) : undefined,
    ...options
  });
  return res.data;
}


/* ── Field label wrapper — defined OUTSIDE any component so it never remounts ── */
function Field({ label, children, required }) {
  return (
    <div>
      <label style={{
        fontSize: '10px', fontWeight: '800', color: '#64748b',
        textTransform: 'uppercase', letterSpacing: '0.08em',
        display: 'block', marginBottom: '5px',
      }}>
        {label}{required && <span style={{ color: '#f43f5e' }}> *</span>}
      </label>
      {children}
    </div>
  );
}

/* ── Status Badge ── */
const badgeBase = {
  fontSize: '10px', fontWeight: '700', padding: '3px 10px',
  borderRadius: '999px', textTransform: 'uppercase', letterSpacing: '0.04em',
};

function StatusBadge({ coupon }) {
  if (!coupon.isActive)
    return <span style={{ ...badgeBase, background: '#f1f5f9', color: '#94a3b8' }}>Inactive</span>;
  if (isExpired(coupon.validUntil))
    return <span style={{ ...badgeBase, background: '#fce8e8', color: '#c0392b' }}>Expired</span>;
  if (isExpiring(coupon.validUntil))
    return <span style={{ ...badgeBase, background: '#fef3c7', color: '#d97706' }}>Expiring Soon</span>;
  return <span style={{ ...badgeBase, background: LG, color: G }}>Active</span>;
}

/* ── Coupon Card ── */
function CouponCard({ coupon, onEdit, onDelete, onToggle, onCopy }) {
  const usagePct = coupon.usageLimit
    ? Math.min((coupon.usedCount / coupon.usageLimit) * 100, 100)
    : null;

  return (
    <div
      style={{
        background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0',
        overflow: 'hidden', transition: 'box-shadow 0.2s, transform 0.2s', position: 'relative',
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
    >
      <div style={{ height: '4px', background: coupon.isActive && !isExpired(coupon.validUntil) ? `linear-gradient(90deg,${G},#2ecc71)` : '#e2e8f0' }} />

      <div style={{ padding: '16px' }}>
        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: LG, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {coupon.discountType === 'percentage' ? <Percent size={18} color={G} /> : <DollarSign size={18} color={G} />}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '15px', fontWeight: '900', color: '#0f172a', letterSpacing: '0.05em', fontFamily: 'monospace' }}>
                  {coupon.code}
                </span>
                <button onClick={() => onCopy(coupon.code)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '2px', lineHeight: 0 }} title="Copy code">
                  <Copy size={12} />
                </button>
              </div>
              {coupon.description && (
                <p style={{ fontSize: '10px', color: '#64748b', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' }}>
                  {coupon.description}
                </p>
              )}
            </div>
          </div>
          <StatusBadge coupon={coupon} />
        </div>

        {/* Discount value */}
        <div style={{ background: LG, borderRadius: '12px', padding: '12px', marginBottom: '12px', textAlign: 'center' }}>
          <span style={{ fontSize: '28px', fontWeight: '900', color: G, lineHeight: 1 }}>
            {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : formatINR(coupon.discountValue)}
          </span>
          <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '2px' }}>
            {coupon.discountType === 'percentage' ? 'OFF' : 'Flat discount'}
            {coupon.maxDiscount ? ` · max ${formatINR(coupon.maxDiscount)}` : ''}
          </span>
        </div>

        {/* Meta grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
          {[
            { icon: <ShoppingCart size={11} />, label: 'Min. Order', val: formatINR(coupon.minOrderValue) },
            { icon: <Users size={11} />,        label: 'Usage',      val: coupon.usageLimit ? `${coupon.usedCount}/${coupon.usageLimit}` : `${coupon.usedCount} used` },
            { icon: <Calendar size={11} />,     label: 'Valid From', val: formatDate(coupon.validFrom) },
            { icon: <Clock size={11} />,        label: 'Expires',    val: formatDate(coupon.validUntil) },
          ].map(({ icon, label, val }) => (
            <div key={label} style={{ background: '#f8fafc', borderRadius: '8px', padding: '7px 10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#94a3b8', marginBottom: '2px' }}>
                {icon}
                <span style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '700' }}>{label}</span>
              </div>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#0f172a' }}>{val}</span>
            </div>
          ))}
        </div>

        {/* Usage progress bar */}
        {usagePct !== null && (
          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#94a3b8', marginBottom: '4px' }}>
              <span>Usage</span><span>{usagePct.toFixed(0)}%</span>
            </div>
            <div style={{ height: '5px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: '999px', background: usagePct > 80 ? '#f43f5e' : G, width: `${usagePct}%`, transition: 'width 0.4s' }} />
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={() => onToggle(coupon._id)}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', padding: '7px', border: '1px solid #e2e8f0', borderRadius: '10px', background: 'none', fontSize: '11px', fontWeight: '700', cursor: 'pointer', color: coupon.isActive ? '#f59e0b' : G }}
          >
            {coupon.isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
            {coupon.isActive ? 'Disable' : 'Enable'}
          </button>
          <button
            onClick={() => onEdit(coupon)}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', padding: '7px', border: `1px solid ${G}`, borderRadius: '10px', background: 'none', fontSize: '11px', fontWeight: '700', cursor: 'pointer', color: G }}
          >
            <Edit3 size={13} /> Edit
          </button>
          <button
            onClick={() => onDelete(coupon._id)}
            style={{ width: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '7px', border: '1px solid #fecaca', borderRadius: '10px', background: 'none', cursor: 'pointer', color: '#f43f5e' }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   CREATE / EDIT MODAL
   Field is defined OUTSIDE this component — that
   is what prevents inputs from losing focus on
   every keystroke.
══════════════════════════════════════════════ */
const INIT = {
  code: '', description: '', discountType: 'percentage', discountValue: '',
  minOrderValue: '', maxDiscount: '', usageLimit: '', usagePerUser: '1',
  validFrom: new Date().toISOString().split('T')[0],
  validUntil: '', isActive: true,
};

function CouponModal({ coupon, onClose, onSave }) {
  const isEdit = !!coupon;

  const [form, setForm] = useState(() => {
    if (!coupon) return { ...INIT };
    return {
      code:          coupon.code          ?? '',
      description:   coupon.description   ?? '',
      discountType:  coupon.discountType  ?? 'percentage',
      discountValue: coupon.discountValue != null ? String(coupon.discountValue) : '',
      minOrderValue: coupon.minOrderValue != null ? String(coupon.minOrderValue) : '',
      maxDiscount:   coupon.maxDiscount   != null ? String(coupon.maxDiscount)   : '',
      usageLimit:    coupon.usageLimit    != null ? String(coupon.usageLimit)    : '',
      usagePerUser:  coupon.usagePerUser  != null ? String(coupon.usagePerUser)  : '1',
      validFrom:     coupon.validFrom  ? new Date(coupon.validFrom).toISOString().split('T')[0]  : INIT.validFrom,
      validUntil:    coupon.validUntil ? new Date(coupon.validUntil).toISOString().split('T')[0] : '',
      isActive:      coupon.isActive !== undefined ? coupon.isActive : true,
    };
  });

  const [saving, setSaving] = useState(false);

  // Generic setter — keeps all values as strings so inputs stay controlled
  const set = useCallback((k, v) => setForm(f => ({ ...f, [k]: v })), []);

  const handleSubmit = async () => {
    if (!form.code.trim())   return toast.error('Coupon code is required');
    if (!form.discountValue) return toast.error('Discount value is required');
    if (!form.validUntil)    return toast.error('Expiry date is required');

    setSaving(true);
    try {
      await onSave({
        code:          form.code.trim().toUpperCase(),
        description:   form.description,
        discountType:  form.discountType,
        discountValue: Number(form.discountValue),
        minOrderValue: form.minOrderValue !== '' ? Number(form.minOrderValue) : 0,
        maxDiscount:   form.maxDiscount   !== '' ? Number(form.maxDiscount)   : null,
        usageLimit:    form.usageLimit    !== '' ? Number(form.usageLimit)    : null,
        usagePerUser:  form.usagePerUser  !== '' ? Number(form.usagePerUser)  : 1,
        validFrom:     form.validFrom,
        validUntil:    form.validUntil,
        isActive:      form.isActive,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }}>
      <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '540px', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.18)' }}>

        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#fff', zIndex: 2, borderRadius: '20px 20px 0 0' }}>
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: '900', color: '#0f172a', margin: 0 }}>
              {isEdit ? 'Edit Coupon' : 'Create New Coupon'}
            </h2>
            <p style={{ fontSize: '11px', color: '#94a3b8', margin: '3px 0 0' }}>
              {isEdit ? `Editing ${coupon.code}` : 'Fill in the details below'}
            </p>
          </div>
          <button onClick={onClose} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '7px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <X size={16} color="#64748b" />
          </button>
        </div>

        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Code + Description */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Field label="Coupon Code" required>
              <input
                value={form.code}
                onChange={e => set('code', e.target.value.toUpperCase())}
                placeholder="SAVE20"
                style={inp}
                maxLength={20}
              />
            </Field>
            <Field label="Description">
              <input
                value={form.description}
                onChange={e => set('description', e.target.value)}
                placeholder="Summer sale…"
                style={inp}
              />
            </Field>
          </div>

          {/* Discount Type */}
          <Field label="Discount Type" required>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[
                { val: 'percentage', icon: <Percent size={14} />, label: 'Percentage (%)' },
                { val: 'flat',       icon: <DollarSign size={14} />, label: 'Flat Amount (₹)' },
              ].map(opt => (
                <button
                  key={opt.val}
                  onClick={() => set('discountType', opt.val)}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', padding: '10px', borderRadius: '10px', border: `2px solid ${form.discountType === opt.val ? G : '#e2e8f0'}`, background: form.discountType === opt.val ? LG : 'white', color: form.discountType === opt.val ? G : '#64748b', fontSize: '12px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.15s' }}
                >
                  {opt.icon}{opt.label}
                </button>
              ))}
            </div>
          </Field>

          {/* Discount value + conditional second field */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Field label={form.discountType === 'percentage' ? 'Discount %' : 'Discount Amount ₹'} required>
              <input
                type="number"
                value={form.discountValue}
                onChange={e => set('discountValue', e.target.value)}
                placeholder={form.discountType === 'percentage' ? '20' : '200'}
                min="0"
                max={form.discountType === 'percentage' ? 100 : undefined}
                style={inp}
              />
            </Field>
            {form.discountType === 'percentage' ? (
              <Field label="Max Discount ₹">
                <input
                  type="number"
                  value={form.maxDiscount}
                  onChange={e => set('maxDiscount', e.target.value)}
                  placeholder="500 (optional)"
                  min="0"
                  style={inp}
                />
              </Field>
            ) : (
              <Field label="Min Order Value ₹">
                <input
                  type="number"
                  value={form.minOrderValue}
                  onChange={e => set('minOrderValue', e.target.value)}
                  placeholder="0"
                  min="0"
                  style={inp}
                />
              </Field>
            )}
          </div>

          {/* Min order for percentage (extra row) */}
          {form.discountType === 'percentage' && (
            <Field label="Min Order Value ₹">
              <input
                type="number"
                value={form.minOrderValue}
                onChange={e => set('minOrderValue', e.target.value)}
                placeholder="0"
                min="0"
                style={inp}
              />
            </Field>
          )}

          {/* Usage limits */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Field label="Total Usage Limit">
              <input
                type="number"
                value={form.usageLimit}
                onChange={e => set('usageLimit', e.target.value)}
                placeholder="Unlimited"
                min="1"
                style={inp}
              />
            </Field>
            <Field label="Per User Limit">
              <input
                type="number"
                value={form.usagePerUser}
                onChange={e => set('usagePerUser', e.target.value)}
                placeholder="1"
                min="1"
                style={inp}
              />
            </Field>
          </div>

          {/* Dates */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Field label="Valid From" required>
              <input
                type="date"
                value={form.validFrom}
                onChange={e => set('validFrom', e.target.value)}
                style={inp}
              />
            </Field>
            <Field label="Valid Until" required>
              <input
                type="date"
                value={form.validUntil}
                onChange={e => set('validUntil', e.target.value)}
                min={form.validFrom}
                style={inp}
              />
            </Field>
          </div>

          {/* Active toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#f8fafc', borderRadius: '12px' }}>
            <div>
              <p style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Active</p>
              <p style={{ fontSize: '10px', color: '#94a3b8', margin: '2px 0 0' }}>Coupon can be used immediately when active</p>
            </div>
            <button
              onClick={() => set('isActive', !form.isActive)}
              style={{ width: '44px', height: '24px', borderRadius: '12px', background: form.isActive ? G : '#e2e8f0', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}
            >
              <span style={{ position: 'absolute', top: '3px', left: form.isActive ? '23px' : '3px', width: '18px', height: '18px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
            </button>
          </div>

          {/* Live preview */}
          {form.code && form.discountValue && (
            <div style={{ background: LG, borderRadius: '12px', padding: '12px 14px', border: `1px dashed ${G}` }}>
              <p style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>Preview</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'monospace', fontSize: '14px', fontWeight: '900', color: G }}>{form.code}</span>
                <span style={{ fontSize: '12px', color: '#475569' }}>—</span>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>
                  {form.discountType === 'percentage'
                    ? `${form.discountValue}% off`
                    : `₹${form.discountValue} off`}
                  {form.maxDiscount && form.discountType === 'percentage' ? ` (max ₹${form.maxDiscount})` : ''}
                  {form.minOrderValue && Number(form.minOrderValue) > 0 ? ` on orders above ₹${form.minOrderValue}` : ''}
                </span>
              </div>
              {form.validUntil && (
                <p style={{ fontSize: '10px', color: '#64748b', margin: '4px 0 0' }}>
                  Valid until {formatDate(form.validUntil)}
                </p>
              )}
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '8px', paddingTop: '4px' }}>
            <button
              onClick={onClose}
              style={{ flex: 1, padding: '11px', border: '1px solid #e2e8f0', borderRadius: '12px', background: 'none', fontSize: '12px', cursor: 'pointer', color: '#475569', fontWeight: '700' }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              style={{ flex: 2, padding: '11px', border: 'none', borderRadius: '12px', background: G, color: '#fff', fontSize: '12px', fontWeight: '800', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              {saving
                ? <><RefreshCw size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> Saving…</>
                : <><CheckCircle size={14} /> {isEdit ? 'Save Changes' : 'Create Coupon'}</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════ */
export default function CouponManagement() {
  const [coupons, setCoupons]         = useState([]);
  const [pagination, setPagination]   = useState({});
  const [isLoading, setIsLoading]     = useState(true);
  const [isFetching, setIsFetching]   = useState(false);
  const [page, setPage]               = useState(1);
  const [search, setSearch]           = useState('');
  const [filterType, setFilterType]   = useState('');
  const [filterActive, setFilterActive] = useState('');
  const [modalOpen, setModalOpen]     = useState(false);
  const [editCoupon, setEditCoupon]   = useState(null);

  /* ── Fetch coupons ── */
  const fetchCoupons = useCallback(async (showSpinner = false) => {
    if (showSpinner) setIsLoading(true);
    else setIsFetching(true);
    try {
      const params = new URLSearchParams({ page, limit: 9 });
      if (search)       params.append('search', search);
      if (filterType)   params.append('discountType', filterType);
      if (filterActive) params.append('isActive', filterActive);
      const data = await apiFetch(`?${params.toString()}`);
      setCoupons(data.data || []);
      setPagination(data.pagination || {});
    } catch (err) {
      toast.error(err.message || 'Failed to load coupons');
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [page, search, filterType, filterActive]);

  useEffect(() => { fetchCoupons(true); }, [fetchCoupons]);

  /* ── Save ── */
  const handleSave = async (form) => {
    if (editCoupon) {
      await apiFetch(`/${editCoupon._id}`, { method: 'PUT', body: JSON.stringify(form) });
      toast.success('Coupon updated!');
    } else {
      await apiFetch('', { method: 'POST', body: JSON.stringify(form) });
      toast.success('Coupon created!');
    }
    setModalOpen(false);
    setEditCoupon(null);
    fetchCoupons();
  };

  /* ── Delete ── */
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    try {
      await apiFetch(`/${id}`, { method: 'DELETE' });
      toast.success('Coupon deleted');
      fetchCoupons();
    } catch (err) { toast.error(err.message || 'Delete failed'); }
  };

  /* ── Toggle ── */
  const handleToggle = async (id) => {
    try {
      const res = await apiFetch(`/${id}/toggle`, { method: 'PATCH' });
      toast.success(res.message || 'Status updated');
      fetchCoupons();
    } catch (err) { toast.error(err.message || 'Toggle failed'); }
  };

  /* ── Copy ── */
  const handleCopy = (code) => {
    navigator.clipboard?.writeText(code);
    toast.success(`Copied: ${code}`);
  };

  const openEdit   = (coupon) => { setEditCoupon(coupon); setModalOpen(true); };
  const openCreate = ()       => { setEditCoupon(null);   setModalOpen(true); };

  const activeCoupons  = coupons.filter(c => c.isActive && !isExpired(c.validUntil)).length;
  const expiredCoupons = coupons.filter(c => isExpired(c.validUntil)).length;
  const totalUsed      = coupons.reduce((a, c) => a + (c.usedCount || 0), 0);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '20px', fontFamily: 'sans-serif', color: '#1e293b' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', margin: 0 }}>Coupon Management</h1>
          <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px', marginBottom: 0 }}>Create and manage discount coupons for your store</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => fetchCoupons()}
            style={{ padding: '9px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', cursor: 'pointer', lineHeight: 0, color: '#64748b' }}
          >
            <RefreshCw size={16} style={isFetching ? { animation: 'spin 0.8s linear infinite' } : {}} />
          </button>
          <button
            onClick={openCreate}
            style={{ display: 'flex', alignItems: 'center', gap: '7px', background: G, color: 'white', border: 'none', borderRadius: '12px', padding: '10px 18px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
          >
            <Plus size={15} strokeWidth={3} /> Create Coupon
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        {[
          { label: 'Total Coupons', val: pagination.total ?? coupons.length, icon: <Tag size={16} color={G} />,               bg: LG        },
          { label: 'Active',        val: activeCoupons,                       icon: <CheckCircle size={16} color="#059669" />, bg: '#f0fdf4' },
          { label: 'Expired',       val: expiredCoupons,                      icon: <AlertCircle size={16} color="#f43f5e" />, bg: '#fef2f2' },
          { label: 'Total Used',    val: totalUsed,                           icon: <Zap size={16} color="#f59e0b" />,         bg: '#fffbeb' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>{s.label}</span>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.icon}</div>
            </div>
            <span style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a' }}>{isLoading ? '…' : s.val}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '8px 12px', flex: '1', minWidth: '200px' }}>
          <Search size={14} color="#94a3b8" />
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search coupon codes…"
            style={{ border: 'none', outline: 'none', fontSize: '12px', width: '100%', background: 'transparent', color: '#0f172a' }}
          />
        </div>
        <select value={filterType} onChange={e => { setFilterType(e.target.value); setPage(1); }}
          style={{ padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '12px', background: '#fff', color: '#475569', outline: 'none', cursor: 'pointer' }}>
          <option value="">All Types</option>
          <option value="percentage">Percentage</option>
          <option value="flat">Flat Amount</option>
        </select>
        <select value={filterActive} onChange={e => { setFilterActive(e.target.value); setPage(1); }}
          style={{ padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '12px', background: '#fff', color: '#475569', outline: 'none', cursor: 'pointer' }}>
          <option value="">All Status</option>
          <option value="true">Active Only</option>
          <option value="false">Inactive Only</option>
        </select>
        {(search || filterType || filterActive) && (
          <button
            onClick={() => { setSearch(''); setFilterType(''); setFilterActive(''); setPage(1); }}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '9px 12px', border: '1px solid #fecaca', borderRadius: '10px', background: 'none', fontSize: '11px', color: '#f43f5e', cursor: 'pointer', fontWeight: '600' }}
          >
            <X size={12} /> Clear
          </button>
        )}
      </div>

      {/* Coupon Grid */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: '16px' }}>
          <div style={{ width: '44px', height: '44px', border: '4px solid #d1fae5', borderTopColor: G, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Loading coupons…</span>
        </div>
      ) : coupons.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <Tag size={48} color="#e2e8f0" style={{ display: 'block', margin: '0 auto 16px' }} />
          <p style={{ fontSize: '14px', fontWeight: '700', color: '#94a3b8' }}>No coupons found</p>
          <p style={{ fontSize: '12px', color: '#cbd5e1', marginBottom: '20px' }}>Create your first coupon to get started</p>
          <button onClick={openCreate} style={{ padding: '10px 24px', background: G, color: '#fff', border: 'none', borderRadius: '10px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>
            Create Coupon
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {coupons.map(coupon => (
            <CouponCard key={coupon._id} coupon={coupon} onEdit={openEdit} onDelete={handleDelete} onToggle={handleToggle} onCopy={handleCopy} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 16px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '12px', fontWeight: '700', color: G, cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1 }}>
            <ChevronLeft size={14} /> Prev
          </button>
          <span style={{ fontSize: '12px', color: '#64748b' }}>Page {page} of {pagination.pages}</span>
          <button disabled={page === pagination.pages} onClick={() => setPage(p => p + 1)}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 16px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '12px', fontWeight: '700', color: G, cursor: page === pagination.pages ? 'not-allowed' : 'pointer', opacity: page === pagination.pages ? 0.4 : 1 }}>
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <CouponModal
          coupon={editCoupon}
          onClose={() => { setModalOpen(false); setEditCoupon(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
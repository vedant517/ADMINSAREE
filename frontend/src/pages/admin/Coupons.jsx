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
const G = '#85754E';
const LG = '#FFF5E2';

const formatINR = (v) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v || 0);

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const isExpired = (d) => d && new Date(d) < new Date();
const isExpiring = (d) => {
  if (!d) return false;
  const diff = new Date(d) - new Date();
  return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000;
};

// ── Fixed apiFetch: cleanly separates method, data, and avoids spreading raw options ──
async function apiFetch(path, { method = 'GET', body } = {}) {
  const res = await api({
    url: `${API_BASE}${path}`,
    method: method.toLowerCase(),
    ...(body !== undefined ? { data: body } : {}),
  });
  return res.data;
}

/* ── Field label wrapper ── */
function Field({ label, children, required }) {
  return (
    <div>
      <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block mb-1">
        {label}{required && <span className="text-rose-500"> *</span>}
      </label>
      {children}
    </div>
  );
}

/* ── Status Badge ── */
function StatusBadge({ coupon }) {
  const base = "text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide";
  if (!coupon.isActive) return <span className={`${base} bg-slate-100 text-slate-400`}>Inactive</span>;
  if (isExpired(coupon.validUntil)) return <span className={`${base} bg-red-100 text-red-600`}>Expired</span>;
  if (isExpiring(coupon.validUntil)) return <span className={`${base} bg-amber-100 text-amber-600`}>Expiring Soon</span>;
  return <span className={`${base} bg-amber-50 text-[#85754E]`}>Active</span>;
}

/* ── Coupon Card ── */
function CouponCard({ coupon, onEdit, onDelete, onToggle, onCopy }) {
  const usagePct = coupon.usageLimit
    ? Math.min((coupon.usedCount / coupon.usageLimit) * 100, 100)
    : null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 relative">
      <div className={`h-1 ${coupon.isActive && !isExpired(coupon.validUntil) ? 'bg-gradient-to-r from-[#b09e6d] to-[#85754E]' : 'bg-slate-200'}`} />

      <div className="p-4">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
              {coupon.discountType === 'percentage'
                ? <Percent size={18} color={G} />
                : <DollarSign size={18} color={G} />
              }
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[15px] font-black text-slate-900 tracking-widest font-mono">{coupon.code}</span>
                <button onClick={() => onCopy(coupon.code)} className="bg-transparent border-0 cursor-pointer text-slate-400 p-0.5 leading-none hover:text-slate-600">
                  <Copy size={12} />
                </button>
              </div>
              {coupon.description && (
                <p className="text-[10px] text-slate-500 mt-0.5 overflow-hidden text-ellipsis whitespace-nowrap max-w-[160px]">
                  {coupon.description}
                </p>
              )}
            </div>
          </div>
          <StatusBadge coupon={coupon} />
        </div>

        {/* Discount value */}
        <div className="bg-amber-50 rounded-xl p-3 mb-3 text-center">
          <span className="text-[28px] font-black text-[#85754E] leading-none">
            {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : formatINR(coupon.discountValue)}
          </span>
          <span className="text-[11px] text-slate-500 block mt-0.5">
            {coupon.discountType === 'percentage' ? 'OFF' : 'Flat discount'}
            {coupon.maxDiscount ? ` · max ${formatINR(coupon.maxDiscount)}` : ''}
          </span>
        </div>

        {/* Meta grid */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {[
            { icon: <ShoppingCart size={11} />, label: 'Min. Order', val: formatINR(coupon.minOrderValue) },
            { icon: <Users size={11} />, label: 'Usage', val: coupon.usageLimit ? `${coupon.usedCount}/${coupon.usageLimit}` : `${coupon.usedCount} used` },
            { icon: <Calendar size={11} />, label: 'Valid From', val: formatDate(coupon.validFrom) },
            { icon: <Clock size={11} />, label: 'Expires', val: formatDate(coupon.validUntil) },
          ].map(({ icon, label, val }) => (
            <div key={label} className="bg-slate-50 rounded-lg p-1.5 px-2.5">
              <div className="flex items-center gap-1 text-slate-400 mb-0.5">
                {icon}
                <span className="text-[9px] uppercase tracking-widest font-bold">{label}</span>
              </div>
              <span className="text-[11px] font-bold text-slate-900">{val}</span>
            </div>
          ))}
        </div>

        {/* Usage progress */}
        {usagePct !== null && (
          <div className="mb-3">
            <div className="flex justify-between text-[9px] text-slate-400 mb-1">
              <span>Usage</span><span>{usagePct.toFixed(0)}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${usagePct}%`, background: usagePct > 80 ? '#f43f5e' : G }}
              />
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-1.5">
          <button
            onClick={() => onToggle(coupon._id)}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 border border-slate-200 rounded-xl bg-transparent text-[11px] font-bold cursor-pointer hover:bg-slate-50 transition-colors"
            style={{ color: coupon.isActive ? '#f59e0b' : G }}
          >
            {coupon.isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
            {coupon.isActive ? 'Disable' : 'Enable'}
          </button>
          <button
            onClick={() => onEdit(coupon)}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl bg-transparent text-[11px] font-bold cursor-pointer hover:bg-amber-50 transition-colors"
            style={{ border: `1px solid ${G}`, color: G }}
          >
            <Edit3 size={13} /> Edit
          </button>
          <button
            onClick={() => onDelete(coupon._id)}
            className="w-[34px] flex items-center justify-center py-1.5 border border-red-200 rounded-xl bg-transparent cursor-pointer text-rose-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Modal ── */
const inpCls = "w-full px-3 py-2 border border-slate-200 rounded-xl text-[13px] text-slate-900 outline-none bg-slate-50 box-border focus:border-[#85754E] focus:bg-white transition-colors";

const INIT = {
  code: '', description: '', discountType: 'percentage', discountValue: '',
  minOrderValue: '', maxDiscount: '', usageLimit: '', usagePerUser: '1',
  validFrom: new Date().toISOString().split('T')[0],
  validUntil: '', isActive: true,
  applicableCategories: [], applicableProducts: []
};

function CouponModal({ coupon, onClose, onSave }) {
  const isEdit = !!coupon;

  const [form, setForm] = useState(() => {
    if (!coupon) return { ...INIT };
    return {
      code: coupon.code ?? '',
      description: coupon.description ?? '',
      discountType: coupon.discountType ?? 'percentage',
      discountValue: coupon.discountValue != null ? String(coupon.discountValue) : '',
      minOrderValue: coupon.minOrderValue != null ? String(coupon.minOrderValue) : '',
      maxDiscount: coupon.maxDiscount != null ? String(coupon.maxDiscount) : '',
      usageLimit: coupon.usageLimit != null ? String(coupon.usageLimit) : '',
      usagePerUser: coupon.usagePerUser != null ? String(coupon.usagePerUser) : '1',
      validFrom: coupon.validFrom ? new Date(coupon.validFrom).toISOString().split('T')[0] : INIT.validFrom,
      validUntil: coupon.validUntil ? new Date(coupon.validUntil).toISOString().split('T')[0] : '',
      isActive: coupon.isActive !== undefined ? coupon.isActive : true,
      applicableCategories: coupon.applicableCategories ?? [],
      applicableProducts: coupon.applicableProducts ?? [],
    };
  });

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api.get('/categories').then(res => setCategories(res.data?.data || res.data || [])).catch(console.error);
    api.get('/products').then(res => setProducts(res.data?.data || res.data || [])).catch(console.error);
  }, []);

  const [saving, setSaving] = useState(false);
  const set = useCallback((k, v) => setForm(f => ({ ...f, [k]: v })), []);

  const handleSubmit = async () => {
    if (!form.code.trim()) return toast.error('Coupon code is required');
    if (!form.discountValue) return toast.error('Discount value is required');
    if (!form.validUntil) return toast.error('Expiry date is required');
    setSaving(true);
    try {
      await onSave({
        code: form.code.trim().toUpperCase(),
        description: form.description,
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        minOrderValue: form.minOrderValue !== '' ? Number(form.minOrderValue) : 0,
        maxDiscount: form.maxDiscount !== '' ? Number(form.maxDiscount) : null,
        usageLimit: form.usageLimit !== '' ? Number(form.usageLimit) : null,
        usagePerUser: form.usagePerUser !== '' ? Number(form.usagePerUser) : 1,
        validFrom: form.validFrom,
        validUntil: form.validUntil,
        isActive: form.isActive,
        applicableCategories: form.applicableCategories,
        applicableProducts: form.applicableProducts,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-[540px] max-h-[92vh] overflow-y-auto shadow-2xl">

        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10 rounded-t-2xl">
          <div>
            <h2 className="text-[15px] font-black text-slate-900 m-0">{isEdit ? 'Edit Coupon' : 'Create New Coupon'}</h2>
            <p className="text-[11px] text-slate-400 mt-0.5 mb-0">{isEdit ? `Editing ${coupon.code}` : 'Fill in the details below'}</p>
          </div>
          <button onClick={onClose} className="bg-slate-50 border border-slate-200 rounded-xl p-1.5 cursor-pointer flex items-center hover:bg-slate-100">
            <X size={16} className="text-slate-500" />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">
          {/* Code + Description */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Coupon Code" required>
              <input value={form.code} onChange={e => set('code', e.target.value.toUpperCase())}
                placeholder="SAVE20" className={inpCls} maxLength={20} />
            </Field>
            <Field label="Description">
              <input value={form.description} onChange={e => set('description', e.target.value)}
                placeholder="Summer sale…" className={inpCls} />
            </Field>
          </div>

          {/* Discount Type */}
          <Field label="Discount Type" required>
            <div className="flex gap-2">
              {[
                { val: 'percentage', icon: <Percent size={14} />, label: 'Percentage (%)' },
                { val: 'flat', icon: <DollarSign size={14} />, label: 'Flat Amount (₹)' },
              ].map(opt => (
                <button
                  key={opt.val}
                  onClick={() => set('discountType', opt.val)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all border-2 ${form.discountType === opt.val ? 'border-[#85754E] bg-amber-50 text-[#85754E]' : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'}`}
                >
                  {opt.icon}{opt.label}
                </button>
              ))}
            </div>
          </Field>

          {/* Discount value */}
          <div className="grid grid-cols-2 gap-3">
            <Field label={form.discountType === 'percentage' ? 'Discount %' : 'Discount Amount ₹'} required>
              <input type="number" value={form.discountValue} onChange={e => set('discountValue', e.target.value)}
                placeholder={form.discountType === 'percentage' ? '20' : '200'}
                min="0" max={form.discountType === 'percentage' ? 100 : undefined} className={inpCls} />
            </Field>
            {form.discountType === 'percentage' ? (
              <Field label="Max Discount ₹">
                <input type="number" value={form.maxDiscount} onChange={e => set('maxDiscount', e.target.value)}
                  placeholder="500 (optional)" min="0" className={inpCls} />
              </Field>
            ) : (
              <Field label="Min Order Value ₹">
                <input type="number" value={form.minOrderValue} onChange={e => set('minOrderValue', e.target.value)}
                  placeholder="0" min="0" className={inpCls} />
              </Field>
            )}
          </div>

          {/* Min order for percentage */}
          {form.discountType === 'percentage' && (
            <Field label="Min Order Value ₹">
              <input type="number" value={form.minOrderValue} onChange={e => set('minOrderValue', e.target.value)}
                placeholder="0" min="0" className={inpCls} />
            </Field>
          )}

          {/* Usage limits */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Total Usage Limit">
              <input type="number" value={form.usageLimit} onChange={e => set('usageLimit', e.target.value)}
                placeholder="Unlimited" min="1" className={inpCls} />
            </Field>
            <Field label="Per User Limit">
              <input type="number" value={form.usagePerUser} onChange={e => set('usagePerUser', e.target.value)}
                placeholder="1" min="1" className={inpCls} />
            </Field>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Valid From" required>
              <input type="date" value={form.validFrom} onChange={e => set('validFrom', e.target.value)} className={inpCls} />
            </Field>
            <Field label="Valid Until" required>
              <input type="date" value={form.validUntil} onChange={e => set('validUntil', e.target.value)}
                min={form.validFrom} className={inpCls} />
            </Field>
          </div>

          {/* Applicable Categories & Products */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Applicable Categories">
              <select 
                multiple 
                value={form.applicableCategories} 
                onChange={e => set('applicableCategories', Array.from(e.target.selectedOptions, option => option.value))}
                className={`${inpCls} h-24`}
              >
                {categories.map(c => <option key={c._id} value={c._id}>{c.name || c.title || c._id}</option>)}
              </select>
              <p className="text-[10px] text-slate-400 mt-1">Hold Ctrl/Cmd to select multiple. Leave empty for all.</p>
            </Field>
            <Field label="Applicable Products">
              <select 
                multiple 
                value={form.applicableProducts} 
                onChange={e => set('applicableProducts', Array.from(e.target.selectedOptions, option => option.value))}
                className={`${inpCls} h-24`}
              >
                {products.map(p => <option key={p._id} value={p._id}>{p.name || p.title || p._id}</option>)}
              </select>
              <p className="text-[10px] text-slate-400 mt-1">Hold Ctrl/Cmd to select multiple. Leave empty for all.</p>
            </Field>
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between px-3.5 py-3 bg-slate-50 rounded-xl">
            <div>
              <p className="text-xs font-bold text-slate-900 m-0">Active</p>
              <p className="text-[10px] text-slate-400 mt-0.5 m-0">Coupon can be used immediately when active</p>
            </div>
            <button
              onClick={() => set('isActive', !form.isActive)}
              className="w-11 h-6 rounded-full border-0 cursor-pointer relative transition-colors flex-shrink-0"
              style={{ background: form.isActive ? G : '#e2e8f0', width: '44px', height: '24px' }}
            >
              <span
                className="absolute top-0.5 w-[18px] h-[18px] rounded-full bg-white transition-all shadow-sm"
                style={{ left: form.isActive ? '23px' : '3px' }}
              />
            </button>
          </div>

          {/* Live preview */}
          {form.code && form.discountValue && (
            <div className="bg-amber-50 rounded-xl px-3.5 py-3 border border-dashed border-[#85754E]">
              <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">Preview</p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-sm font-black text-[#85754E]">{form.code}</span>
                <span className="text-xs text-slate-400">—</span>
                <span className="text-[13px] font-bold text-slate-900">
                  {form.discountType === 'percentage' ? `${form.discountValue}% off` : `₹${form.discountValue} off`}
                  {form.maxDiscount && form.discountType === 'percentage' ? ` (max ₹${form.maxDiscount})` : ''}
                  {form.minOrderValue && Number(form.minOrderValue) > 0 ? ` on orders above ₹${form.minOrderValue}` : ''}
                </span>
              </div>
              {form.validUntil && (
                <p className="text-[10px] text-slate-500 mt-1 mb-0">Valid until {formatDate(form.validUntil)}</p>
              )}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-3 border border-slate-200 rounded-xl bg-transparent text-xs cursor-pointer text-slate-500 font-bold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex-[2] py-3 border-0 rounded-xl text-white text-xs font-extrabold cursor-pointer flex items-center justify-center gap-1.5 transition-opacity disabled:opacity-70 disabled:cursor-not-allowed"
              style={{ background: G }}
            >
              {saving
                ? <><RefreshCw size={14} className="animate-spin" /> Saving…</>
                : <><CheckCircle size={14} /> {isEdit ? 'Save Changes' : 'Create Coupon'}</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function CouponManagement() {
  const [coupons, setCoupons] = useState([]);
  const [pagination, setPagination] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterActive, setFilterActive] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editCoupon, setEditCoupon] = useState(null);

  const fetchCoupons = useCallback(async (showSpinner = false) => {
    if (showSpinner) setIsLoading(true);
    else setIsFetching(true);
    try {
      const params = new URLSearchParams({ page, limit: 9 });
      if (search) params.append('search', search);
      if (filterType) params.append('discountType', filterType);
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

  const handleSave = async (form) => {
    try {
      if (editCoupon) {
        await apiFetch(`/${editCoupon._id}`, { method: 'PUT', body: form });
        toast.success('Coupon updated!');
      } else {
        await apiFetch('/', { method: 'POST', body: form });
        toast.success('Coupon created!');
      }
      setModalOpen(false);
      setEditCoupon(null);
      fetchCoupons();
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Failed to save coupon');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    try {
      await apiFetch(`/${id}`, { method: 'DELETE' });
      toast.success('Coupon deleted');
      fetchCoupons();
    } catch (err) { toast.error(err.message || 'Delete failed'); }
  };

  const handleToggle = async (id) => {
    try {
      const res = await apiFetch(`/${id}/toggle`, { method: 'PATCH' });
      toast.success(res.message || 'Status updated');
      fetchCoupons();
    } catch (err) { toast.error(err.message || 'Toggle failed'); }
  };

  const handleCopy = (code) => {
    navigator.clipboard?.writeText(code);
    toast.success(`Copied: ${code}`);
  };

  const openEdit = (coupon) => { setEditCoupon(coupon); setModalOpen(true); };
  const openCreate = () => { setEditCoupon(null); setModalOpen(true); };

  const activeCoupons = coupons.filter(c => c.isActive && !isExpired(c.validUntil)).length;
  const expiredCoupons = coupons.filter(c => isExpired(c.validUntil)).length;
  const totalUsed = coupons.reduce((a, c) => a + (c.usedCount || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 p-5 font-sans text-slate-800">
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-900 m-0">Coupon Management</h1>
          <p className="text-xs text-slate-400 mt-1 mb-0">Create and manage discount coupons for your store</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchCoupons()}
            className="p-2 bg-white border border-slate-200 rounded-xl cursor-pointer text-slate-500 leading-none hover:bg-slate-50 transition-colors"
          >
            <RefreshCw size={16} style={isFetching ? { animation: 'spin 0.8s linear infinite' } : {}} />
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 text-white border-0 rounded-xl px-4 py-2.5 text-xs font-bold cursor-pointer hover:opacity-90 transition-opacity"
            style={{ background: G }}
          >
            <Plus size={15} strokeWidth={3} /> Create Coupon
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Coupons', val: pagination.total ?? coupons.length, icon: Tag, color: '#85754E', sub: 'Catalog size', isFirst: true },
          { label: 'Active', val: activeCoupons, icon: CheckCircle, color: '#85754E', sub: 'Live now' },
          { label: 'Expired', val: expiredCoupons, icon: AlertCircle, color: '#f43f5e', sub: 'Past validity' },
          { label: 'Total Used', val: totalUsed, icon: Zap, color: '#f59e0b', sub: 'Redemption count' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={`rounded-2xl border p-5 shadow-sm transition-all hover:shadow-md flex flex-col justify-between h-full ${s.isFirst ? 'border-[#85754E] bg-heritage' : 'border-slate-100 bg-white'}`}>
              <div className="flex justify-between items-start mb-4">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.isFirst ? 'bg-white/20' : 'bg-slate-50 border border-slate-100'}`}
                >
                  <Icon size={20} style={{ color: s.isFirst ? '#ffffff' : '#85754E' }} />
                </div>
              </div>
              <div>
                <div className={`text-3xl font-black tracking-tight leading-none mb-1 ${s.isFirst ? 'text-white' : 'text-[#85754E]'}`}>
                  {isLoading ? '...' : s.val}
                </div>
                <div className={`text-[13px] font-black uppercase tracking-widest ${s.isFirst ? 'text-white/70' : 'text-[#85754E]/60'}`}>{s.label}</div>
                <div className={`text-[11px] font-bold mt-1 uppercase tracking-tight ${s.isFirst ? 'text-white/50' : 'text-[#85754E]/40'}`}>{s.sub}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2.5 mb-5 flex-wrap">
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 flex-1 min-w-[200px]">
          <Search size={14} className="text-slate-400" />
          <input
            type="text" value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search coupon codes…"
            className="border-0 outline-none text-xs w-full bg-transparent text-slate-900"
          />
        </div>
        <select
          value={filterType}
          onChange={e => { setFilterType(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-500 outline-none cursor-pointer"
        >
          <option value="">All Types</option>
          <option value="percentage">Percentage</option>
          <option value="flat">Flat Amount</option>
        </select>
        <select
          value={filterActive}
          onChange={e => { setFilterActive(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-500 outline-none cursor-pointer"
        >
          <option value="">All Status</option>
          <option value="true">Active Only</option>
          <option value="false">Inactive Only</option>
        </select>
        {(search || filterType || filterActive) && (
          <button
            onClick={() => { setSearch(''); setFilterType(''); setFilterActive(''); setPage(1); }}
            className="flex items-center gap-1 px-3 py-2 border border-red-200 rounded-xl bg-transparent text-[11px] text-rose-500 cursor-pointer font-semibold hover:bg-red-50"
          >
            <X size={12} /> Clear
          </button>
        )}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-11 h-11 border-4 border-amber-50 border-t-[#85754E] rounded-full" style={{ animation: 'spin 0.8s linear infinite' }} />
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Loading coupons…</span>
        </div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-20">
          <Tag size={48} className="text-slate-200 block mx-auto mb-4" />
          <p className="text-sm font-bold text-slate-400">No coupons found</p>
          <p className="text-xs text-slate-300 mb-5">Create your first coupon to get started</p>
          <button onClick={openCreate} className="px-6 py-2.5 text-white border-0 rounded-xl text-xs font-bold cursor-pointer hover:opacity-90" style={{ background: G }}>
            Create Coupon
          </button>
        </div>
      ) : (
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {coupons.map(coupon => (
            <CouponCard key={coupon._id} coupon={coupon} onEdit={openEdit} onDelete={handleDelete} onToggle={handleToggle} onCopy={handleCopy} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-5 border-t border-slate-200">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="flex items-center gap-1 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
            style={{ color: G }}
          >
            <ChevronLeft size={14} /> Prev
          </button>
          <span className="text-xs text-slate-500">Page {page} of {pagination.pages}</span>
          <button
            disabled={page === pagination.pages}
            onClick={() => setPage(p => p + 1)}
            className="flex items-center gap-1 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
            style={{ color: G }}
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}

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
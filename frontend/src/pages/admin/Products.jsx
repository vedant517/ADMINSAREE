import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Plus, Search, Filter, Edit, Trash2,
  AlertCircle, CheckCircle2, ChevronDown, MoreHorizontal, Package,
} from 'lucide-react';
import {
  fetchProducts, deleteProduct,
  clearProductError, clearSuccessMessage,
} from '../../features/products/productSlice';
import { fetchCategories } from '../../features/products/categorySlice';
import { useNavigate } from 'react-router-dom';
import { formatINR } from '../../utils/currency';

const Products = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: products, loading, error, successMessage } = useSelector((s) => s.products);
  const { categories = [] } = useSelector((s) => s.categories || {});

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All Stock');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (successMessage) {
      const t = setTimeout(() => dispatch(clearSuccessMessage()), 3000);
      return () => clearTimeout(t);
    }
  }, [successMessage, dispatch]);

  const handleDelete = (id) => {
    dispatch(deleteProduct(id));
    setDeleteConfirm(null);
  };

  const filtered = (products || []).filter((p) => {
    const matchesSearch = (p?.name || '').toLowerCase().includes((search || '').toLowerCase());
    if (!matchesSearch) return false;
    if (filterType === 'Low Inventory') return (p.stock || 0) > 0 && (p.stock || 0) <= 10;
    if (filterType === 'Out of Stock') return (p.stock || 0) === 0;
    return true;
  });

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }

        .products-wrapper {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 24px;
          padding: 24px;
        }

        /* ── Header ── */
        .products-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
        }
        .products-header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .products-header-right {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .products-search-wrap {
          position: relative;
        }
        .products-search-wrap svg {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          color: #94a3b8;
        }
        .products-search-input {
          padding: 12px 16px 12px 42px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          font-size: 14px;
          font-weight: 500;
          outline: none;
          width: 240px;
        }

        /* ── Table toolbar ── */
        .products-toolbar {
          padding: 20px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
          border-bottom: 1px solid #f8fafc;
          background: rgba(248,250,252,0.5);
        }
        .products-tabs {
          display: flex;
          gap: 4px;
          background: #f1f5f9;
          padding: 4px;
          border-radius: 14px;
          flex-wrap: wrap;
        }

        /* ── Pagination footer ── */
        .products-footer {
          padding: 20px 24px;
          background: rgba(248,250,252,0.5);
          border-top: 1px solid #f8fafc;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
        }

        /* ── Responsive breakpoints ── */
        @media (max-width: 768px) {
          .products-wrapper {
            padding: 16px;
            gap: 16px;
          }
          .products-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .products-header-right {
            width: 100%;
          }
          .products-search-input {
            width: 100%;
          }
          .products-search-wrap {
            width: 100%;
          }
          .products-toolbar {
            padding: 16px;
          }
          .products-tabs {
            width: 100%;
          }
          .products-footer {
            flex-direction: column;
            align-items: flex-start;
            padding: 16px;
          }
          /* Hide less important table columns on mobile */
          .col-taxonomy { display: none; }
          .col-availability-label { display: none; }
        }

        @media (max-width: 480px) {
          .products-header-right {
            flex-direction: column;
            align-items: stretch;
          }
          .products-header-right button {
            justify-content: center;
          }
          /* On very small screens also collapse price column */
          .col-price { display: none; }
        }
      `}</style>

      <div className="products-wrapper">

        {/* Header */}
        <div className="products-header">
          <div className="products-header-left">
            <div style={{ width: '48px', height: '48px', background: '#10b981', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Package size={24} color="white" />
            </div>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>Products Catalog</h1>
              <p style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: '4px', marginBottom: 0 }}>
                Currently Managing {filtered.length} Unique Items
              </p>
            </div>
          </div>

          <div className="products-header-right">
            <div className="products-search-wrap">
              <Search size={16} color="#94a3b8" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Deep catalog search..."
                className="products-search-input"
              />
            </div>
            <button
              onClick={() => navigate('/add-product')}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#10b981', color: 'white', padding: '12px 20px', borderRadius: '14px', border: 'none', fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              <Plus size={18} strokeWidth={3} /> Add Product
            </button>
          </div>
        </div>

        {/* Table Card */}
        <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>

          {/* Toolbar */}
          <div className="products-toolbar">
            <div className="products-tabs">
              {['All Stock', 'Low Inventory', 'Out of Stock'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilterType(tab)}
                  style={{ padding: '8px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: filterType === tab ? 800 : 600, border: 'none', cursor: 'pointer', transition: 'all 0.15s', background: filterType === tab ? 'white' : 'transparent', color: filterType === tab ? '#10b981' : '#64748b', boxShadow: filterType === tab ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', whiteSpace: 'nowrap' }}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[Filter, MoreHorizontal].map((Icon, i) => (
                <button key={i} style={{ padding: '10px', background: 'white', border: '1px solid #f1f5f9', borderRadius: '12px', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={18} />
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '480px' }}>
              <thead>
                <tr style={{ background: '#fafafa', borderBottom: '1px solid #f1f5f9' }}>
                  <th style={{ padding: '16px 20px', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.12em', textAlign: 'left', whiteSpace: 'nowrap' }}>
                    Product Details
                  </th>
                  <th className="col-taxonomy" style={{ padding: '16px 20px', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.12em', textAlign: 'left', whiteSpace: 'nowrap' }}>
                    Taxonomy
                  </th>
                  <th className="col-price" style={{ padding: '16px 20px', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.12em', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    Price Points
                  </th>
                  <th style={{ padding: '16px 20px', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.12em', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    Availability
                  </th>
                  <th style={{ padding: '16px 20px', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.12em', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading && filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '60px', textAlign: 'center' }}>
                      <div style={{ width: '44px', height: '44px', border: '4px solid #d1fae5', borderTopColor: '#10b981', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Syncing Catalog...</span>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '60px', textAlign: 'center' }}>
                      <div style={{ width: '64px', height: '64px', background: '#f1f5f9', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                        <Package size={30} color="#94a3b8" />
                      </div>
                      <p style={{ fontSize: '11px', fontWeight: 800, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.1em' }}>No products matched your parameters</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((product) => (
                    <tr
                      key={product._id}
                      style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.1s' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#fafafa'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <div style={{ width: '56px', height: '56px', background: '#f8fafc', borderRadius: '16px', overflow: 'hidden', border: '1px solid #f1f5f9', flexShrink: 0 }}>
                            <img
                              src={product?.image && product.image.startsWith('http') ? product.image : `https://ui-avatars.com/api/?name=${encodeURIComponent(product?.name || 'Item')}&background=10b981&color=fff&bold=true`}
                              onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(product?.name || 'Item')}&background=10b981&color=fff&bold=true`; }}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              alt={product?.name}
                            />
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <h4 style={{ fontSize: '14px', fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '-0.01em', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>
                              {product?.name || 'Unknown Item'}
                            </h4>
                            <p style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 0 }}>
                              UID: {product?._id ? product._id.slice(-6) : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="col-taxonomy" style={{ padding: '16px 20px' }}>
                        <div>
                          <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#1e293b' }}>{product.mainCategory || 'General'}</div>
                          <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', marginTop: '3px', textTransform: 'uppercase' }}>
                            {product.categories?.join(', ') || 'Unassigned'}
                          </div>
                        </div>
                      </td>

                      <td className="col-price" style={{ padding: '16px 20px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          {product.discountPrice && product.discountPrice > 0 ? (
                            <>
                              <span style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>{formatINR(product.discountPrice)}</span>
                              <span style={{ fontSize: '12px', fontWeight: 500, color: '#94a3b8', textDecoration: 'line-through' }}>{formatINR(product.price)}</span>
                            </>
                          ) : (
                            <span style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>{formatINR(product.price)}</span>
                          )}
                        </div>
                      </td>

                      <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-block', padding: '5px 14px', borderRadius: '999px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em',
                          background: product.stock > 10 ? '#f0fdf4' : product.stock > 0 ? '#fffbeb' : '#fff1f2',
                          color: product.stock > 10 ? '#059669' : product.stock > 0 ? '#d97706' : '#e11d48',
                        }}>
                          {product.stock > 0 ? 'Available' : 'Depleted'}
                        </span>
                        <div style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', marginTop: '4px', textTransform: 'uppercase' }}>{product.stock} units</div>
                      </td>

                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <button
                            onClick={() => navigate(`/edit-product/${product._id}`)}
                            style={{ padding: '8px', background: 'white', border: '1px solid #f1f5f9', borderRadius: '10px', color: '#94a3b8', cursor: 'pointer', display: 'flex', transition: 'all 0.15s' }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.color = '#3b82f6'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#94a3b8'; }}
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(product._id)}
                            style={{ padding: '8px', background: 'white', border: '1px solid #f1f5f9', borderRadius: '10px', color: '#94a3b8', cursor: 'pointer', display: 'flex', transition: 'all 0.15s' }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = '#fff1f2'; e.currentTarget.style.color = '#e11d48'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#94a3b8'; }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="products-footer">
            <p style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#94a3b8', margin: 0 }}>
              Records <span style={{ color: '#0f172a' }}>1 - {filtered.length}</span> of {(products || []).length} entries
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button style={{ padding: '8px 18px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8', cursor: 'not-allowed', opacity: 0.5 }}>Previous</button>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#10b981', color: 'white', border: 'none', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}>1</button>
                <button style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'white', border: '1px solid #f1f5f9', color: '#94a3b8', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>2</button>
              </div>
              <button style={{ padding: '8px 18px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#475569', cursor: 'pointer' }}>Next</button>
            </div>
          </div>
        </div>

        {/* Delete Confirm Modal */}
        {deleteConfirm && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(8px)' }}>
            <div style={{ background: 'white', padding: '40px', borderRadius: '28px', boxShadow: '0 32px 80px rgba(0,0,0,0.2)', maxWidth: '360px', width: '100%', textAlign: 'center' }}>
              <div style={{ width: '72px', height: '72px', background: '#fff1f2', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <AlertCircle size={36} color="#e11d48" />
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '-0.01em', margin: 0 }}>Purge Product?</h3>
              <p style={{ fontSize: '14px', color: '#64748b', marginTop: '12px', lineHeight: 1.5 }}>This record will be permanently deleted from the primary database cluster.</p>
              <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  style={{ flex: 1, padding: '14px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '16px', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  style={{ flex: 1, padding: '14px', background: '#e11d48', color: 'white', border: 'none', borderRadius: '16px', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', cursor: 'pointer' }}
                >
                  Confirm Purge
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Toast */}
        {successMessage && (
          <div style={{ position: 'fixed', bottom: '32px', right: '32px', zIndex: 1000, background: '#10b981', color: 'white', padding: '16px 24px', borderRadius: '16px', boxShadow: '0 8px 24px rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CheckCircle2 size={22} />
            <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{successMessage}</span>
          </div>
        )}
      </div>
    </>
  );
};

export default Products;
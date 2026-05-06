import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowUpRight,
  ChevronDown,
  Filter,
  MoreHorizontal,
  Package,
  Search,
  Star,
} from 'lucide-react';
import api from '../../services/api';
import { fetchProducts } from '../../features/products/productSlice';
import { formatINR } from '../../utils/currency';

const ratingTabs = [
  { label: 'All Ratings', value: 'all' },
  { label: '5 Star', value: '5' },
  { label: '4 Star', value: '4' },
  { label: '3 & Below', value: '3-below' },
];

const scoreTone = (rating) => {
  if (rating >= 4.5) return { bg: '#f0fdf4', text: '#15803d', dot: '#22c55e', label: 'Excellent' };
  if (rating >= 4)   return { bg: '#f0f9ff', text: '#0369a1', dot: '#38bdf8', label: 'Strong' };
  if (rating >= 3)   return { bg: '#fffbeb', text: '#b45309', dot: '#f59e0b', label: 'Mixed' };
  return               { bg: '#fff1f2', text: '#be123c', dot: '#f43f5e', label: 'Needs Attention' };
};

/* ── Stat Card ── */
function StatCard({ title, value, sub }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: '24px',
      border: '1px solid #f1f5f9',
      boxShadow: '0 4px 20px rgba(148,163,184,0.10)',
      padding: '24px',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.22em', color: '#94a3b8', margin: 0 }}>{title}</p>
          <div style={{ marginTop: '12px', fontSize: '30px', fontWeight: 900, letterSpacing: '-0.02em', color: '#0f172a', lineHeight: 1 }}>{value}</div>
          <p style={{ marginTop: '6px', fontSize: '12px', fontWeight: 500, color: '#94a3b8' }}>{sub}</p>
        </div>
        <div style={{ width: '44px', height: '44px', borderRadius: '16px', background: '#0f172a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <ArrowUpRight size={18} />
        </div>
      </div>
    </div>
  );
}

/* ── Rating Stars ── */
function RatingStars({ rating }) {
  const rounded = Math.round(Number(rating) || 0);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
      {Array.from({ length: 5 }).map((_, index) => {
        const active = index < rounded;
        return (
          <Star
            key={index}
            size={13}
            style={{ color: active ? '#fbbf24' : '#e2e8f0', fill: active ? '#fbbf24' : 'none' }}
            strokeWidth={1.8}
          />
        );
      })}
    </div>
  );
}

/* ── Mobile Review Card ── */
function MobileReviewCard({ review, navigate }) {
  const tone = scoreTone(review.rating);
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #f1f5f9',
      borderRadius: '20px',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    }}>
      {/* Product row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '52px', height: '52px', borderRadius: '14px', border: '1px solid #f1f5f9', overflow: 'hidden', background: '#fff', padding: '4px', flexShrink: 0, boxSizing: 'border-box' }}>
          <img
            src={review.productImage}
            alt={review.productName}
            onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(review.productName)}&background=10b981&color=fff&bold=true`; }}
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }}
          />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: '13px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.01em', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {review.productName}
          </div>
          <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', marginTop: '2px' }}>
            {review.mainCategory}
          </div>
        </div>
      </div>

      {/* Score + reviewer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a' }}>{review.reviewerName}</div>
          <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600 }}>Ref: {String(review.reviewerId).slice(-8)}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '4px 10px', borderRadius: '999px',
            background: tone.bg, color: tone.text,
            fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em',
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: tone.dot }} />
            {tone.label}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <RatingStars rating={review.rating} />
            <span style={{ fontSize: '13px', fontWeight: 900, color: '#0f172a' }}>{review.rating.toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* Feedback */}
      <p style={{ fontSize: '13px', fontWeight: 500, color: '#475569', lineHeight: 1.6, margin: 0 }}>
        {review.comment}
      </p>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', paddingTop: '8px', borderTop: '1px solid #f8fafc' }}>
        <div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Package size={12} color="#10b981" /> {formatINR(review.productPrice)}
          </div>
          <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>
            Avg: {review.averageRating ? review.averageRating.toFixed(1) : '0.0'} / 5 · {review.productReviewCount} reviews
          </div>
        </div>
        <button
          onClick={() => navigate(`/edit-product/${review.productId}`)}
          style={{
            padding: '8px 16px', borderRadius: '12px',
            background: '#0f172a', color: '#fff',
            fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.12em',
            border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
          }}
        >
          View Product
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════ */
export default function ProductReviews() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: products = [], loading: productsLoading } = useSelector((state) => state.products);

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeRating, setActiveRating] = useState('all');
  const [sortBy, setSortBy] = useState('rating_desc');

  useEffect(() => {
    dispatch(fetchProducts());
    fetchAllReviews();
  }, [dispatch]);

  const fetchAllReviews = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/reviews');
      setReviews(data.data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  // ── Logic untouched ──
  const reviewRows = useMemo(() => {
    const standaloneReviews = (reviews || []).map((review) => ({
      id: review._id,
      reviewId: review._id,
      productId: review.product?._id || 'unknown',
      productName: review.product?.name || 'Untitled Product',
      productImage:
        review.product?.image && review.product.image.startsWith('http')
          ? review.product.image
          : review.product?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.product?.name || 'Item')}&background=10b981&color=fff&bold=true`,
      productPrice: review.product?.price || 0,
      mainCategory: review.product?.mainCategory || 'Uncategorized',
      categories: review.product?.categories || [],
      averageRating: Number(review.product?.ratings || 0),
      productReviewCount: Number(review.product?.numOfReviews || 0),
      reviewerName: review.user?.name || 'Anonymous Buyer',
      reviewerId: review.user?._id || 'Guest',
      rating: Number(review.rating || 0),
      comment: review.comment || 'No written feedback submitted.',
      catalogDate: review.createdAt ? new Date(review.createdAt) : null,
      source: 'collection',
    }));

    const legacyReviews = (products || []).flatMap((product) => {
      const pReviews = Array.isArray(product.reviews) ? product.reviews : [];
      return pReviews
        .filter(pr => !standaloneReviews.some(sr => sr.reviewerId === pr.user && sr.productId === product._id))
        .map((review, index) => ({
          id: `legacy-${product._id}-${review.user || index}`,
          reviewId: review.user || `${product._id}-${index + 1}`,
          productId: product._id,
          productName: product.name || 'Untitled Product',
          productImage:
            product.image && product.image.startsWith('http')
              ? product.image
              : product.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name || 'Item')}&background=10b981&color=fff&bold=true`,
          productPrice: product.price || 0,
          mainCategory: product.mainCategory || 'Uncategorized',
          categories: product.categories || [],
          averageRating: Number(product.ratings || 0),
          productReviewCount: Number(product.numOfReviews || pReviews.length || 0),
          reviewerName: review.name || 'Anonymous Buyer',
          reviewerId: review.user || 'Guest',
          rating: Number(review.rating || 0),
          comment: review.comment || 'No written feedback submitted.',
          catalogDate: product.createdAt ? new Date(product.createdAt) : null,
          source: 'legacy',
        }));
    });

    return [...standaloneReviews, ...legacyReviews].sort((a, b) => {
      if (sortBy === 'rating_asc') return a.rating - b.rating;
      if (sortBy === 'product_name') return a.productName.localeCompare(b.productName);
      return (b.catalogDate || 0) - (a.catalogDate || 0) || b.rating - a.rating;
    });
  }, [reviews, products, sortBy]);

  const filteredReviews = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return reviewRows.filter((review) => {
      const matchesSearch =
        !query ||
        review.productName.toLowerCase().includes(query) ||
        review.reviewerName.toLowerCase().includes(query) ||
        review.comment.toLowerCase().includes(query) ||
        review.mainCategory.toLowerCase().includes(query) ||
        review.categories.some(c => c.toLowerCase().includes(query));
      const matchesRating =
        activeRating === 'all' ||
        (activeRating === '3-below' ? review.rating <= 3 : review.rating === Number(activeRating));
      return matchesSearch && matchesRating;
    });
  }, [activeRating, reviewRows, searchQuery]);

  const stats = useMemo(() => {
    const totalReviews = reviewRows.length;
    const averageRating = totalReviews
      ? reviewRows.reduce((sum, review) => sum + review.rating, 0) / totalReviews
      : 0;
    const uniqueReviewedProductIds = new Set(reviewRows.map(r => r.productId));
    const reviewedProducts = uniqueReviewedProductIds.size;
    const lowRated = reviewRows.filter((review) => review.rating <= 3).length;
    return { totalReviews, averageRating, reviewedProducts, lowRated };
  }, [products, reviewRows]);

  return (
    <>
      <style>{`
        /* ── Base ── */
        .pr-root {
          min-height: 100vh;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 28px;
          box-sizing: border-box;
        }
        @media (min-width: 1024px) { .pr-root { padding: 40px; } }

        /* ── Header ── */
        .pr-header {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        @media (min-width: 1024px) {
          .pr-header {
            flex-direction: row;
            align-items: flex-end;
            justify-content: space-between;
          }
        }

        .pr-header-controls {
          display: flex;
          flex-direction: column;
          gap: 10px;
          width: 100%;
        }
        @media (min-width: 640px) {
          .pr-header-controls { flex-direction: row; }
        }
        @media (min-width: 1024px) {
          .pr-header-controls { width: auto; }
        }

        .pr-search-input {
          width: 100%;
          padding: 14px 16px 14px 42px;
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          font-size: 14px;
          font-weight: 500;
          color: #334155;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .pr-search-input:focus { border-color: #10b981; box-shadow: 0 0 0 4px rgba(16,185,129,0.08); }
        @media (min-width: 640px) { .pr-search-input { width: 300px; } }

        .pr-sort-select {
          width: 100%;
          appearance: none;
          padding: 14px 40px 14px 40px;
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          font-size: 14px;
          font-weight: 600;
          color: #334155;
          outline: none;
          cursor: pointer;
          box-sizing: border-box;
          transition: border-color 0.2s;
        }
        .pr-sort-select:focus { border-color: #10b981; box-shadow: 0 0 0 4px rgba(16,185,129,0.08); }
        @media (min-width: 640px) { .pr-sort-select { width: 200px; } }

        /* ── Stats grid ── */
        .pr-stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }
        @media (min-width: 900px) {
          .pr-stats-grid { grid-template-columns: repeat(4, 1fr); }
        }

        /* ── Table card ── */
        .pr-table-card {
          background: #fff;
          border-radius: 28px;
          border: 1px solid #f1f5f9;
          box-shadow: 0 8px 30px rgba(148,163,184,0.12);
          overflow: hidden;
        }

        /* ── Tab bar ── */
        .pr-tabs-bar {
          padding: 20px 24px 16px;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        @media (min-width: 768px) {
          .pr-tabs-bar {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }
        }

        .pr-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        /* ── Desktop table — scrollable wrapper ── */
        .pr-desktop-table {
          display: none;
        }
        @media (min-width: 768px) {
          .pr-desktop-table { display: block; overflow-x: auto; }
        }

        /* ── Mobile cards ── */
        .pr-mobile-cards {
          display: flex;
          flex-direction: column;
          gap: 14px;
          padding: 20px;
        }
        @media (min-width: 768px) {
          .pr-mobile-cards { display: none; }
        }

        /* ── Spin animation ── */
        @keyframes pr-spin { to { transform: rotate(360deg); } }
        .pr-spinner {
          width: 44px; height: 44px;
          border: 4px solid #d1fae5;
          border-top-color: #10b981;
          border-radius: 50%;
          animation: pr-spin 0.8s linear infinite;
        }

        /* ── Table cells ── */
        .pr-th {
          padding: 16px 20px;
          font-size: 10px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: #94a3b8;
          background: rgba(248,250,252,0.7);
          border-bottom: 1px solid #f1f5f9;
          white-space: nowrap;
          text-align: left;
        }
        .pr-th-right { text-align: right; }

        .pr-td { padding: 18px 20px; vertical-align: top; }

        .pr-tr {
          border-bottom: 1px solid #f8fafc;
          cursor: default;
          transition: background 0.12s;
        }
        .pr-tr:hover { background: #fafafa; }
      `}</style>

      <div className="pr-root">

        {/* ── Header ── */}
        <div className="pr-header">
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-0.02em', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
              <Star style={{ color: '#fbbf24', fill: '#fbbf24' }} size={32} />
              Product Reviews
            </h1>
            <p style={{ marginTop: '8px', marginLeft: '44px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.22em', color: '#94a3b8' }}>
              Centralized feedback intelligence across your catalog
            </p>
          </div>

          <div className="pr-header-controls">
            {/* Search */}
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, buyers, feedback..."
                className="pr-search-input"
              />
            </div>

            {/* Sort */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <Filter size={14} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="pr-sort-select"
              >
                <option value="rating_desc">Top Rated First</option>
                <option value="rating_asc">Lowest Rated First</option>
                <option value="product_name">Product Name</option>
              </select>
              <ChevronDown size={14} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
            </div>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div className="pr-stats-grid">
          <StatCard title="Total Reviews" value={stats.totalReviews.toLocaleString('en-IN')} sub="Written ratings collected" />
          <StatCard title="Average Score" value={stats.totalReviews ? stats.averageRating.toFixed(1) : '0.0'} sub="Mean customer satisfaction" />
          <StatCard title="Reviewed Products" value={stats.reviewedProducts.toLocaleString('en-IN')} sub="Catalog entries with feedback" />
          <StatCard title="Attention Needed" value={stats.lowRated.toLocaleString('en-IN')} sub="Reviews rated 3 stars or below" />
        </div>

        {/* ── Table Card ── */}
        <div className="pr-table-card">

          {/* Tab bar */}
          <div className="pr-tabs-bar">
            <div className="pr-tabs">
              {ratingTabs.map((tab) => {
                const active = activeRating === tab.value;
                return (
                  <button
                    key={tab.value}
                    onClick={() => setActiveRating(tab.value)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '999px',
                      fontSize: '10px', fontWeight: 900,
                      textTransform: 'uppercase', letterSpacing: '0.14em',
                      cursor: 'pointer', border: 'none',
                      transition: 'all 0.15s',
                      background: active ? '#0f172a' : '#f8fafc',
                      color: active ? '#fff' : '#94a3b8',
                      boxShadow: active ? '0 4px 12px rgba(15,23,42,0.15)' : 'none',
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 600, color: '#94a3b8', flexShrink: 0 }}>
              <span>{filteredReviews.length.toLocaleString('en-IN')} reviews visible</span>
              <MoreHorizontal size={16} />
            </div>
          </div>

          {/* Loading */}
          {loading && reviewRows.length === 0 ? (
            <div style={{ padding: '80px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
              <div className="pr-spinner" />
              <p style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#94a3b8' }}>Loading review matrix</p>
            </div>

          ) : filteredReviews.length === 0 ? (
            <div style={{ padding: '80px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '22px', background: '#f8fafc', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertCircle size={32} style={{ color: '#cbd5e1' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', margin: 0 }}>No reviews found</h3>
                <p style={{ marginTop: '8px', fontSize: '14px', color: '#94a3b8', maxWidth: '380px' }}>
                  Customer feedback will appear here once shoppers submit ratings and comments for your products.
                </p>
              </div>
              <button
                onClick={() => navigate('/products')}
                style={{ padding: '12px 24px', borderRadius: '16px', background: '#0f172a', color: '#fff', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.16em', border: 'none', cursor: 'pointer' }}
              >
                Open Product List
              </button>
            </div>

          ) : (
            <>
              {/* ── Desktop Table ── */}
              <div className="pr-desktop-table">
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
                  <thead>
                    <tr>
                      {['Product', 'Reviewer', 'Score', 'Feedback', 'Catalog Info', ''].map((col, i) => (
                        <th key={i} className={`pr-th ${i === 5 ? 'pr-th-right' : ''}`}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReviews.map((review) => {
                      const tone = scoreTone(review.rating);
                      return (
                        <tr key={review.id} className="pr-tr">

                          {/* Product */}
                          <td className="pr-td" style={{ minWidth: '220px', maxWidth: '260px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                              <div style={{ width: '52px', height: '52px', borderRadius: '16px', border: '1px solid #f1f5f9', overflow: 'hidden', background: '#fff', padding: '4px', flexShrink: 0, boxSizing: 'border-box' }}>
                                <img
                                  src={review.productImage}
                                  alt={review.productName}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }}
                                  onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(review.productName)}&background=10b981&color=fff&bold=true`; }}
                                />
                              </div>
                              <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.01em', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {review.productName}
                                </div>
                                <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', marginTop: '3px' }}>
                                  {review.mainCategory}
                                  {review.categories?.length > 0 && ` · ${review.categories.join(', ')}`}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Reviewer */}
                          <td className="pr-td" style={{ minWidth: '150px' }}>
                            <div style={{ fontSize: '13px', fontWeight: 900, color: '#0f172a' }}>{review.reviewerName}</div>
                            <div style={{ fontSize: '10px', fontWeight: 600, color: '#94a3b8', marginTop: '3px' }}>Ref: {String(review.reviewerId).slice(-8)}</div>
                          </td>

                          {/* Score */}
                          <td className="pr-td" style={{ minWidth: '150px' }}>
                            <div style={{
                              display: 'inline-flex', alignItems: 'center', gap: '6px',
                              padding: '5px 12px', borderRadius: '999px',
                              background: tone.bg, color: tone.text,
                              fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.12em',
                            }}>
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: tone.dot, flexShrink: 0 }} />
                              {tone.label}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                              <RatingStars rating={review.rating} />
                              <span style={{ fontSize: '13px', fontWeight: 900, color: '#0f172a' }}>{review.rating.toFixed(1)}</span>
                            </div>
                          </td>

                          {/* Feedback */}
                          <td className="pr-td" style={{ minWidth: '240px', maxWidth: '300px' }}>
                            <p style={{ fontSize: '13px', fontWeight: 500, color: '#475569', lineHeight: 1.6, margin: 0 }}>
                              {review.comment}
                            </p>
                          </td>

                          {/* Catalog Info */}
                          <td className="pr-td" style={{ minWidth: '150px' }}>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <Package size={13} style={{ color: '#10b981' }} />
                              {formatINR(review.productPrice)}
                            </div>
                            <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600, marginTop: '5px' }}>
                              Avg: {review.averageRating ? review.averageRating.toFixed(1) : '0.0'} / 5
                            </div>
                            <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600, marginTop: '2px' }}>
                              Total: {review.productReviewCount.toLocaleString('en-IN')} reviews
                            </div>
                          </td>

                          {/* Action */}
                          <td className="pr-td" style={{ textAlign: 'right', minWidth: '130px' }}>
                            <button
                              onClick={() => navigate(`/edit-product/${review.productId}`)}
                              style={{
                                padding: '9px 18px', borderRadius: '14px',
                                background: '#0f172a', color: '#fff',
                                fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.12em',
                                border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                                transition: 'background 0.15s',
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = '#1e293b'}
                              onMouseLeave={(e) => e.currentTarget.style.background = '#0f172a'}
                            >
                              View Product
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* ── Mobile Cards ── */}
              <div className="pr-mobile-cards">
                {filteredReviews.map((review) => (
                  <MobileReviewCard key={review.id} review={review} navigate={navigate} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
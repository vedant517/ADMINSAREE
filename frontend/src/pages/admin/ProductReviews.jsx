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
  MessageSquare,
  BarChart,
  Activity
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
  return { bg: 'bg-slate-50', text: 'text-slate-600', dot: 'bg-slate-400', label: rating >= 4.5 ? 'Excellent' : rating >= 4 ? 'Strong' : rating >= 3 ? 'Mixed' : 'Needs Attention' };
};

/* ── Stat Card ── */
function StatCard({ title, value, sub, isFirst, icon: Icon, color }) {
  const accent = isFirst ? '#ffffff' : '#85754E';
  return (
    <div className={`rounded-2xl border border-slate-100 p-5 shadow-sm transition-all hover:shadow-md flex flex-col justify-between h-full ${isFirst ? 'bg-heritage' : 'bg-white'}`}>
      <div className="flex justify-between items-start mb-4">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isFirst ? 'bg-white/20' : 'bg-slate-50 border border-slate-100'}`}
        >
          {Icon ? <Icon size={20} style={{ color: accent }} /> : <ArrowUpRight size={18} style={{ color: accent }} />}
        </div>
      </div>
      <div>
        <div className={`text-2xl font-black tracking-tight leading-none mb-1 ${isFirst ? 'text-white' : 'text-heritage'}`}>{value}</div>
        <div className={`text-[12px] font-black uppercase tracking-widest ${isFirst ? 'text-white/70' : 'text-heritage/60'}`}>{title}</div>
        {sub && <p className={`mt-1 text-[11px] font-bold uppercase tracking-tight m-0 ${isFirst ? 'text-white/60' : 'text-slate-400'}`}>{sub}</p>}
      </div>
    </div>
  );
}

/* ── Rating Stars ── */
function RatingStars({ rating }) {
  const rounded = Math.round(Number(rating) || 0);
  return (
    <div className="flex items-center gap-0.5">
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
    <div className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col gap-3.5 shadow-sm">
      {/* Product row */}
      <div className="flex items-center gap-3">
        <div className="w-13 h-13 rounded-2xl border border-slate-100 overflow-hidden bg-white p-1 shrink-0 box-border" style={{ width: '52px', height: '52px' }}>
          <img
            src={review.productImage}
            alt={review.productName}
            onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(review.productName)}&background=938359&color=fff&bold=true`; }}
            className="w-full h-full object-cover rounded-xl"
          />
        </div>
        <div className="min-w-0">
          <div className="text-[13px] font-black uppercase tracking-tight text-slate-900 overflow-hidden text-ellipsis whitespace-nowrap">
            {review.productName}
          </div>
          <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 mt-0.5">
            {review.mainCategory}
          </div>
        </div>
      </div>

      {/* Score + reviewer */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <div className="text-xs font-extrabold text-slate-900">{review.reviewerName}</div>
          <div className="text-[10px] text-slate-400 font-semibold">Ref: {String(review.reviewerId).slice(-8)}</div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${tone.bg} ${tone.text} text-[10px] font-black uppercase tracking-[0.1em]`}>
            <span className={`w-1.5 h-1.5 rounded-full ${tone.dot}`} />
            {tone.label}
          </div>
          <div className="flex items-center gap-1.5">
            <RatingStars rating={review.rating} />
            <span className="text-[13px] font-black text-slate-900">{review.rating.toFixed(1)}</span>
          </div>
        </div>
      </div>

      <p className="text-[13px] font-medium text-slate-500 leading-relaxed m-0">{review.comment}</p>

      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-50">
        <div>
          <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
            <Package size={12} className="text-[#85754E]" /> {formatINR(review.productPrice)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Avg: {review.averageRating ? review.averageRating.toFixed(1) : '0.0'} / 5 · {review.productReviewCount} reviews
          </div>
        </div>
        <button
          onClick={() => navigate(`/edit-product/${review.productId}`)}
          className="px-4 py-2 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.12em] border-none cursor-pointer whitespace-nowrap"
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

  const reviewRows = useMemo(() => {
    const standaloneReviews = (reviews || []).map((review) => ({
      id: review._id,
      reviewId: review._id,
      productId: review.product?._id || 'unknown',
      productName: review.product?.name || 'Untitled Product',
      productImage: review.product?.image && review.product.image.startsWith('http')
        ? review.product.image
        : review.product?.image ? `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'}${review.product.image}` : `https://ui-avatars.com/api/?name=${encodeURIComponent((review.product?.name || 'Item').substring(0, 2))}&background=938359&color=fff&bold=true`,
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
          productImage: product.image && product.image.startsWith('http')
            ? product.image
            : product.image ? `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'}${product.image}` : `https://ui-avatars.com/api/?name=${encodeURIComponent((product.name || 'Item').substring(0, 2))}&background=938359&color=fff&bold=true`,
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
    const averageRating = totalReviews ? reviewRows.reduce((sum, r) => sum + r.rating, 0) / totalReviews : 0;
    const uniqueReviewedProductIds = new Set(reviewRows.map(r => r.productId));
    const reviewedProducts = uniqueReviewedProductIds.size;
    const lowRated = reviewRows.filter((r) => r.rating <= 3).length;
    return { totalReviews, averageRating, reviewedProducts, lowRated };
  }, [products, reviewRows]);

  return (
    <div className="min-h-screen p-6 lg:p-10 flex flex-col gap-7 box-border">

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-black tracking-tight text-slate-900 flex items-center gap-3 m-0">
            <Star style={{ color: '#fbbf24', fill: '#fbbf24' }} size={32} />
            Product Reviews
          </h1>
          <p className="mt-2 ml-11 text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
            Centralized feedback intelligence across your catalog
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 w-full lg:w-auto">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, buyers, feedback..."
              className="w-full sm:w-[300px] pl-10 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 outline-none transition-all focus:border-[#85754E] focus:ring-4 focus:ring-[#85754E]/8 box-border"
            />
          </div>

          {/* Sort */}
          <div className="relative shrink-0">
            <Filter size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full sm:w-48 appearance-none pl-10 pr-10 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-700 outline-none cursor-pointer transition-all focus:border-[#85754E] box-border"
            >
              <option value="rating_desc">Top Rated First</option>
              <option value="rating_asc">Lowest Rated First</option>
              <option value="product_name">Product Name</option>
            </select>
            <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Reviews" value={stats.totalReviews.toLocaleString('en-IN')} sub="Ratings collected" isFirst={true} icon={MessageSquare} />
        <StatCard title="Average Score" value={stats.totalReviews ? stats.averageRating.toFixed(1) : '0.0'} sub="Customer satisfaction" icon={BarChart} />
        <StatCard title="Reviewed Products" value={stats.reviewedProducts.toLocaleString('en-IN')} sub="Catalog feedback" icon={Package} />
        <StatCard title="Attention Needed" value={stats.lowRated.toLocaleString('en-IN')} sub="3 stars or below" icon={Activity} />
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">

        {/* Tab bar */}
        <div className="px-6 pt-5 pb-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex flex-wrap gap-1 bg-[#FFF5E2] p-1 rounded-full border border-amber-50">
            {ratingTabs.map((tab) => {
              const active = activeRating === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => setActiveRating(tab.value)}
                  className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.14em] cursor-pointer border-none transition-all
                    ${active ? 'bg-white text-[#85754E] shadow-md shadow-amber-900/10' : 'bg-transparent text-slate-400 hover:text-[#85754E]'}`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 shrink-0">
            <span>{filteredReviews.length.toLocaleString('en-IN')} reviews visible</span>
            <MoreHorizontal size={16} />
          </div>
        </div>

        {/* Loading */}
        {loading && reviewRows.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
            <div className="w-11 h-11 border-4 border-amber-100 border-t-[#85754E] rounded-full animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Loading review matrix</p>
          </div>

        ) : filteredReviews.length === 0 ? (
          <div className="py-20 px-6 text-center flex flex-col items-center gap-4">
            <div className="w-18 h-18 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center" style={{ width: '72px', height: '72px' }}>
              <AlertCircle size={32} className="text-slate-300" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 m-0">No reviews found</h3>
              <p className="mt-2 text-sm text-slate-400 max-w-sm">
                Customer feedback will appear here once shoppers submit ratings and comments for your products.
              </p>
            </div>
            <button
              onClick={() => navigate('/products')}
              className="px-6 py-3 rounded-2xl bg-heritage text-white text-[11px] font-black uppercase tracking-[0.16em] border-none cursor-pointer"
            >
              Open Product List
            </button>
          </div>

        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse" style={{ minWidth: '900px' }}>
                <thead>
                  <tr>
                    {['Product', 'Reviewer', 'Score', 'Feedback', 'Catalog Info', ''].map((col, i) => (
                      <th key={i} className={`px-5 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 bg-slate-50/70 border-b border-slate-100 whitespace-nowrap text-left ${i === 5 ? 'text-right' : ''}`}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredReviews.map((review) => {
                    const tone = scoreTone(review.rating);
                    return (
                      <tr key={review.id} className="border-b border-slate-50 hover:bg-gray-50 transition-colors cursor-default">

                        {/* Product */}
                        <td className="px-5 py-4.5 min-w-[220px] max-w-[260px]">
                          <div className="flex items-center gap-3.5">
                            <div className="w-13 h-13 rounded-2xl border border-slate-100 overflow-hidden bg-white p-1 shrink-0 box-border" style={{ width: '52px', height: '52px' }}>
                              <img
                                src={review.productImage}
                                alt={review.productName}
                                className="w-full h-full object-cover rounded-xl"
                                onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(review.productName)}&background=938359&color=fff&bold=true`; }}
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-black uppercase tracking-tight text-slate-900 overflow-hidden text-ellipsis whitespace-nowrap">
                                {review.productName}
                              </div>
                              <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 mt-0.5">
                                {review.mainCategory}
                                {review.categories?.length > 0 && ` · ${review.categories.join(', ')}`}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Reviewer */}
                        <td className="px-5 py-4.5 min-w-[150px]">
                          <div className="text-[13px] font-black text-slate-900">{review.reviewerName}</div>
                          <div className="text-[10px] font-semibold text-slate-400 mt-0.5">Ref: {String(review.reviewerId).slice(-8)}</div>
                        </td>

                        {/* Score */}
                        <td className="px-5 py-4.5 min-w-[150px]">
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${tone.bg} ${tone.text} text-[10px] font-black uppercase tracking-[0.12em]`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${tone.dot} shrink-0`} />
                            {tone.label}
                          </div>
                          <div className="flex items-center gap-2 mt-2.5">
                            <RatingStars rating={review.rating} />
                            <span className="text-[13px] font-black text-slate-900">{review.rating.toFixed(1)}</span>
                          </div>
                        </td>

                        {/* Feedback */}
                        <td className="px-5 py-4.5 min-w-[240px] max-w-[300px]">
                          <p className="text-[13px] font-medium text-slate-500 leading-relaxed m-0">{review.comment}</p>
                        </td>

                        {/* Catalog Info */}
                        <td className="px-5 py-4.5 min-w-[150px]">
                          <div className="text-[13px] font-bold text-slate-900 flex items-center gap-1.5">
                            <Package size={13} className="text-[#85754E]" />
                            {formatINR(review.productPrice)}
                          </div>
                          <div className="text-[10px] text-slate-400 font-semibold mt-1">
                            Avg: {review.averageRating ? review.averageRating.toFixed(1) : '0.0'} / 5
                          </div>
                          <div className="text-[10px] text-slate-400 font-semibold mt-0.5">
                            Total: {review.productReviewCount.toLocaleString('en-IN')} reviews
                          </div>
                        </td>

                        {/* Action */}
                        <td className="px-5 py-4.5 text-right min-w-[130px]">
                          <button
                            onClick={() => navigate(`/edit-product/${review.productId}`)}
                            className="px-4.5 py-2 rounded-2xl bg-heritage text-white text-[10px] font-black uppercase tracking-[0.12em] border-none cursor-pointer whitespace-nowrap hover:opacity-90 transition-colors"
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

            {/* Mobile Cards */}
            <div className="flex flex-col gap-3.5 p-5 md:hidden">
              {filteredReviews.map((review) => (
                <MobileReviewCard key={review.id} review={review} navigate={navigate} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
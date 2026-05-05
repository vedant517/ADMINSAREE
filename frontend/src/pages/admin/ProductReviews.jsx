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
import { API_BASE_URL } from '../../services/apiConfig';
import { fetchProducts } from '../../features/products/productSlice';
import { formatINR } from '../../utils/currency';

const ratingTabs = [
  { label: 'All Ratings', value: 'all' },
  { label: '5 Star', value: '5' },
  { label: '4 Star', value: '4' },
  { label: '3 & Below', value: '3-below' },
];

const scoreTone = (rating) => {
  if (rating >= 4.5) return { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Excellent' };
  if (rating >= 4) return { bg: 'bg-sky-50', text: 'text-sky-700', dot: 'bg-sky-500', label: 'Strong' };
  if (rating >= 3) return { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', label: 'Mixed' };
  return { bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-rose-500', label: 'Needs Attention' };
};

function StatCard({ title, value, sub }) {
  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-lg shadow-slate-200/40 p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">{title}</p>
          <div className="mt-3 text-3xl font-black tracking-tight text-slate-900">{value}</div>
          <p className="mt-1 text-xs font-medium text-slate-400">{sub}</p>
        </div>
        <div className="w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
          <ArrowUpRight size={18} />
        </div>
      </div>
    </div>
  );
}

function RatingStars({ rating }) {
  const rounded = Math.round(Number(rating) || 0);

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => {
        const active = index < rounded;
        return (
          <Star
            key={index}
            size={14}
            className={active ? 'text-amber-400' : 'text-slate-200'}
            style={{ fill: active ? 'currentColor' : 'none' }}
            strokeWidth={1.8}
          />
        );
      })}
    </div>
  );
}

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
    // 1. Map reviews from the Review collection
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
      source: 'collection'
    }));

    // 2. Map legacy reviews from products that might not be in the collection yet
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
          source: 'legacy'
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

    // Count unique product IDs from the merged reviewRows
    const uniqueReviewedProductIds = new Set(reviewRows.map(r => r.productId));
    const reviewedProducts = uniqueReviewedProductIds.size;

    const lowRated = reviewRows.filter((review) => review.rating <= 3).length;

    return {
      totalReviews,
      averageRating,
      reviewedProducts,
      lowRated,
    };
  }, [products, reviewRows]);

  return (
    <div className="min-h-screen p-6 lg:p-10 animate-fadeIn space-y-8">
      <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 flex items-center gap-3">
            <Star className="text-amber-400" size={34} style={{ fill: 'currentColor' }} />
            Product Reviews
          </h1>
          <p className="mt-2 ml-12 text-[11px] font-black uppercase tracking-[0.26em] text-slate-400">
            Centralized feedback intelligence across your catalog
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto">
          <div className="relative min-w-0 md:w-80">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, buyers, feedback..."
              className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 outline-none focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>

          <div className="relative md:w-52">
            <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full appearance-none pl-10 pr-10 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-700 outline-none focus:ring-4 focus:ring-emerald-500/10"
            >
              <option value="rating_desc">Top Rated First</option>
              <option value="rating_asc">Lowest Rated First</option>
              <option value="product_name">Product Name</option>
            </select>
            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Reviews"
          value={stats.totalReviews.toLocaleString('en-IN')}
          sub="Written ratings collected"
        />
        <StatCard
          title="Average Score"
          value={stats.totalReviews ? stats.averageRating.toFixed(1) : '0.0'}
          sub="Mean customer satisfaction"
        />
        <StatCard
          title="Reviewed Products"
          value={stats.reviewedProducts.toLocaleString('en-IN')}
          sub="Catalog entries with feedback"
        />
        <StatCard
          title="Attention Needed"
          value={stats.lowRated.toLocaleString('en-IN')}
          sub="Reviews rated 3 stars or below"
        />
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
        <div className="px-6 lg:px-8 pt-6 pb-4 border-b border-slate-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {ratingTabs.map((tab) => {
                const active = activeRating === tab.value;
                return (
                  <button
                    key={tab.value}
                    onClick={() => setActiveRating(tab.value)}
                    className={`px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-[0.16em] transition-all ${active
                        ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10'
                        : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                      }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3 text-xs font-semibold text-slate-400">
              <span>{filteredReviews.length.toLocaleString('en-IN')} reviews visible</span>
              <MoreHorizontal size={16} />
            </div>
          </div>
        </div>

        {loading && reviewRows.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin"></div>
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">
              Loading review matrix
            </p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="py-24 px-6 text-center flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-[1.75rem] bg-slate-50 border border-slate-100 flex items-center justify-center">
              <AlertCircle size={34} className="text-slate-300" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight text-slate-900">No reviews found</h3>
              <p className="mt-2 text-sm text-slate-400 max-w-md">
                Customer feedback will appear here once shoppers submit ratings and comments for your products.
              </p>
            </div>
            <button
              onClick={() => navigate('/products')}
              className="mt-2 px-5 py-3 rounded-2xl bg-slate-900 text-white text-[11px] font-black uppercase tracking-[0.18em] hover:bg-slate-800 transition-all"
            >
              Open Product List
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 bg-slate-50/60 border-b border-slate-100">
                  <th className="px-6 lg:px-8 py-5 text-left">Product</th>
                  <th className="px-6 py-5 text-left">Reviewer</th>
                  <th className="px-6 py-5 text-left">Score</th>
                  <th className="px-6 py-5 text-left">Feedback</th>
                  <th className="px-6 py-5 text-left">Catalog Info</th>
                  <th className="px-6 lg:px-8 py-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReviews.map((review) => {
                  const tone = scoreTone(review.rating);
                  return (
                    <tr key={review.id} className="hover:bg-slate-50/60 transition-colors align-top">
                      <td className="px-6 lg:px-8 py-6">
                        <div className="flex items-center gap-4 min-w-[240px]">
                          <div className="w-14 h-14 rounded-2xl border border-slate-100 overflow-hidden bg-white p-1.5 flex-shrink-0">
                            <img
                              src={review.productImage}
                              alt={review.productName}
                              className="w-full h-full object-cover rounded-xl"
                              onError={(e) => {
                                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(review.productName)}&background=10b981&color=fff&bold=true`;
                              }}
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-black uppercase tracking-tight text-slate-900 truncate">
                              {review.productName}
                            </div>
                            <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                              {review.mainCategory} · {review.categories?.join(', ')}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-6 min-w-[170px]">
                        <div className="text-sm font-black text-slate-900">{review.reviewerName}</div>
                        <div className="mt-1 text-[11px] font-semibold text-slate-400">
                          Ref: {String(review.reviewerId).slice(-8)}
                        </div>
                      </td>

                      <td className="px-6 py-6 min-w-[150px]">
                        <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-full ${tone.bg} ${tone.text}`}>
                          <span className={`w-2 h-2 rounded-full ${tone.dot}`}></span>
                          <span className="text-xs font-black uppercase tracking-[0.14em]">{tone.label}</span>
                        </div>
                        <div className="mt-3 flex items-center gap-3">
                          <RatingStars rating={review.rating} />
                          <span className="text-sm font-black text-slate-900">{review.rating.toFixed(1)}</span>
                        </div>
                      </td>

                      <td className="px-6 py-6 min-w-[320px]">
                        <p className="text-sm font-medium text-slate-600 leading-6">
                          {review.comment}
                        </p>
                      </td>

                      <td className="px-6 py-6 min-w-[170px]">
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                          <Package size={14} className="text-emerald-500" />
                          {formatINR(review.productPrice)}
                        </div>
                        <div className="mt-2 text-[11px] text-slate-400 font-semibold">
                          Product avg: {review.averageRating ? review.averageRating.toFixed(1) : '0.0'} / 5
                        </div>
                        <div className="mt-1 text-[11px] text-slate-400 font-semibold">
                          Total feedback: {review.productReviewCount.toLocaleString('en-IN')}
                        </div>
                      </td>

                      <td className="px-6 lg:px-8 py-6">
                        <div className="flex justify-end">
                          <button
                            onClick={() => navigate(`/edit-product/${review.productId}`)}
                            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-[11px] font-black uppercase tracking-[0.14em] hover:bg-slate-800 transition-all whitespace-nowrap"
                          >
                            View Product
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Star, ArrowLeft, MessageSquare, User, Clock, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../../services/apiConfig';

const ProductReviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New review state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/products/${id}`);
      setProduct(data.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setLoading(false);
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      setSubmitLoading(true);
      await api.post(
        `/products/${id}/reviews`,
        { rating, comment }
      );

      setMessage({ type: 'success', text: 'Review submitted successfully!' });
      setRating(5);
      setComment('');
      
      // Fetch product again to show the real-time update
      await fetchProduct();
      
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || err.message });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-[#938359] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Failed to load</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button 
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-slate-900 border border-slate-900 text-white rounded-xl hover:bg-slate-800 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn">
        {/* Header / Product Info */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 sm:p-10 flex flex-col md:flex-row gap-10 items-center">
             <div className="w-full md:w-1/3 aspect-square bg-slate-50 rounded-2xl p-4 flex items-center justify-center">
                 <img 
                    src={product.image || `https://ui-avatars.com/api/?name=${product.name}`} 
                    alt={product.name}
                    className="max-w-full max-h-full object-contain drop-shadow-xl"
                 />
             </div>
             <div className="w-full md:w-2/3 space-y-4">
                 <div className="inline-flex px-3 py-1 bg-amber-50 text-[#938359] text-xs font-bold uppercase tracking-wider rounded-full">
                    {product.mainCategory || 'Exclusive'} 
                 </div>
                 <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                    {product.name}
                 </h1>
                 <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                    {product.description}
                 </p>
                 
                 <div className="flex items-center gap-4 pt-4">
                     <div className="flex items-center gap-1">
                         {Array.from({ length: 5 }).map((_, i) => (
                             <Star 
                               key={i} 
                               size={20} 
                               className={i < Math.round(product.ratings || 0) ? 'text-amber-400' : 'text-slate-200'}
                               style={{ fill: i < Math.round(product.ratings || 0) ? 'currentColor' : 'none' }}
                             />
                         ))}
                     </div>
                     <span className="text-slate-900 font-bold">{product.ratings?.toFixed(1) || '0.0'} Rating</span>
                     <span className="text-slate-400">•</span>
                     <span className="text-slate-500">{product.numOfReviews || 0} Reviews</span>
                 </div>
             </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Col: Write Review */}
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 sticky top-10">
                    <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                        <MessageSquare className="text-[#938359]" />
                        Write a Review
                    </h3>

                    {message && (
                        <div className={`p-4 rounded-xl mb-6 text-sm font-semibold ${message.type === 'success' ? 'bg-amber-50 text-[#938359]' : 'bg-red-50 text-red-700'}`}>
                            {message.text}
                        </div>
                    )}

                    {!localStorage.getItem('isLoggedIn') ? (
                        <div className="bg-slate-50 rounded-xl p-6 text-center border border-slate-100">
                             <p className="text-sm text-slate-500 mb-4">Please log in to write a review for this product.</p>
                             <button onClick={() => navigate('/')} className="px-6 py-2.5 bg-slate-900 text-white font-bold text-sm rounded-xl w-full hover:bg-slate-800 transition">
                                 Sign In
                             </button>
                        </div>
                    ) : (
                        <form onSubmit={submitHandler} className="space-y-5">
                            <div>
                                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-2">Rating</label>
                                <div className="flex items-center gap-2">
                                     {[1, 2, 3, 4, 5].map(num => (
                                         <button 
                                            key={num}
                                            type="button"
                                            onClick={() => setRating(num)}
                                            className={`p-2 rounded-xl transition ${rating >= num ? 'bg-amber-50 text-amber-500' : 'bg-slate-50 text-slate-300 hover:bg-slate-100'}`}
                                         >
                                             <Star size={24} style={{ fill: rating >= num ? 'currentColor' : 'none' }} />
                                         </button>
                                     ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-2">Your Comment</label>
                                <textarea 
                                    rows="4" 
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-4 focus:ring-[#938359]/10 focus:border-[#938359] transition-all resize-none"
                                    placeholder="What did you like or dislike?"
                                    required
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={submitLoading}
                                className="w-full py-3.5 bg-[#938359] hover:bg-[#837349] text-white font-bold text-sm uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-amber-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {submitLoading ? 'Submitting...' : 'Submit Review'}
                            </button>
                        </form>
                    )}
                </div>
            </div>

            {/* Right Col: Review List */}
            <div className="lg:col-span-2">
                 <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 sm:p-10">
                     <h3 className="text-2xl font-black text-slate-900 mb-8 border-b border-slate-100 pb-6">Customer Reviews</h3>
                     
                     {product.reviews && product.reviews.length === 0 ? (
                         <div className="py-12 flex flex-col items-center justify-center text-center">
                             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                 <MessageSquare className="w-8 h-8 text-slate-300" />
                             </div>
                             <h4 className="text-lg font-bold text-slate-800">No reviews yet</h4>
                             <p className="text-slate-500 text-sm mt-1">Be the first to share your thoughts!</p>
                         </div>
                     ) : (
                         <div className="space-y-6">
                             {product.reviews && [...product.reviews].reverse().map((review, index) => (
                                 <div key={review._id || index} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-md transition duration-300">
                                     <div className="flex justify-between items-start mb-4">
                                         <div className="flex items-center gap-3">
                                             <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                                                 <User className="text-slate-400 w-5 h-5" />
                                             </div>
                                             <div>
                                                 <h5 className="font-bold text-slate-900 text-sm">{review.name}</h5>
                                                 <div className="flex -ml-1 mt-0.5">
                                                     {Array.from({ length: 5 }).map((_, i) => (
                                                         <Star 
                                                            key={i} 
                                                            size={12} 
                                                            className={i < review.rating ? 'text-amber-400' : 'text-slate-300'}
                                                            style={{ fill: i < review.rating ? 'currentColor' : 'none' }}
                                                         />
                                                     ))}
                                                 </div>
                                             </div>
                                         </div>
                                         <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                             <Clock size={12} />
                                             {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Just Now'}
                                         </div>
                                     </div>
                                     
                                     <p className="text-slate-600 text-sm leading-relaxed">
                                         {review.comment}
                                     </p>
                                 </div>
                             ))}
                         </div>
                     )}
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProductReviewPage;

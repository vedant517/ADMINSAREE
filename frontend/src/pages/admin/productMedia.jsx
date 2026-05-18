import React, { useEffect, useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import api from "../../services/api";

const MAIN_CATEGORIES = ["Royal Silks", "Festive Radiance", "Bridal Elegance", "Handwoven Heritage"];
const SUB_CATEGORIES = ["Wedding", "Party Wear", "Bride", "Festive", "Casual", "Daily Wear"];

const OfferPage = () => {
  const [offers, setOffers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedMainCategory, setSelectedMainCategory] = useState("All");
  const [selectedTag, setSelectedTag] = useState("All");

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    discountPercent: "",
    productId: "",
    variantId: "",
    mainCategory: "",
    tag: "HOT",
    endDate: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [offerRes, productRes] = await Promise.all([
          api.get('/offers'),
          api.get('/products?limit=1000'),
        ]);
        const offerData = offerRes.data;
        const productData = productRes.data;
        setOffers(offerData.data || []);
        setProducts(productData.data || []);
        setLoading(false);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load data");
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ── FORM HANDLERS ──────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "mainCategory") {
      setFormData((p) => ({ ...p, mainCategory: value, productId: "", variantId: "" }));
    } else if (name === "productId") {
      setFormData((p) => ({ ...p, productId: value, variantId: "" }));
    } else {
      setFormData((p) => ({ ...p, [name]: value }));
    }
  };

  const handleCreateOffer = async () => {
    if (!formData.name || !formData.discountPercent || !formData.productId || !formData.endDate) {
      toast.error("Please fill all required fields");
      return;
    }
    try {
      const payload = { ...formData };
      if (!payload.variantId) delete payload.variantId;
      const res = await api.post('/offers', payload);
      const data = res.data;
      if (data.success) {
        setOffers((prev) => [...prev, data.data]);
        setShowForm(false);
        toast.success("Offer created!");
        setFormData({ name: "", discountPercent: "", productId: "", variantId: "", mainCategory: "", tag: "HOT", endDate: "" });
      } else {
        toast.error(data.message || "Failed to create offer");
      }
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  // ── ENRICH OFFERS ──────────────────────────────────────────
  const enrichedOffers = offers.map((offer) => {
    const product =
      offer.productId && typeof offer.productId === "object"
        ? offer.productId
        : products.find((p) => p._id === offer.productId);

    const fullProduct = products.find(
      (p) => p._id === (product?._id || offer.productId)
    );

    const variantIdStr =
      offer.variantId && typeof offer.variantId === "object"
        ? String(offer.variantId._id)
        : offer.variantId
          ? String(offer.variantId)
          : null;

    const variants = fullProduct?.variants || product?.variants || [];
    const variant = variantIdStr
      ? variants.find((v) => String(v._id) === variantIdStr)
      : null;

    const resolvedVariant = variant || (offer.variantId && typeof offer.variantId === "object" ? offer.variantId : null);

    const mainCategory = fullProduct?.mainCategory || product?.mainCategory || "Other";
    const tags = fullProduct?.categories || product?.categories || [];

    const price = resolvedVariant?.price ?? fullProduct?.price ?? product?.price ?? 0;

    return {
      ...offer,
      productName: fullProduct?.name || product?.name || "Unknown",
      price,
      mainCategory,
      tags,
      variantLabel: resolvedVariant ? (resolvedVariant.color || resolvedVariant.fabric || "Variant") : null,
      image: resolvedVariant?.image || fullProduct?.image || product?.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300",
    };
  });

  // ── FILTER TABS ────────────────────────────────────────────
  const mainCategoryTabs = ["All", ...MAIN_CATEGORIES];
  const tagTabs = ["All", ...SUB_CATEGORIES];

  const filteredOffers = enrichedOffers.filter((o) => {
    const matchMain = selectedMainCategory === "All" || o.mainCategory === selectedMainCategory;
    const matchTag = selectedTag === "All" || o.tags.includes(selectedTag);
    return matchMain && matchTag;
  });

  // ── FORM DROPDOWNS ─────────────────────────────────────────
  const filteredProducts = products.filter((p) => {
    return !formData.mainCategory || p.mainCategory === formData.mainCategory;
  });

  const selectedProduct = products.find((p) => p._id === formData.productId);
  const productVariants = selectedProduct?.variants || [];

  const getVariantPrice = () => {
    if (formData.variantId) {
      const v = productVariants.find((v) => String(v._id) === String(formData.variantId));
      return v?.price ?? selectedProduct?.price ?? 0;
    }
    return selectedProduct?.price ?? 0;
  };

  const getDiscountedPrice = (price, pct) =>
    Math.round(price - (price * Number(pct)) / 100);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-[#938359] rounded-full mx-auto mb-4 animate-spin"></div>
          <p className="text-slate-500 font-semibold">Loading offers...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-slate-50 px-6 py-7 font-sans text-slate-800">
      <Toaster position="top-right" />

      {/* ── HEADER ── */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight m-0">🏷️ Offers</h1>
          <p className="text-sm text-slate-400 mt-1 font-medium">Manage and create product offers</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 bg-gradient-to-br from-[#b09e6d] to-[#938359] text-white border-0 px-5 py-2.5 rounded-xl font-bold text-sm cursor-pointer shadow-lg shadow-amber-400/30 hover:opacity-90 transition-opacity"
        >
          <span className="text-lg leading-none">+</span> Create Offer
        </button>
      </div>

      {/* ── OFFERS GRID ── */}
      {filteredOffers.length === 0 ? (
        <div className="text-center py-16 px-5 text-slate-400">
          <div className="text-5xl mb-3">🎁</div>
          <p className="text-base font-semibold">No offers found</p>
          <p className="text-sm">Create your first offer to get started</p>
        </div>
      ) : (
        <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))" }}>
          {filteredOffers.map((offer) => {
            const finalPrice = getDiscountedPrice(offer.price, offer.discountPercent);
            const savings = offer.price - finalPrice;
            return (
              <div
                key={offer._id}
                className="bg-white rounded-2xl overflow-hidden shadow-md border border-slate-100 cursor-pointer relative transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl"
              >
                {/* Discount badge */}
                <div className="absolute top-3 left-3 z-10 bg-gradient-to-br from-red-500 to-red-600 text-white text-xs font-extrabold px-2.5 py-1 rounded-full shadow-md shadow-red-400/40">
                  -{offer.discountPercent}% OFF
                </div>

                {/* Tag badge */}
                {offer.tag && (
                  <div className={`absolute top-3 right-3 z-10 text-white text-xs font-extrabold px-2.5 py-1 rounded-full ${
                    offer.tag === "HOT" ? "bg-gradient-to-br from-orange-400 to-orange-600" :
                    offer.tag === "NEW" ? "bg-gradient-to-br from-blue-400 to-blue-600" :
                    offer.tag === "SALE" ? "bg-gradient-to-br from-[#b09e6d] to-[#938359]" :
                    "bg-gradient-to-br from-violet-600 to-violet-700"
                  }`}>
                    {offer.tag === "HOT" ? "🔥" : offer.tag === "NEW" ? "✨" : offer.tag === "SALE" ? "🏷️" : "⚡"} {offer.tag}
                  </div>
                )}

                {/* Image */}
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-slate-50 to-slate-200">
                  <img
                    src={offer.image}
                    alt={offer.productName}
                    className="w-full h-full object-cover transition-transform duration-300"
                    onError={e => { e.target.src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300"; }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/30 to-transparent"></div>
                </div>

                {/* Content */}
                <div className="p-4 pb-5">
                  <div className="flex items-center gap-1 mb-2 flex-wrap">
                    <span className="text-xs font-bold text-[#938359] bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 uppercase tracking-widest flex items-center gap-1.5">
                      {offer.mainCategory}
                    </span>
                    {offer.tags.map(tag => (
                      <span key={tag} className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <h3 className="text-sm font-bold text-slate-800 m-0 mb-1 overflow-hidden text-ellipsis whitespace-nowrap">
                    {offer.productName}
                  </h3>
                  {offer.variantLabel && (
                    <p className="text-xs font-bold text-violet-700 mt-0 mb-2">Variant: {offer.variantLabel}</p>
                  )}
                  <p className="text-xs text-slate-400 mt-0 mb-3 font-medium">{offer.name}</p>

                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-extrabold text-[#938359]">₹{finalPrice.toLocaleString()}</span>
                        <span className="text-sm text-slate-300 line-through font-medium">₹{offer.price.toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-orange-400 font-bold mt-0.5">Save ₹{savings.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── MODAL ── */}
      {showForm && (
        <div
          className="fixed inset-0 bg-slate-900/65 flex justify-center items-center z-[1000] backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}
        >
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto" style={{ animation: "slideUp 0.25s ease" }}>
            {/* Modal Header */}
            <div className="bg-gradient-to-br from-[#b09e6d] to-[#938359] px-6 py-5 flex justify-between items-center sticky top-0 z-10">
              <div>
                <h2 className="text-white text-lg font-extrabold m-0">Create New Offer</h2>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="bg-white/20 border-0 text-white w-8 h-8 rounded-full text-lg cursor-pointer flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Main Category */}
              <div className="mb-3.5">
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                  Main Category Filter
                </label>
                <select
                  name="mainCategory"
                  value={formData.mainCategory}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 border-[1.5px] border-slate-200 rounded-xl text-sm text-slate-800 outline-none bg-slate-50 cursor-pointer focus:border-[#938359] transition-colors"
                >
                  <option value="">All Categories</option>
                  {MAIN_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Product */}
              <div className="mb-3.5">
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                  Product <span className="text-red-500">*</span>
                </label>
                <select
                  name="productId"
                  value={formData.productId}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 border-[1.5px] border-slate-200 rounded-xl text-sm text-slate-800 outline-none bg-slate-50 cursor-pointer focus:border-[#938359] transition-colors"
                >
                  <option value="">Select Product</option>
                  {filteredProducts.map((p) => (
                    <option key={p._id} value={p._id}>{p.name} — ₹{p.price}</option>
                  ))}
                </select>
              </div>

              {/* Variant */}
              {productVariants.length > 0 && (
                <div className="mb-3.5">
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                    Variant (optional)
                  </label>
                  <select
                    name="variantId"
                    value={formData.variantId}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 border-[1.5px] border-slate-200 rounded-xl text-sm text-slate-800 outline-none bg-slate-50 cursor-pointer focus:border-[#938359] transition-colors"
                  >
                    <option value="">All Variants</option>
                    {productVariants.map((v) => (
                      <option key={v._id} value={v._id}>{v.color} {v.fabric} (₹{v.price})</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Offer Name */}
              <div className="mb-3.5">
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                  Offer Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Summer Sale"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 border-[1.5px] border-slate-200 rounded-xl text-sm text-slate-800 outline-none bg-slate-50 focus:border-[#938359] transition-colors"
                />
              </div>

              {/* Discount & End Date */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                    Discount % <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="discountPercent"
                    value={formData.discountPercent}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 border-[1.5px] border-slate-200 rounded-xl text-sm text-slate-800 outline-none bg-slate-50 focus:border-[#938359] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 border-[1.5px] border-slate-200 rounded-xl text-sm text-slate-800 outline-none bg-slate-50 cursor-pointer focus:border-[#938359] transition-colors"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-3 bg-[#938359] text-white border-0 rounded-xl text-[13px] font-bold cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateOffer}
                  className="flex-[2] py-2.5 border-0 rounded-xl bg-gradient-to-br from-[#b09e6d] to-[#938359] text-white font-bold cursor-pointer hover:opacity-90 transition-opacity"
                >
                  ✓ Create Offer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
  );
};

export default OfferPage;
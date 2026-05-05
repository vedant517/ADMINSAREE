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

  // ── SHARED STYLES ──────────────────────────────────────────
  const labelStyle = {
    fontSize: 11,
    fontWeight: 700,
    color: "#475569",
    display: "block",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: "0.6px",
  };
  const inputStyle = {
    width: "100%",
    padding: "10px 14px",
    border: "1.5px solid #e2e8f0",
    borderRadius: 10,
    fontSize: 13,
    color: "#1e293b",
    outline: "none",
    background: "#f8fafc",
    boxSizing: "border-box",
    cursor: "pointer",
  };

  if (loading)
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#f8fafc" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 48, height: 48, border: "4px solid #e2e8f0", borderTop: "4px solid #4c9f70", borderRadius: "50%", margin: "0 auto 16px", animation: "spin 1s linear infinite" }}></div>
          <p style={{ color: "#64748b", fontWeight: 600 }}>Loading offers...</p>
        </div>
      </div>
    );

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f0fdf4 0%, #f8fafc 100%)", padding: "28px 24px", fontFamily: "'Inter', sans-serif", color: "#1e293b" }}>
      <Toaster position="top-right" />

      {/* ── HEADER ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#1e293b", margin: 0, letterSpacing: "-0.5px" }}>🏷️ Offers</h1>
          <p style={{ fontSize: 13, color: "#94a3b8", margin: "4px 0 0", fontWeight: 500 }}>Manage and create product offers</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          style={{ background: "linear-gradient(135deg,#4c9f70,#3a895c)", color: "#fff", border: "none", padding: "10px 20px", borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, boxShadow: "0 4px 14px rgba(76,159,112,0.35)" }}
        >
          <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Create Offer
        </button>
      </div>



      {/* ── OFFERS GRID ── */}
      {filteredOffers.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#94a3b8" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎁</div>
          <p style={{ fontSize: 16, fontWeight: 600 }}>No offers found</p>
          <p style={{ fontSize: 13 }}>Create your first offer to get started</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 20 }}>
          {filteredOffers.map((offer) => {
            const finalPrice = getDiscountedPrice(offer.price, offer.discountPercent);
            const savings = offer.price - finalPrice;
            return (
              <div
                key={offer._id}
                style={{ background: "#fff", borderRadius: 18, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.07)", border: "1px solid #f1f5f9", cursor: "pointer", position: "relative", transition: "transform 0.2s,box-shadow 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.12)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.07)"; }}
              >
                <div style={{ position: "absolute", top: 12, left: 12, zIndex: 2, background: "linear-gradient(135deg,#ef4444,#dc2626)", color: "#fff", fontSize: 11, fontWeight: 800, padding: "4px 10px", borderRadius: 20, boxShadow: "0 2px 8px rgba(239,68,68,0.4)" }}>
                  -{offer.discountPercent}% OFF
                </div>
                {offer.tag && (
                  <div style={{ position: "absolute", top: 12, right: 12, zIndex: 2, background: offer.tag === "HOT" ? "linear-gradient(135deg,#f97316,#ea580c)" : offer.tag === "NEW" ? "linear-gradient(135deg,#3b82f6,#2563eb)" : offer.tag === "SALE" ? "linear-gradient(135deg,#4c9f70,#3a895c)" : "linear-gradient(135deg,#7c3aed,#6d28d9)", color: "#fff", fontSize: 10, fontWeight: 800, padding: "3px 9px", borderRadius: 20 }}>
                    {offer.tag === "HOT" ? "🔥" : offer.tag === "NEW" ? "✨" : offer.tag === "SALE" ? "🏷️" : "⚡"} {offer.tag}
                  </div>
                )}

                <div style={{ position: "relative", height: 190, overflow: "hidden", background: "linear-gradient(135deg,#f8fafc,#e2e8f0)" }}>
                  <img
                    src={offer.image}
                    alt={offer.productName}
                    style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s" }}
                    onError={e => { e.target.src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300"; }}
                  />
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 60, background: "linear-gradient(to top,rgba(0,0,0,0.3),transparent)" }}></div>
                </div>

                <div style={{ padding: "16px 16px 18px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#4c9f70", background: "#f0fdf4", padding: "2px 8px", borderRadius: 20, border: "1px solid #bbf7d0" }}>
                      {offer.mainCategory}
                    </span>
                    {offer.tags.map(tag => (
                      <span key={tag} style={{ fontSize: 10, fontWeight: 700, color: "#2563eb", background: "#eff6ff", padding: "2px 8px", borderRadius: 20, border: "1px solid #bfdbfe" }}>
                        {tag}
                      </span>
                    ))}
                  </div>

                  <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1e293b", margin: "0 0 4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {offer.productName}
                  </h3>
                  {offer.variantLabel && (
                    <p style={{ fontSize: 11, fontWeight: 700, color: "#7c3aed", margin: "0 0 8px" }}>Variant: {offer.variantLabel}</p>
                  )}
                  <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 12px", fontWeight: 500 }}>{offer.name}</p>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                        <span style={{ fontSize: 20, fontWeight: 800, color: "#4c9f70" }}>₹{finalPrice.toLocaleString()}</span>
                        <span style={{ fontSize: 13, color: "#cbd5e1", textDecoration: "line-through", fontWeight: 500 }}>₹{offer.price.toLocaleString()}</span>
                      </div>
                      <p style={{ fontSize: 11, color: "#f97316", fontWeight: 700, margin: "3px 0 0" }}>Save ₹{savings.toLocaleString()}</p>
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
          style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.65)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, backdropFilter: "blur(4px)", padding: 16 }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}
        >
          <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 460, boxShadow: "0 24px 60px rgba(0,0,0,0.2)", overflow: "hidden", animation: "slideUp 0.25s ease", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ background: "linear-gradient(135deg,#4c9f70,#3a895c)", padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 10 }}>
              <div>
                <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 800, margin: 0 }}>Create New Offer</h2>
              </div>
              <button onClick={() => setShowForm(false)} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", width: 32, height: 32, borderRadius: "50%", fontSize: 18, cursor: "pointer" }}>×</button>
            </div>

            <div style={{ padding: 24 }}>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Main Category Filter</label>
                <select name="mainCategory" value={formData.mainCategory} onChange={handleChange} style={inputStyle}>
                  <option value="">All Categories</option>
                  {MAIN_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Product <span style={{ color: "#ef4444" }}>*</span></label>
                <select name="productId" value={formData.productId} onChange={handleChange} style={inputStyle}>
                  <option value="">Select Product</option>
                  {filteredProducts.map((p) => (
                    <option key={p._id} value={p._id}>{p.name} — ₹{p.price}</option>
                  ))}
                </select>
              </div>

              {productVariants.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>Variant (optional)</label>
                  <select name="variantId" value={formData.variantId} onChange={handleChange} style={inputStyle}>
                    <option value="">All Variants</option>
                    {productVariants.map((v) => (
                      <option key={v._id} value={v._id}>{v.color} {v.fabric} (₹{v.price})</option>
                    ))}
                  </select>
                </div>
              )}

              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Offer Name <span style={{ color: "#ef4444" }}>*</span></label>
                <input type="text" name="name" placeholder="Summer Sale" value={formData.name} onChange={handleChange} style={inputStyle} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                <div>
                  <label style={labelStyle}>Discount % <span style={{ color: "#ef4444" }}>*</span></label>
                  <input type="number" name="discountPercent" value={formData.discountPercent} onChange={handleChange} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>End Date <span style={{ color: "#ef4444" }}>*</span></label>
                  <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} style={inputStyle} />
                </div>
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <button onClick={() => setShowForm(false)} style={{ flex: 1, padding: 11, border: "1.5px solid #e2e8f0", borderRadius: 12, background: "#fff", color: "#64748b", fontWeight: 700, cursor: "pointer" }}>Cancel</button>
                <button onClick={handleCreateOffer} style={{ flex: 2, padding: 11, border: "none", borderRadius: 12, background: "linear-gradient(135deg,#4c9f70,#3a895c)", color: "#fff", fontWeight: 700, cursor: "pointer" }}>✓ Create Offer</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default OfferPage;
import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Plus, Search, Image as ImageIcon, Check,
  Edit2, Type, X, Layers, ChevronDown
} from 'lucide-react';
import { addProduct, updateProduct, fetchProductById } from '../../features/products/productSlice';
import { useNavigate, useParams } from 'react-router-dom';
import { formatINR } from '../../utils/currency';
import { fetchMetadata } from '../../features/products/categorySlice';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

const AddProduct = () => {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const { id }     = useParams();
  const isEditMode = !!id;

  const { loading, error } = useSelector((state) => state.products);
  const {
    mainCategories: MAIN_CATEGORIES = [],
    categories: SUB_CATEGORIES = [],
    colors: PRODUCT_COLORS = []
  } = useSelector((state) => state.categories || {});

  const [formData, setFormData] = useState({
    name: '', description: '', price: '', discountPrice: '',
    mainCategory: '', categories: [],
    stockQuantity: '', stockStatus: 'In Stock',
  });

  const [variants, setVariants]               = useState([]);
  const [variantImages, setVariantImages]     = useState([]);
  const [variantPreviews, setVariantPreviews] = useState([]);
  const [taxIncluded, setTaxIncluded]         = useState(true);
  const [isUnlimited, setIsUnlimited]         = useState(false);
  const [isFeatured, setIsFeatured]           = useState(true);
  const [images, setImages]                   = useState([]);
  const [previews, setPreviews]               = useState([]);
  const [saleResult, setSaleResult]           = useState(0);
  const [imageError, setImageError]           = useState('');

  const fileInputRef     = useRef(null);
  const variantImageRefs = useRef([]);

  useEffect(() => {
    dispatch(fetchMetadata());
    if (isEditMode) {
      const loadProduct = async () => {
        const result = await dispatch(fetchProductById(id));
        if (fetchProductById.fulfilled.match(result)) {
          const p = result.payload;
          setFormData({
            name: p.name || '', description: p.description || '',
            price: p.price || '', discountPrice: p.discountPrice || '',
            mainCategory: p.mainCategory || '',
            categories: p.categories || [],
            stockQuantity: p.stock || '',
            stockStatus: p.stock > 0 ? 'In Stock' : 'Out of Stock',
          });
          const loadedVariants = p.variants || [];
          setVariants(loadedVariants);
          setVariantImages(loadedVariants.map(() => null));
          setVariantPreviews(loadedVariants.map((v) => v.image || null));
          setIsFeatured(p.isFeatured || false);
          if (p.image) setPreviews([p.image]);
        }
      };
      loadProduct();
    }
  }, [dispatch, id, isEditMode]);

  useEffect(() => {
    const p = parseFloat(formData.price) || 0;
    const d = parseFloat(formData.discountPrice) || 0;
    setSaleResult(p - d);
  }, [formData.price, formData.discountPrice]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryToggle = (cat) => {
    setFormData(prev => {
      const current = prev.categories || [];
      if (current.includes(cat)) return { ...prev, categories: current.filter(c => c !== cat) };
      return { ...prev, categories: [...current, cat] };
    });
  };

  // ── Fixed: validate file types before accepting ──
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const invalidFiles = files.filter(f => !ALLOWED_IMAGE_TYPES.includes(f.type));
    if (invalidFiles.length > 0) {
      setImageError('Only image files are allowed (JPG, PNG, WEBP, GIF)');
      // Reset input so the same file can be re-selected after correction
      e.target.value = '';
      return;
    }
    setImageError('');
    setImages((prev) => [...prev, ...files]);
    setPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
    // Reset input value so same file can be selected again if needed
    e.target.value = '';
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index, field, value) => {
    const nv = [...variants];
    nv[index][field] = value;
    setVariants(nv);
  };

  // ── Fixed: validate variant image file types too ──
  const handleVariantImageChange = (index, e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setImageError('Only image files are allowed (JPG, PNG, WEBP, GIF)');
      e.target.value = '';
      return;
    }
    setImageError('');
    const newImages   = [...variantImages];
    const newPreviews = [...variantPreviews];
    newImages[index]   = file;
    newPreviews[index] = URL.createObjectURL(file);
    setVariantImages(newImages);
    setVariantPreviews(newPreviews);
    e.target.value = '';
  };

  const removeVariantImage = (index) => {
    const newImages   = [...variantImages];
    const newPreviews = [...variantPreviews];
    newImages[index]   = null;
    newPreviews[index] = null;
    setVariantImages(newImages);
    setVariantPreviews(newPreviews);
  };

  const addVariant = () => {
    setVariants([...variants, { color: '', fabric: '', price: '', stock: '' }]);
    setVariantImages([...variantImages, null]);
    setVariantPreviews([...variantPreviews, null]);
  };

  const removeVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
    setVariantImages(variantImages.filter((_, i) => i !== index));
    setVariantPreviews(variantPreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const submissionData = new FormData();
    submissionData.append('name', formData.name);
    submissionData.append('description', formData.description);
    submissionData.append('price', formData.price);
    submissionData.append('discountPrice', formData.discountPrice);
    submissionData.append('mainCategory', formData.mainCategory);
    formData.categories.forEach(cat => submissionData.append('categories', cat));
    submissionData.append('taxIncluded', taxIncluded);
    submissionData.append('isFeatured', isFeatured);
    submissionData.append('stock', isUnlimited ? 999999 : formData.stockQuantity);
    submissionData.append('variants', JSON.stringify(variants));
    if (images.length > 0) submissionData.append('image', images[0]);
    variantImages.forEach((file, idx) => {
      if (file) submissionData.append(`variantImage_${idx}`, file);
    });

    let result;
    if (isEditMode) {
      result = await dispatch(updateProduct({ id, productData: submissionData }));
    } else {
      result = await dispatch(addProduct(submissionData));
    }
    if (addProduct.fulfilled.match(result) || updateProduct.fulfilled.match(result)) {
      navigate('/products');
    }
  };

  const inputCls = "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none transition-all box-border text-slate-800 focus:border-green-600 focus:bg-white";
  const labelCls = "text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block";
  const sectionCls = "bg-white p-5 rounded-2xl border border-slate-200 shadow-sm";

  return (
    <div className="flex flex-col gap-0 bg-slate-50 flex-1 min-w-0">

      {/* Top bar */}
      <div className="px-4 py-4 md:px-6 md:py-5 flex flex-col gap-3 md:flex-row md:justify-between md:items-center md:flex-wrap bg-slate-50">
        <div>
          <h1 className="text-lg font-extrabold text-gray-800 m-0">
            {isEditMode ? 'Edit Product' : 'Add New Product'}
          </h1>
          <p className="text-[13px] text-slate-500 mt-1 mb-0">
            {isEditMode ? 'Modify existing product details' : 'Create and publish a new item in your store'}
          </p>
        </div>
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-56">
            <input
              type="text"
              placeholder="Search product metadata..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none transition-all box-border text-slate-800"
            />
            <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
          <button
            type="submit"
            form="main-form"
            className="px-5 py-2.5 bg-[#4c9f70] text-white border-0 rounded-xl text-[13px] font-bold cursor-pointer whitespace-nowrap hover:bg-[#3d8a5e] transition-colors"
          >
            {loading ? 'Processing...' : (isEditMode ? 'Update Product' : 'Publish Product')}
          </button>
        </div>
      </div>

      {/* Redux error */}
      {error && (
        <div className="mx-4 mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-semibold flex items-center gap-2">
          <X size={16} /> {error}
        </div>
      )}

      {/* Image validation error */}
      {imageError && (
        <div className="mx-4 mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-semibold flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <X size={16} /> {imageError}
          </div>
          <button
            type="button"
            onClick={() => setImageError('')}
            className="text-red-400 hover:text-red-600 bg-transparent border-0 cursor-pointer p-0 leading-none"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Form */}
      <form
        id="main-form"
        onSubmit={handleSubmit}
        className="px-4 pb-6 flex flex-col gap-5 lg:px-6 lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)] lg:gap-5 lg:items-start"
      >
        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-5">

          {/* Basic Details */}
          <div className={sectionCls}>
            <h2 className="text-sm font-extrabold text-slate-800 mb-5 flex items-center gap-2 mt-0">
              <Type size={16} className="text-[#4c9f70]" /> Basic Details
            </h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className={labelCls}>Product Name</label>
                <input required name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g., Silk Saree" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Product Description</label>
                <textarea
                  required name="description" rows={5} value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Provide a detailed description of the product features..."
                  className={`${inputCls} resize-none`}
                />
              </div>
            </div>
          </div>

          {/* Variants */}
          <div className={sectionCls}>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-sm font-extrabold text-slate-800 flex items-center gap-2 m-0">
                <Layers size={16} className="text-[#4c9f70]" /> Product Variants
              </h2>
              <button
                type="button"
                onClick={addVariant}
                className="text-xs font-bold text-[#4c9f70] bg-transparent border-0 cursor-pointer flex items-center gap-1 hover:text-[#3d8a5e]"
              >
                <Plus size={14} /> Add Variant
              </button>
            </div>

            {variants.length === 0 ? (
              <div className="py-7 text-center border-2 border-dashed border-slate-100 rounded-xl">
                <p className="text-xs text-slate-400 m-0">No variants added. (e.g., Color, Fabric, Price)</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {variants.map((variant, idx) => (
                  <div key={idx} className="bg-slate-50 p-4 rounded-xl flex flex-col gap-3">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-[1fr_1fr_100px_36px] sm:items-end">
                      {[
                        { label: 'Fabric', field: 'fabric', type: 'text' },
                        { label: 'Variant Price', field: 'price', type: 'number' },
                        { label: 'Stock', field: 'stock', type: 'number' },
                      ].map(({ label, field, type }) => (
                        <div key={field}>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">{label}</label>
                          <input
                            required
                            type={type}
                            value={variant[field]}
                            onChange={(e) => handleVariantChange(idx, field, e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] outline-none box-border"
                          />
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => removeVariant(idx)}
                        className="p-2 text-red-300 bg-transparent border-0 cursor-pointer self-end hover:text-red-500"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Variant Color</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Royal Blue, Golden, etc."
                        value={variant.color || ''}
                        onChange={(e) => handleVariantChange(idx, 'color', e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-[13px] outline-none box-border"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pricing */}
          <div className={sectionCls}>
            <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide m-0 mb-5">Pricing</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={labelCls}>Base Price (INR)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                  <input
                    required type="number" name="price" value={formData.price}
                    onChange={handleInputChange} placeholder="0.00"
                    className={`${inputCls} pl-7`}
                  />
                </div>
              </div>
              <div>
                <label className={labelCls}>Discount Price (INR)</label>
                <div className="rounded-xl border border-green-200 overflow-hidden">
                  <div className="grid grid-cols-[auto_1fr]">
                    <span className="px-3.5 py-3 bg-green-50 text-[#4c9f70] font-bold">₹</span>
                    <input
                      type="number" name="discountPrice" value={formData.discountPrice}
                      onChange={handleInputChange} placeholder="0.00"
                      className="bg-green-50 px-3 py-3 text-sm font-bold text-[#4c9f70] border-0 outline-none"
                    />
                  </div>
                  <div className="bg-green-50 border-t border-green-200 py-2 px-3.5 text-xs font-bold text-[#4c9f70] text-center uppercase tracking-widest">
                    Sale: {formatINR(saleResult)}
                  </div>
                </div>
              </div>
              <div>
                <label className={labelCls}>Tax Included</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Yes', 'No'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setTaxIncluded(opt === 'Yes')}
                      className={`py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${(opt === 'Yes' ? taxIncluded : !taxIncluded) ? 'border-0 bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-400'}`}
                    >
                      Tax {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Inventory */}
          <div className={sectionCls}>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-sm font-extrabold text-slate-800 m-0">Inventory & Stock</h2>
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-bold text-gray-700">Unlimited</span>
                <button
                  type="button"
                  onClick={() => setIsUnlimited(!isUnlimited)}
                  className="w-11 h-5.5 rounded-full relative border-0 cursor-pointer transition-colors"
                  style={{
                    background: isUnlimited ? '#4c9f70' : '#e2e8f0',
                    width: '44px', height: '22px'
                  }}
                >
                  <div
                    className="absolute top-0.5 w-[18px] h-[18px] bg-white rounded-full transition-all shadow"
                    style={{ left: isUnlimited ? '24px' : '2px' }}
                  />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Stock Quantity</label>
                <input
                  type="number" name="stockQuantity" disabled={isUnlimited}
                  value={isUnlimited ? '' : formData.stockQuantity}
                  onChange={handleInputChange} placeholder={isUnlimited ? 'Unlimited' : '0'}
                  className={`${inputCls} ${isUnlimited ? 'opacity-50' : ''}`}
                />
              </div>
              <div>
                <label className={labelCls}>Stock Status</label>
                <div className="relative">
                  <select
                    name="stockStatus" value={formData.stockStatus} onChange={handleInputChange}
                    className={`${inputCls} appearance-none pr-9 cursor-pointer`}
                  >
                    <option>In Stock</option>
                    <option>Out of Stock</option>
                    <option>Pre-Order</option>
                  </select>
                  <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>
            <label className="flex items-center gap-3 mt-4 cursor-pointer px-3.5 py-3.5 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
              <div
                className={`w-5 h-5 rounded-[5px] flex-shrink-0 flex items-center justify-center transition-all ${isFeatured ? 'bg-[#4c9f70] border-0' : 'bg-white border-2 border-slate-300'}`}
              >
                {isFeatured && <Check size={13} className="text-white" strokeWidth={3} />}
              </div>
              <input type="checkbox" className="hidden" checked={isFeatured} onChange={() => setIsFeatured(!isFeatured)} />
              <span className="text-[13px] text-slate-500 leading-relaxed">Highlight this product in a featured top section on your storefront.</span>
            </label>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex flex-col gap-5 lg:sticky lg:top-6">

          {/* Media */}
          <div className={sectionCls}>
            <h2 className="text-sm font-extrabold text-slate-800 mb-5 mt-0">Product Media</h2>
            <div className="flex flex-col gap-3">
              <div
                onClick={() => fileInputRef.current.click()}
                className="border-2 border-dashed border-green-200 rounded-2xl bg-green-50 p-5 flex flex-col items-center justify-center min-h-[180px] cursor-pointer transition-all hover:border-[#4c9f70]"
              >
                {previews.length > 0 ? (
                  <img src={previews[0]} className="max-h-[140px] w-full object-contain rounded-xl" alt="main" />
                ) : (
                  <div className="text-center">
                    <div className="w-[52px] h-[52px] bg-white rounded-full flex items-center justify-center mx-auto mb-3">
                      <ImageIcon size={22} className="text-[#4c9f70]" />
                    </div>
                    <p className="text-[13px] font-bold text-gray-700 m-0">Drop your image here</p>
                    <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest">Supports JPG, PNG, WEBP</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2">
                {previews.slice(1).map((src, idx) => (
                  <div key={idx} className="aspect-square bg-slate-50 rounded-xl border border-slate-200 relative overflow-hidden">
                    <img src={src} className="w-full h-full object-cover" alt="thumb" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx + 1)}
                      className="absolute inset-0 bg-red-500/70 flex items-center justify-center border-0 cursor-pointer opacity-0 hover:opacity-100 transition-opacity"
                    >
                      <X size={14} className="text-white" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="aspect-square border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center cursor-pointer bg-white text-slate-400 transition-all hover:border-[#4c9f70] hover:text-[#4c9f70]"
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* ── Fixed: added accept="image/*" to restrict file picker to images only ── */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>
          </div>

          {/* Organization */}
          <div className={sectionCls}>
            <h2 className="text-sm font-extrabold text-slate-800 mb-5 mt-0">Organization</h2>
            <div className="flex flex-col gap-3.5">
              <div>
                <label className={labelCls}>Main Category</label>
                <div className="relative">
                  <select
                    required name="mainCategory" value={formData.mainCategory} onChange={handleInputChange}
                    className={`${inputCls} appearance-none pr-9 cursor-pointer`}
                  >
                    <option value="">Select Main Category</option>
                    {MAIN_CATEGORIES.map((cat) => <option key={cat.name} value={cat.name}>{cat.name}</option>)}
                  </select>
                  <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className={labelCls}>Tags / Categories</label>
                <div className="flex flex-wrap gap-2">
                  {(formData.mainCategory
                    ? MAIN_CATEGORIES.find(c => c.name === formData.mainCategory)?.categories || SUB_CATEGORIES
                    : SUB_CATEGORIES
                  ).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleCategoryToggle(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all border ${formData.categories?.includes(cat) ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-400'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 mt-5 pt-5 border-t border-slate-100">
              <button
                type="button"
                onClick={() => navigate('/products')}
                className="py-3 bg-slate-100 text-slate-500 border-0 rounded-xl text-[13px] font-bold cursor-pointer hover:bg-slate-200 transition-colors"
              >
                Dismiss
              </button>
              <button
                type="submit"
                form="main-form"
                className="py-3 bg-[#4c9f70] text-white border-0 rounded-xl text-[13px] font-bold cursor-pointer hover:bg-[#3d8a5e] transition-colors"
              >
                {isEditMode ? 'Update' : 'Publish'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
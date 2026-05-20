import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Plus, Search, Filter, Edit, Trash2,
  AlertCircle, CheckCircle2, ChevronDown, MoreHorizontal, Package,
  ToggleLeft, ToggleRight, Barcode
} from 'lucide-react';
import {
  fetchProducts, deleteProduct,
  clearProductError, clearSuccessMessage,
} from '../../features/products/productSlice';
import { fetchCategories } from '../../features/products/categorySlice';
import { useNavigate } from 'react-router-dom';
import { formatINR } from '../../utils/currency';
import api from '../../services/api';
import { resolveImageUrl, getPlaceholderImage } from '../../utils/imageUrl';
import { printProductBarcode } from '../../utils/printDocuments';

const Products = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: products, loading, error, successMessage } = useSelector((s) => s.products);
  const { categories = [] } = useSelector((s) => s.categories || {});

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All Stock');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(fetchProducts({ isAdmin: true, search: search.trim() }));
    }, 300);
    return () => clearTimeout(timer);
  }, [dispatch, search]);

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

  const handleToggle = async (id) => {
    try {
      await api.patch(`/admin/products/${id}/toggle-status`);
      dispatch(fetchProducts({ isAdmin: true }));
    } catch (error) {
      alert('Error toggling product status');
    }
  };

  const filtered = (products || []).filter((p) => {
    if (filterType === 'Low Inventory') return (p.stock || 0) > 0 && (p.stock || 0) <= 10;
    if (filterType === 'Out of Stock') return (p.stock || 0) === 0;
    return true;
  });

  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div className="flex-1 min-w-0 flex flex-col gap-6 p-6 max-sm:p-4 max-sm:gap-4">

        {/* Header */}
        <div className="flex justify-between items-center flex-wrap gap-4 max-sm:flex-col max-sm:items-start">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#85754E] rounded-2xl flex items-center justify-center shrink-0">
              <Package size={24} color="white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight m-0">Products Catalog</h1>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1 mb-0">
                Currently Managing {filtered.length} Unique Items
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap max-sm:w-full max-sm:flex-col max-sm:items-stretch">
            <div className="relative max-sm:w-full">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Deep catalog search..."
                className="pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium outline-none w-60 max-sm:w-full"
              />
            </div>
            <button
              onClick={() => navigate('/add-product')}
              className="flex items-center justify-center gap-2 bg-[#85754E] text-white px-5 py-3 rounded-2xl border-0 text-xs font-extrabold uppercase tracking-wide cursor-pointer whitespace-nowrap hover:bg-[#7a6d4a] transition-colors max-sm:w-full"
            >
              <Plus size={18} strokeWidth={3} /> Add Product
            </button>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-md overflow-hidden">

          {/* Toolbar */}
          <div className="px-6 py-5 flex justify-between items-center flex-wrap gap-3 border-b border-slate-50 bg-slate-50/50 max-sm:px-4">
            <div className="flex gap-1 bg-[#FFF5E2] p-1 rounded-2xl border border-amber-50 flex-wrap">
              {['All Stock', 'Low Inventory', 'Out of Stock'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilterType(tab)}
                  className={`px-4 py-2 rounded-xl text-sm border-0 cursor-pointer transition-all whitespace-nowrap ${
                    filterType === tab
                      ? 'bg-white font-black text-[#85754E] shadow-sm'
                      : 'bg-transparent font-extrabold text-slate-500 hover:text-[#85754E]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              {[Filter, MoreHorizontal].map((Icon, i) => (
                <button
                  key={i}
                  className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-500 cursor-pointer flex items-center justify-center hover:bg-slate-50 transition-colors"
                >
                  <Icon size={18} />
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse" style={{ minWidth: '480px' }}>
              <thead>
                <tr className="bg-gray-50 border-b border-slate-100">
                  <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left whitespace-nowrap">
                    Product Details
                  </th>
                  <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left whitespace-nowrap max-md:hidden">
                    Taxonomy
                  </th>
                  <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center whitespace-nowrap max-xs:hidden">
                    Price Points
                  </th>
                  <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center whitespace-nowrap">
                    Status
                  </th>
                  <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center whitespace-nowrap">
                    Availability
                  </th>
                  <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading && filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <div className="w-11 h-11 border-4 border-amber-100 border-t-[#85754E] rounded-full mx-auto mb-3" style={{ animation: 'spin 0.8s linear infinite' }} />
                      <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Syncing Catalog...</span>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-3">
                        <Package size={30} className="text-slate-400" />
                      </div>
                      <p className="text-xs font-extrabold text-slate-300 uppercase tracking-widest">No products matched your parameters</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((product) => (
                    <tr
                      key={product._id}
                      className="border-b border-slate-50 transition-colors hover:bg-gray-50"
                    >
                      {/* Product Details */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3.5">
                          <div className="w-14 h-14 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 shrink-0">
                            <img
                              src={resolveImageUrl(product?.image || product?.images, product?.name, { bg: '10b981' })}
                              onError={(e) => { e.target.src = getPlaceholderImage(product?.name, '10b981'); }}
                              className="w-full h-full object-cover"
                              alt={product?.name}
                            />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight m-0 overflow-hidden text-ellipsis whitespace-nowrap max-w-[180px]">
                              {product?.name || 'Unknown Item'}
                            </h4>
                            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest mb-0">
                              UID: {product?._id ? product._id.slice(-6) : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Taxonomy */}
                      <td className="px-5 py-4 max-md:hidden">
                        <div>
                          <div className="text-xs font-black uppercase tracking-wide text-slate-800">{product.mainCategory || 'General'}</div>
                          <div className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-wide">
                            {product.categories?.join(', ') || 'Unassigned'}
                          </div>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="px-5 py-4 text-center max-xs:hidden">
                        <div className="flex flex-col items-center">
                          {product.discountPrice && product.discountPrice > 0 ? (
                            <>
                              <span className="text-lg font-black text-slate-900 tracking-tight">{formatINR(product.discountPrice)}</span>
                              <span className="text-xs font-medium text-slate-400 line-through">{formatINR(product.price)}</span>
                            </>
                          ) : (
                            <span className="text-lg font-black text-slate-900 tracking-tight">{formatINR(product.price)}</span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          product.isActive !== false
                            ? 'bg-green-50 text-green-600 border border-green-100'
                            : 'bg-red-50 text-red-600 border border-red-100'
                        }`}>
                          {product.isActive !== false ? 'Active' : 'Disabled'}
                        </span>
                      </td>

                      {/* Availability */}
                      <td className="px-5 py-4 text-center">
                        <span className={`inline-block px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide ${
                          product.stock > 10
                            ? 'bg-amber-50 text-[#85754E]'
                            : product.stock > 0
                            ? 'bg-yellow-50 text-yellow-600'
                            : 'bg-red-50 text-rose-600'
                        }`}>
                          {product.stock > 0 ? 'Available' : 'Depleted'}
                        </span>
                        <div className="text-xs font-extrabold text-slate-400 mt-1 uppercase">{product.stock} units</div>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2 items-center">
                          <button
                            onClick={() => handleToggle(product._id)}
                            title={product.isActive !== false ? "Disable" : "Enable"}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border cursor-pointer hover:bg-slate-50 transition-all text-[11px] font-bold bg-white ${product.isActive !== false ? 'border-amber-200 text-amber-500' : 'border-slate-200 text-[#85754E]'}`}
                          >
                            {product.isActive !== false ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                            {product.isActive !== false ? 'Disable' : 'Enable'}
                          </button>
                          <button
                            onClick={() => printProductBarcode(product)}
                            title="Print barcode"
                            className="p-1.5 bg-white border border-slate-100 rounded-lg text-slate-400 cursor-pointer flex transition-all hover:bg-amber-50 hover:text-heritage hover:border-amber-200"
                          >
                            <Barcode size={16} />
                          </button>
                          <button
                            onClick={() => navigate(`/edit-product/${product._id}`)}
                            className="p-1.5 bg-white border border-slate-100 rounded-lg text-slate-400 cursor-pointer flex transition-all hover:bg-amber-50 hover:text-heritage hover:border-amber-200"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(product._id)}
                            className="p-1.5 bg-white border border-slate-100 rounded-lg text-slate-400 cursor-pointer flex transition-all hover:bg-red-50 hover:text-rose-500 hover:border-red-100"
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
          <div className="px-6 py-5 bg-slate-50/50 border-t border-slate-50 flex justify-between items-center flex-wrap gap-3 max-sm:flex-col max-sm:items-start max-sm:px-4">
            <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400 m-0">
              Records <span className="text-slate-900">1 - {filtered.length}</span> of {(products || []).length} entries
            </p>
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-extrabold uppercase tracking-wide text-slate-400 cursor-not-allowed opacity-50">Previous</button>
              <div className="flex gap-1.5">
                <button className="w-9 h-9 rounded-xl bg-[#85754E] text-white border-0 text-sm font-extrabold cursor-pointer">1</button>
                <button className="w-9 h-9 rounded-xl bg-white border border-slate-100 text-slate-400 text-sm font-bold cursor-pointer hover:bg-slate-50">2</button>
              </div>
              <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-extrabold uppercase tracking-wide text-slate-600 cursor-pointer hover:bg-slate-50 transition-colors">Next</button>
            </div>
          </div>
        </div>

        {/* Delete Confirm Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-lg">
            <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-sm w-full text-center">
              <div className="w-18 h-18 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-5" style={{ width: 72, height: 72 }}>
                <AlertCircle size={36} className="text-rose-600" />
              </div>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight m-0">Purge Product?</h3>
              <p className="text-sm text-slate-500 mt-3 leading-relaxed">This record will be permanently deleted from the primary database cluster.</p>
              <div className="flex gap-3 mt-7">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-3.5 bg-slate-100 text-slate-500 border-0 rounded-2xl text-xs font-extrabold uppercase tracking-wide cursor-pointer hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 py-3.5 bg-rose-600 text-white border-0 rounded-2xl text-xs font-extrabold uppercase tracking-wide cursor-pointer hover:bg-rose-700 transition-colors"
                >
                  Confirm Purge
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Toast */}
        {successMessage && (
          <div className="fixed bottom-8 right-8 z-[1000] bg-[#85754E] text-white px-6 py-4 rounded-2xl shadow-lg shadow-amber-400/30 flex items-center gap-3">
            <CheckCircle2 size={22} />
            <span className="text-xs font-extrabold uppercase tracking-wide">{successMessage}</span>
          </div>
        )}
      </div>
    </>
  );
};

export default Products;

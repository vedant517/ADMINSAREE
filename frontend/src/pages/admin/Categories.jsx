import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import {
  Plus, Trash2, Edit2, Image as ImageIcon,
  X, Loader2, Upload, RefreshCw, Link
} from 'lucide-react';

const resolveImageUrl = (image) => {
  if (!image) return null;
  if (typeof image === 'string' && image.trim() !== '') return image.trim();
  if (typeof image === 'object') {
    return image.secure_url || image.url || image.path || image.Location || null;
  }
  return null;
};

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', image: null, imageUrl: '', isMain: false });
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [imgErrors, setImgErrors] = useState({});
  const [urlInputMode, setUrlInputMode] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/categories');
      setCategories(data.data);
      setImgErrors({});
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (preview && preview.startsWith('blob:')) URL.revokeObjectURL(preview);
      setFormData(prev => ({ ...prev, image: file, imageUrl: '' }));
      setPreview(URL.createObjectURL(file));
      setUrlInputMode(false);
    }
  };

  const handleUrlInput = (url) => {
    setFormData(prev => ({ ...prev, imageUrl: url, image: null }));
    setPreview(url.trim() ? url.trim() : null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = new FormData();
    payload.append('name', formData.name);
    payload.append('isMain', formData.isMain);
    if (formData.image instanceof File) {
      payload.append('image', formData.image);
    } else if (formData.imageUrl && typeof formData.imageUrl === 'string' && formData.imageUrl.trim() !== '') {
      payload.append('imageUrl', formData.imageUrl.trim());
    }
    const config = { headers: { 'Content-Type': 'multipart/form-data' } };
    try {
      let savedCategory;
      if (editingId) {
        const { data } = await api.put(`/categories/${editingId}`, payload, config);
        savedCategory = data.data;
        setCategories(prev => prev.map(c => c._id === editingId ? savedCategory : c));
      } else {
        const { data } = await api.post('/categories', payload, config);
        savedCategory = data.data;
        setCategories(prev => [savedCategory, ...prev]);
      }
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      alert(error.response?.data?.message || 'Something went wrong. Make sure you are logged in as an admin.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    if (preview && preview.startsWith('blob:')) URL.revokeObjectURL(preview);
    setFormData({ name: '', image: null, imageUrl: '', isMain: false });
    setPreview(null);
    setUrlInputMode(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await api.delete(`/categories/${id}`);
      setCategories(prev => prev.filter(c => c._id !== id));
    } catch {
      alert('Error deleting category');
    }
  };

  const startEdit = (cat) => {
    setEditingId(cat._id);
    const existingUrl = resolveImageUrl(cat.image) || '';
    setFormData({ name: cat.name, image: null, imageUrl: existingUrl, isMain: cat.isMain || false });
    setPreview(existingUrl || null);
    setUrlInputMode(!!existingUrl);
    setShowAddModal(true);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-[80vh]">
      <Loader2 className="animate-spin text-emerald-500" size={40} />
    </div>
  );

  return (
    <div className="px-4 py-8 max-w-7xl mx-auto sm:px-6 lg:px-8">

      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Category Management</h1>
          <p className="text-sm text-slate-500 mt-1">Add, edit and manage your product categories.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchCategories}
            title="Refresh list"
            className="flex items-center gap-1.5 bg-slate-100 text-slate-600 border-0 px-3.5 py-2.5 rounded-xl font-semibold cursor-pointer text-sm hover:bg-slate-200 transition-colors"
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={() => { resetForm(); setShowAddModal(true); }}
            className="flex items-center gap-2 bg-emerald-500 text-white border-0 px-5 py-2.5 rounded-xl font-bold cursor-pointer text-sm shadow-lg shadow-emerald-200 hover:bg-emerald-600 transition-colors"
          >
            <Plus size={18} /> Add New Category
          </button>
        </div>
      </div>

      {/* Empty state */}
      {categories.length === 0 && (
        <div className="text-center py-20 text-slate-400">
          <ImageIcon size={52} className="mx-auto mb-4 opacity-35" />
          <p className="text-base font-medium">No categories yet. Add your first one!</p>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {categories.map((cat) => {
          const imgSrc = resolveImageUrl(cat.image);
          const hasError = imgErrors[cat._id];
          return (
            <div key={cat._id} className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-shadow duration-300">
              {/* Image */}
              <div className="w-full h-44 relative bg-slate-100 overflow-hidden">
                {imgSrc && !hasError ? (
                  <img
                    src={imgSrc}
                    alt={cat.name}
                    className="w-full h-full object-cover"
                    onError={() => setImgErrors(prev => ({ ...prev, [cat._id]: true }))}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-1.5">
                    <ImageIcon size={36} />
                    {hasError && <span className="text-xs text-red-400 font-medium">Image failed to load</span>}
                  </div>
                )}
                {cat.isMain && (
                  <div className="absolute top-2.5 right-2.5 bg-emerald-500 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide shadow-lg shadow-emerald-300">
                    Featured
                  </div>
                )}
              </div>
              {/* Body */}
              <div className="px-5 py-4">
                <div className="flex justify-between items-center">
                  <div className="min-w-0 mr-3">
                    <h3 className="text-base font-bold text-slate-800 truncate">{cat.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">/{cat.slug}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => startEdit(cat)}
                      title="Edit"
                      className="p-2 rounded-lg border border-slate-200 bg-white text-slate-500 cursor-pointer hover:opacity-80 hover:scale-105 transition-all"
                    ><Edit2 size={15} /></button>
                    <button
                      onClick={() => handleDelete(cat._id)}
                      title="Delete"
                      className="p-2 rounded-lg border border-red-100 bg-red-50 text-red-500 cursor-pointer hover:opacity-80 hover:scale-105 transition-all"
                    ><Trash2 size={15} /></button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-slate-900/55 backdrop-blur-sm flex items-center justify-center z-[1000] p-5"
          onClick={(e) => { if (e.target === e.currentTarget) { setShowAddModal(false); resetForm(); } }}
        >
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl max-h-[95vh] overflow-y-auto">
            {/* Modal header */}
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-extrabold text-slate-900">{editingId ? 'Edit Category' : 'Add Category'}</h2>
              <button
                onClick={() => { setShowAddModal(false); resetForm(); }}
                className="border-0 bg-slate-100 rounded-lg cursor-pointer text-slate-500 p-1.5 flex hover:bg-slate-200 transition-colors"
              ><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              {/* Name */}
              <div className="mb-5">
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  placeholder="e.g. Wedding Collection"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none text-sm text-slate-800 focus:border-emerald-500 transition-colors box-border"
                />
              </div>

              {/* Image Section */}
              <div className="mb-5">
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">
                  Category Image
                </label>

                {/* Tab switcher */}
                <div className="flex rounded-xl overflow-hidden border border-slate-200 mb-3 bg-slate-50">
                  <button
                    type="button"
                    onClick={() => setUrlInputMode(false)}
                    className={`flex-1 py-2.5 border-0 cursor-pointer text-sm font-semibold flex items-center justify-center gap-1.5 transition-all border-r border-slate-200 ${!urlInputMode ? 'bg-emerald-500 text-white' : 'bg-transparent text-slate-500 hover:bg-slate-100'}`}
                  >
                    <Upload size={14} /> Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setUrlInputMode(true)}
                    className={`flex-1 py-2.5 border-0 cursor-pointer text-sm font-semibold flex items-center justify-center gap-1.5 transition-all ${urlInputMode ? 'bg-emerald-500 text-white' : 'bg-transparent text-slate-500 hover:bg-slate-100'}`}
                  >
                    <Link size={14} /> Paste URL
                  </button>
                </div>

                {/* Upload zone */}
                {!urlInputMode && (
                  <div
                    className="border-2 border-dashed border-slate-200 rounded-2xl h-44 flex flex-col items-center justify-center cursor-pointer overflow-hidden bg-slate-50 hover:border-emerald-500 hover:bg-emerald-50 transition-all relative"
                    onClick={() => fileInputRef.current.click()}
                  >
                    {preview && formData.image instanceof File ? (
                      <img src={preview} alt="Preview" className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} />
                    ) : (
                      <>
                        <Upload size={30} className="text-slate-400" />
                        <p className="text-sm text-slate-600 mt-2 mb-0.5 font-medium">Click to upload</p>
                        <p className="text-xs text-slate-400">PNG, JPG, WEBP — max 10 MB</p>
                      </>
                    )}
                  </div>
                )}

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                />

                {/* URL input */}
                {urlInputMode && (
                  <div>
                    <input
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) => handleUrlInput(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none text-sm text-slate-800 mb-2.5 focus:border-emerald-500 transition-colors box-border"
                    />
                    {preview && (
                      <div className="w-full h-36 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                        <img
                          src={preview}
                          alt="URL Preview"
                          className="w-full h-full object-cover block"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div className="hidden w-full h-full items-center justify-center text-red-400 text-xs font-medium flex-col gap-1.5">
                          <ImageIcon size={28} className="text-red-400" />
                          Invalid image URL
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Remove button for file */}
                {!urlInputMode && preview && formData.image instanceof File && (
                  <div className="flex items-center justify-between mt-2.5">
                    <span className="text-xs text-slate-500 overflow-hidden text-ellipsis whitespace-nowrap max-w-[75%]">
                      📁 {formData.image.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (preview.startsWith('blob:')) URL.revokeObjectURL(preview);
                        setPreview(null);
                        setFormData(prev => ({ ...prev, image: null, imageUrl: '' }));
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="text-xs text-red-500 bg-transparent border-0 cursor-pointer font-semibold flex-shrink-0"
                    >✕ Remove</button>
                  </div>
                )}
              </div>

              {/* isMain */}
              <div className="mb-7 flex items-center gap-3 px-4 py-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <input
                  type="checkbox"
                  id="isMain"
                  checked={formData.isMain}
                  onChange={(e) => setFormData(prev => ({ ...prev, isMain: e.target.checked }))}
                  className="w-4.5 h-4.5 accent-emerald-500 flex-shrink-0 cursor-pointer"
                  style={{ width: '18px', height: '18px' }}
                />
                <label htmlFor="isMain" className="text-sm font-semibold text-slate-500 cursor-pointer m-0">
                  Show on Home Page Showcase
                </label>
              </div>

              {/* Submit */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); resetForm(); }}
                  className="flex-1 py-3 rounded-xl border border-slate-200 bg-white font-semibold cursor-pointer text-sm text-slate-500 hover:bg-slate-50 transition-colors"
                >Cancel</button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`flex-[2] py-3 rounded-xl border-0 text-white font-bold cursor-pointer text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${submitting ? 'bg-emerald-300 cursor-not-allowed shadow-none' : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200'}`}
                >
                  {submitting
                    ? <><Loader2 size={16} className="animate-spin" /> Saving...</>
                    : (editingId ? '💾 Save Changes' : '✚ Create Category')
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
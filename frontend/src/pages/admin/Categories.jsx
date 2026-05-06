import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import {
  Plus,
  Trash2,
  Edit2,
  Image as ImageIcon,
  X,
  Loader2,
  Upload,
  RefreshCw
} from 'lucide-react';

// ─── helper: always get a plain string URL from whatever image field contains ───
const resolveImageUrl = (image) => {
  if (!image) return null;
  if (typeof image === 'string' && image.trim() !== '') return image.trim();
  if (typeof image === 'object') {
    return (
      image.secure_url ||
      image.url ||
      image.path ||
      image.Location ||   // AWS S3
      null
    );
  }
  return null;
};

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    image: null,
    imageUrl: '',
    isMain: false
  });
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [imgErrors, setImgErrors] = useState({});
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/categories');
      console.log('[Categories] raw API response:', JSON.stringify(data.data?.slice(0, 2)));
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
    }
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

    try {
      let savedCategory;
      if (editingId) {
        const { data } = await api.put(`/categories/${editingId}`, payload);
        savedCategory = data.data;
        console.log('[Categories] updated category:', JSON.stringify(savedCategory));
        setCategories(prev => prev.map(c => c._id === editingId ? savedCategory : c));
      } else {
        const { data } = await api.post('/categories', payload);
        savedCategory = data.data;
        console.log('[Categories] created category:', JSON.stringify(savedCategory));
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
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await api.delete(`/categories/${id}`);
      setCategories(prev => prev.filter(c => c._id !== id));
    } catch (error) {
      alert('Error deleting category');
    }
  };

  const startEdit = (cat) => {
    setEditingId(cat._id);
    const existingUrl = resolveImageUrl(cat.image) || '';
    setFormData({
      name: cat.name,
      image: null,
      imageUrl: existingUrl,
      isMain: cat.isMain || false
    });
    setPreview(existingUrl || null);
    setShowAddModal(true);
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
      <Loader2 className="animate-spin" size={40} color="#10b981" />
    </div>
  );

  return (
    <>
      <style>{`
        .categories-wrapper { padding: 32px; max-width: 1200px; margin: 0 auto; }
        .categories-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 32px; flex-wrap: wrap; gap: 16px;
        }
        .categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px;
        }
        .cat-card {
          background: #fff; border-radius: 16px; overflow: hidden;
          border: 1px solid #f1f5f9; transition: box-shadow 0.3s;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }
        .cat-card:hover { box-shadow: 0 10px 25px -5px rgba(0,0,0,0.10); }
        .cat-img-wrap {
          width: 100%; height: 180px; position: relative;
          background: #f1f5f9; overflow: hidden;
        }
        .cat-img-wrap img {
          width: 100%; height: 100%; object-fit: cover; display: block;
        }
        .cat-img-placeholder {
          width: 100%; height: 100%;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          color: #cbd5e1; gap: 6px;
        }
        .categories-modal-overlay {
          position: fixed; inset: 0;
          background: rgba(15,23,42,0.55); backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center;
          z-index: 1000; padding: 20px;
        }
        .categories-modal-box {
          background: #fff; border-radius: 24px; width: 100%; max-width: 500px;
          box-shadow: 0 25px 60px -12px rgba(0,0,0,0.3);
          max-height: 95vh; overflow-y: auto;
        }
        .upload-zone {
          border: 2px dashed #e2e8f0; border-radius: 16px; height: 170px;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          cursor: pointer; overflow: hidden; background: #f8fafc; transition: border-color 0.2s;
          position: relative;
        }
        .upload-zone:hover { border-color: #10b981; background: #f0fdf4; }
        .upload-zone img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .btn-icon {
          padding: 8px; border-radius: 8px; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.15s;
        }
        .btn-icon:hover { opacity: 0.8; transform: scale(1.05); }
        @media (max-width: 768px) {
          .categories-wrapper { padding: 20px 16px; }
          .categories-header { flex-direction: column; align-items: flex-start; }
          .categories-grid { grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; }
        }
        @media (max-width: 480px) {
          .categories-wrapper { padding: 16px 12px; }
          .categories-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="categories-wrapper">

        {/* ── Header ── */}
        <div className="categories-header">
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', marginBottom: '6px', margin: 0 }}>
              Category Management
            </h1>
            <p style={{ color: '#64748b', fontSize: '14px', marginTop: '6px', marginBottom: 0 }}>
              Add, edit and manage your product categories.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={fetchCategories}
              title="Refresh list"
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: '#f1f5f9', color: '#475569', border: 'none',
                padding: '11px 14px', borderRadius: '12px', fontWeight: 600,
                cursor: 'pointer', fontSize: '14px',
              }}
            >
              <RefreshCw size={16} />
            </button>
            <button
              onClick={() => { resetForm(); setShowAddModal(true); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: '#10b981', color: '#fff', border: 'none',
                padding: '11px 20px', borderRadius: '12px', fontWeight: 700,
                cursor: 'pointer', fontSize: '14px',
                boxShadow: '0 4px 14px rgba(16,185,129,0.25)',
              }}
            >
              <Plus size={18} /> Add New Category
            </button>
          </div>
        </div>

        {/* ── Empty state ── */}
        {categories.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: '#94a3b8' }}>
            <ImageIcon size={52} style={{ marginBottom: '16px', opacity: 0.35 }} />
            <p style={{ fontSize: '16px', margin: 0, fontWeight: 500 }}>No categories yet. Add your first one!</p>
          </div>
        )}

        {/* ── Grid ── */}
        <div className="categories-grid">
          {categories.map((cat) => {
            const imgSrc = resolveImageUrl(cat.image);
            const hasError = imgErrors[cat._id];

            return (
              <div key={cat._id} className="cat-card">

                {/* Image */}
                <div className="cat-img-wrap">
                  {imgSrc && !hasError ? (
                    <img
                      src={imgSrc}
                      alt={cat.name}
                      onError={() => {
                        console.warn(`[Categories] image failed to load for "${cat.name}":`, imgSrc);
                        setImgErrors(prev => ({ ...prev, [cat._id]: true }));
                      }}
                    />
                  ) : (
                    <div className="cat-img-placeholder">
                      <ImageIcon size={36} />
                      {hasError && (
                        <span style={{ fontSize: '11px', color: '#f87171', fontWeight: 500 }}>
                          Image failed to load
                        </span>
                      )}
                    </div>
                  )}

                  {cat.isMain && (
                    <div style={{
                      position: 'absolute', top: '10px', right: '10px',
                      background: '#10b981', color: '#fff', padding: '3px 10px',
                      borderRadius: '20px', fontSize: '10px', fontWeight: 700,
                      textTransform: 'uppercase', letterSpacing: '0.06em',
                      boxShadow: '0 2px 8px rgba(16,185,129,0.4)',
                    }}>Featured</div>
                  )}
                </div>

                {/* Body */}
                <div style={{ padding: '18px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ minWidth: 0, marginRight: '12px' }}>
                      <h3 style={{
                        fontSize: '17px', fontWeight: 700, color: '#1e293b',
                        margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                      }}>{cat.name}</h3>
                      <p style={{ fontSize: '12px', color: '#94a3b8', margin: '3px 0 0 0' }}>/{cat.slug}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                      <button
                        className="btn-icon"
                        onClick={() => startEdit(cat)}
                        title="Edit"
                        style={{ border: '1px solid #e2e8f0', background: '#fff', color: '#64748b' }}
                      ><Edit2 size={15} /></button>
                      <button
                        className="btn-icon"
                        onClick={() => handleDelete(cat._id)}
                        title="Delete"
                        style={{ border: '1px solid #fee2e2', background: '#fef2f2', color: '#ef4444' }}
                      ><Trash2 size={15} /></button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Modal ── */}
        {showAddModal && (
          <div
            className="categories-modal-overlay"
            onClick={(e) => { if (e.target === e.currentTarget) { setShowAddModal(false); resetForm(); } }}
          >
            <div className="categories-modal-box">

              {/* Modal header */}
              <div style={{
                padding: '22px 24px', borderBottom: '1px solid #f1f5f9',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                  {editingId ? 'Edit Category' : 'Add Category'}
                </h2>
                <button
                  onClick={() => { setShowAddModal(false); resetForm(); }}
                  style={{ border: 'none', background: '#f1f5f9', borderRadius: '8px', cursor: 'pointer', color: '#64748b', padding: '6px 7px', display: 'flex' }}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} style={{ padding: '24px' }}>

                {/* Name */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    placeholder="e.g. Wedding Collection"
                    style={{
                      width: '100%', padding: '12px 16px', borderRadius: '12px',
                      border: '1.5px solid #e2e8f0', outline: 'none', fontSize: '14px',
                      boxSizing: 'border-box', color: '#1e293b',
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#10b981'}
                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                  />
                </div>

                {/* Image upload */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Category Image
                  </label>

                  <div className="upload-zone" onClick={() => fileInputRef.current.click()}>
                    {preview ? (
                      <img src={preview} alt="Preview" onError={(e) => e.target.style.display = 'none'} />
                    ) : (
                      <>
                        <Upload size={30} color="#94a3b8" />
                        <p style={{ fontSize: '13px', color: '#64748b', margin: '8px 0 2px', fontWeight: 500 }}>
                          Click to upload
                        </p>
                        <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>
                          PNG, JPG, WEBP — max 10 MB
                        </p>
                      </>
                    )}
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    accept="image/png,image/jpeg,image/webp,image/gif"
                  />

                  {preview && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
                      <span style={{ fontSize: '12px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '75%' }}>
                        {formData.image instanceof File
                          ? `📁 ${formData.image.name}`
                          : `🔗 ${formData.imageUrl}`}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (preview.startsWith('blob:')) URL.revokeObjectURL(preview);
                          setPreview(null);
                          setFormData(prev => ({ ...prev, image: null, imageUrl: '' }));
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        style={{ fontSize: '12px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, flexShrink: 0 }}
                      >✕ Remove</button>
                    </div>
                  )}
                </div>

                {/* isMain */}
                <div style={{
                  marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '14px 16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9'
                }}>
                  <input
                    type="checkbox"
                    id="isMain"
                    checked={formData.isMain}
                    onChange={(e) => setFormData(prev => ({ ...prev, isMain: e.target.checked }))}
                    style={{ width: '18px', height: '18px', accentColor: '#10b981', flexShrink: 0, cursor: 'pointer' }}
                  />
                  <label htmlFor="isMain" style={{ fontSize: '14px', fontWeight: 600, color: '#475569', cursor: 'pointer', margin: 0 }}>
                    Show on Home Page Showcase
                  </label>
                </div>

                {/* Submit */}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => { setShowAddModal(false); resetForm(); }}
                    style={{
                      flex: 1, padding: '13px', borderRadius: '12px',
                      border: '1.5px solid #e2e8f0', background: '#fff',
                      fontWeight: 600, cursor: 'pointer', fontSize: '14px', color: '#475569',
                    }}
                  >Cancel</button>

                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      flex: 2, padding: '13px', borderRadius: '12px', border: 'none',
                      background: submitting ? '#6ee7b7' : '#10b981',
                      color: '#fff', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer',
                      fontSize: '14px', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', gap: '8px',
                      boxShadow: submitting ? 'none' : '0 4px 14px rgba(16,185,129,0.3)',
                    }}
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
    </>
  );
};

export default Categories;
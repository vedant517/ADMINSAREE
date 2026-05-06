import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Image as ImageIcon, 
  Check, 
  X,
  Layers,
  Search,
  ExternalLink,
  Loader2,
  Upload
} from 'lucide-react';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    image: null,
    imageUrl: '', // For existing images or fallback
    isMain: false
  });
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  // Helper to resolve image URLs (handles local paths starting with /uploads)
  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    if (path.startsWith('/uploads')) {
      // In development, we use the proxy, so same host works.
      // But adding a fallback source or explicit proxy handling is safer.
      return path;
    }
    return path;
  };

  const handleImageError = (e, name) => {
    e.target.onerror = null; // Prevent infinite loop
    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Category')}&background=random&size=400&bold=true`;
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(data.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    const data = new FormData();
    data.append('name', formData.name);
    data.append('isMain', formData.isMain);
    if (formData.image) {
      data.append('image', formData.image);
    } else if (formData.imageUrl) {
      data.append('imageUrl', formData.imageUrl);
    }

    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };

      if (editingId) {
        await api.put(`/categories/${editingId}`, data, config);
      } else {
        await api.post('/categories', data, config);
      }
      setShowAddModal(false);
      resetForm();
      fetchCategories();
    } catch (error) {
      console.error('Submit error:', error);
      alert(error.response?.data?.message || 'Something went wrong. Make sure you are logged in as an admin.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ name: '', image: null, imageUrl: '', isMain: false });
    setPreview(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await api.delete(`/categories/${id}`);
      fetchCategories();
    } catch (error) {
      alert('Error deleting category');
    }
  };

  const startEdit = (cat) => {
    setEditingId(cat._id);
    setFormData({
      name: cat.name,
      image: null,
      imageUrl: cat.image || '',
      isMain: cat.isMain || false
    });
    setPreview(cat.image || null);
    setShowAddModal(true);
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
      <Loader2 className="animate-spin" size={40} color="#10b981" />
    </div>
  );

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>Category Management</h1>
          <p style={{ color: '#64748b', fontSize: '14px' }}>Add, edit and manage your product categories.</p>
        </div>
        <button 
          onClick={() => { setShowAddModal(true); resetForm(); }}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: '#10b981', color: '#fff', border: 'none',
            padding: '12px 20px', borderRadius: '12px', fontWeight: 600,
            cursor: 'pointer', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <Plus size={20} /> Add New Category
        </button>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
        {categories.map((cat) => (
          <div key={cat._id} style={{ 
            background: '#fff', borderRadius: '16px', overflow: 'hidden',
            border: '1px solid #f1f5f9', transition: 'all 0.3s',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}
          onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0,0,0,0.05)'}
          onMouseOut={(e) => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.02)'}
          >
            <div style={{ height: '160px', position: 'relative', background: '#f8fafc' }}>
              {cat.image ? (
                <img 
                  src={getImageUrl(cat.image)} 
                  alt={cat.name} 
                  onError={(e) => handleImageError(e, cat.name)}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              ) : (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}>
                  <ImageIcon size={48} />
                </div>
              )}
              {cat.isMain && (
                <div style={{ 
                  position: 'absolute', top: '12px', right: '12px',
                  background: '#10b981', color: '#fff', padding: '4px 10px',
                  borderRadius: '20px', fontSize: '10px', fontWeight: 700,
                  textTransform: 'uppercase'
                }}>Featured</div>
              )}
            </div>
            
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b' }}>{cat.name}</h3>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => startEdit(cat)}
                    style={{ padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', color: '#64748b' }}
                  ><Edit2 size={16} /></button>
                  <button 
                    onClick={() => handleDelete(cat._id)}
                    style={{ padding: '8px', borderRadius: '8px', border: '1px solid #fee2e2', background: '#fef2f2', cursor: 'pointer', color: '#ef4444' }}
                  ><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: '#fff', borderRadius: '24px', width: '100%', maxWidth: '500px',
            overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
          }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 800 }}>{editingId ? 'Edit Category' : 'Add Category'}</h2>
              <button onClick={() => setShowAddModal(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8' }}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
              {/* Category Name */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Category Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  placeholder="e.g. Wedding Collection"
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px' }}
                />
              </div>

              {/* Image Upload */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Category Image</label>
                <div 
                  onClick={() => fileInputRef.current.click()}
                  style={{
                    border: '2px dashed #e2e8f0',
                    borderRadius: '16px',
                    height: '160px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    background: '#f8fafc',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.borderColor = '#10b981'}
                  onMouseOut={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                >
                  {preview ? (
                    <img 
                      src={preview} 
                      alt="Preview" 
                      onError={(e) => handleImageError(e, 'Preview')}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  ) : (
                    <>
                      <Upload size={32} color="#94a3b8" />
                      <p style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>Click to upload image</p>
                    </>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  accept="image/*"
                />
              </div>

              {/* Show on Home Page */}
              <div style={{ marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input 
                  type="checkbox" 
                  id="isMain"
                  checked={formData.isMain}
                  onChange={(e) => setFormData({...formData, isMain: e.target.checked})}
                  style={{ width: '18px', height: '18px', accentColor: '#10b981' }}
                />
                <label htmlFor="isMain" style={{ fontSize: '14px', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
                  Show on Home Page Showcase
                </label>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', fontWeight: 600, cursor: 'pointer' }}
                >Cancel</button>
                <button 
                  type="submit"
                  disabled={submitting}
                  style={{ 
                    flex: 1, padding: '12px', borderRadius: '12px', border: 'none', 
                    background: '#10b981', color: '#fff', fontWeight: 600, cursor: 'pointer',
                    opacity: submitting ? 0.7 : 1
                  }}
                >
                  {submitting ? 'Saving...' : (editingId ? 'Save Changes' : 'Create Category')}
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

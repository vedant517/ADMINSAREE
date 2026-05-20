import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Link } from 'react-router-dom';
import { resolveImageUrl, getPlaceholderImage } from '../../utils/imageUrl';

const CategoryShowcase = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/products/main-categories');
        setCategories(data.data);
      } catch (error) {
        console.error('Error fetching main categories:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleImageError = (e, name) => {
    e.target.onerror = null;
    e.target.src = getPlaceholderImage(name || 'Category');
  };

  if (loading) return null;

  return (
    <section style={{ padding: '80px 24px', background: '#fff' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', marginBottom: '16px' }}>
          <img src="/assets/ornament-left.png" alt="" style={{ height: '24px', opacity: 0.6 }} onError={(e) => e.target.style.display='none'} />
          <h2 style={{ 
            fontSize: '42px', 
            fontFamily: "'Playfair Display', serif", 
            color: '#1a1a1a',
            margin: 0,
            fontWeight: 400
          }}>
            Explore by Category
          </h2>
          <img src="/assets/ornament-right.png" alt="" style={{ height: '24px', opacity: 0.6 }} onError={(e) => e.target.style.display='none'} />
        </div>
        <p style={{ color: '#666', fontSize: '16px', marginBottom: '60px', maxWidth: '600px', margin: '0 auto 60px' }}>
          Discover sarees crafted for every occasion, mood, and moment of elegance.
        </p>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', 
          gap: '24px',
          marginBottom: '40px'
        }}>
          {categories.map((cat) => (
            <Link 
              key={cat.name} 
              to={`/shop?category=${cat.name}`} 
              style={{ textDecoration: 'none', color: 'inherit', group: 'true' }}
            >
              <div style={{ 
                position: 'relative', 
                overflow: 'hidden', 
                borderRadius: '8px',
                border: '12px solid transparent',
                borderImage: 'url(/assets/gold-frame.png) 30 stretch',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                transition: 'transform 0.3s ease',
                aspectRatio: '3/4',
                background: '#f8f8f8'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <img 
                  src={resolveImageUrl(cat.image, cat.name)} 
                  alt={cat.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  onError={(e) => handleImageError(e, cat.name)}
                />
              </div>
              <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px', fontWeight: 500, color: '#333' }}>{cat.name}</span>
                <span style={{ fontSize: '20px', color: '#999' }}>→</span>
              </div>
            </Link>
          ))}
        </div>

        <Link to="/shop" style={{
          display: 'inline-block',
          padding: '12px 32px',
          border: '1px solid #d4af37',
          color: '#333',
          textDecoration: 'none',
          fontSize: '14px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '1px',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => { e.target.style.background = '#d4af37'; e.target.style.color = '#fff'; }}
        onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#333'; }}
        >
          View All →
        </Link>
      </div>
    </section>
  );
};

export default CategoryShowcase;

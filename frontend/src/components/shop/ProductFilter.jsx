import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronDown, ChevronUp, Filter, X } from 'lucide-react';

const ProductFilter = ({ onFilterChange }) => {
  const [subCategories, setSubCategories] = useState([]);
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [expanded, setExpanded] = useState({
    categories: true,
    color: true,
    price: true,
    fabric: true
  });

  const [filters, setFilters] = useState({
    categories: [],
    color: '',
    priceRange: [0, 50000],
    fabric: ''
  });

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const res = await axios.get('/api/metadata');
        setSubCategories(res.data.data.categories);
        setColors(res.data.data.colors);
      } catch (error) {
        console.error('Error fetching filter metadata:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMetadata();
  }, []);

  const toggleSection = (section) => {
    setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleCategoryToggle = (cat) => {
    const newCats = filters.categories.includes(cat)
      ? filters.categories.filter(c => c !== cat)
      : [...filters.categories, cat];
    
    const newFilters = { ...filters, categories: newCats };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleColorSelect = (color) => {
    const newFilters = { ...filters, color: filters.color === color ? '' : color };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const sectionHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 0',
    cursor: 'pointer',
    borderBottom: '1px solid #f0f0f0',
    fontSize: '14px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#333'
  };

  if (loading) return <div style={{ width: '280px', padding: '20px' }}>Loading filters...</div>;

  return (
    <aside style={{ width: '280px', padding: '0 20px', background: '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '20px 0', borderBottom: '1px solid #000' }}>
        <Filter size={18} />
        <span style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase' }}>Hide Filter</span>
      </div>

      {/* CATEGORIES */}
      <div>
        <div style={sectionHeaderStyle} onClick={() => toggleSection('categories')}>
          CATEGORIES
          {expanded.categories ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
        {expanded.categories && (
          <div style={{ padding: '16px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {subCategories.map(cat => (
              <label key={cat} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#666' }}>
                <input 
                  type="checkbox" 
                  checked={filters.categories.includes(cat)}
                  onChange={() => handleCategoryToggle(cat)}
                  style={{ accentColor: '#000' }}
                />
                {cat}
              </label>
            ))}
          </div>
        )}
      </div>

      {/* COLOR */}
      <div>
        <div style={sectionHeaderStyle} onClick={() => toggleSection('color')}>
          COLOR
          {expanded.color ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
        {expanded.color && (
          <div style={{ padding: '16px 0', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {colors.map(c => (
              <button
                key={c.name}
                onClick={() => handleColorSelect(c.name)}
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: c.hex,
                  border: filters.color === c.name ? '2px solid #000' : '1px solid #e0e0e0',
                  cursor: 'pointer',
                  padding: 0,
                  boxSizing: 'content-box'
                }}
                title={c.name}
              />
            ))}
          </div>
        )}
      </div>

      {/* PRICE */}
      <div>
        <div style={sectionHeaderStyle} onClick={() => toggleSection('price')}>
          PRICE
          {expanded.price ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
        {expanded.price && (
          <div style={{ padding: '16px 0' }}>
            <input 
              type="range" 
              min="0" 
              max="100000" 
              step="1000" 
              style={{ width: '100%', accentColor: '#000' }} 
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginTop: '8px', color: '#888' }}>
              <span>₹0</span>
              <span>₹1,00,000+</span>
            </div>
          </div>
        )}
      </div>

      {/* FABRIC */}
      <div>
        <div style={sectionHeaderStyle} onClick={() => toggleSection('fabric')}>
          FABRIC
          {expanded.fabric ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
        {expanded.fabric && (
          <div style={{ padding: '16px 0' }}>
            {['Silk', 'Cotton', 'Chiffon', 'Georgette'].map(fabric => (
              <label key={fabric} style={{ display: 'block', padding: '4px 0', fontSize: '13px', color: '#666', cursor: 'pointer' }}>
                <input type="radio" name="fabric" style={{ marginRight: '8px', accentColor: '#000' }} />
                {fabric}
              </label>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
};

export default ProductFilter;

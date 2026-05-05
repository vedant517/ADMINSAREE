import React, { useState } from 'react';
import api from '../../services/api';
import { Phone, Mail, Send, CheckCircle2, AlertCircle } from 'lucide-react';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    contactNo: '',
    email: '',
    message: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });
    
    try {
      const { data } = await api.post('/enquiries', formData);
      if (data.success) {
        setStatus({ type: 'success', message: 'Thank you! Your enquiry has been sent successfully.' });
        setFormData({ name: '', contactNo: '', email: '', message: '' });
      }
    } catch (error) {
      setStatus({ 
        type: 'error', 
        message: error.response?.data?.message || 'Something went wrong. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#fff', 
      padding: '40px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '"Outfit", sans-serif'
    }}>
      <div style={{ 
        maxWidth: '1000px', 
        width: '100%',
        background: '#fff',
        borderRadius: '40px',
        border: '1px solid #e5e7eb',
        position: 'relative',
        padding: '60px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.05)',
        overflow: 'hidden'
      }}>
        {/* Decorative Frame Corners */}
        <div style={{ position: 'absolute', top: '20px', left: '20px', width: '100px', height: '100px', borderTop: '2px solid #8b7355', borderLeft: '2px solid #8b7355', borderRadius: '20px 0 0 0' }}></div>
        <div style={{ position: 'absolute', bottom: '20px', right: '20px', width: '100px', height: '100px', borderBottom: '2px solid #8b7355', borderRight: '2px solid #8b7355', borderRadius: '0 0 20px 0' }}></div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', position: 'relative', zIndex: 1 }}>
          
          {/* Left Side: Info & Art */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <p style={{ 
                fontSize: '18px', 
                color: '#4b5563', 
                lineHeight: '1.6',
                marginBottom: '40px',
                maxWidth: '320px'
              }}>
                Connect with us for any inquiries, assistance, or personalized styling support.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '40px', height: '40px', background: '#8b7355', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                    <Phone size={20} />
                  </div>
                  <span style={{ fontSize: '18px', fontWeight: 600, color: '#1f2937' }}>+91 8585 454 454</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '40px', height: '40px', background: '#8b7355', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                    <Mail size={20} />
                  </div>
                  <span style={{ fontSize: '18px', fontWeight: 600, color: '#1f2937' }}>sheetalya@gmail.com</span>
                </div>
              </div>
            </div>

            {/* Traditional Art (Placeholder/Illustration) */}
            <div style={{ marginTop: '40px' }}>
              <img 
                src="https://images.unsplash.com/photo-1582201942988-13e60e4556ee?w=400&auto=format&fit=crop" 
                alt="Traditional Indian Art" 
                style={{ width: '100%', borderRadius: '20px', opacity: 0.8 }}
              />
            </div>
          </div>

          {/* Right Side: Form */}
          <div>
            <h1 style={{ 
              fontSize: '64px', 
              fontFamily: '"Playfair Display", serif', 
              color: '#1f2937', 
              marginBottom: '40px',
              fontWeight: 400
            }}>Contact Us</h1>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <label style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px', display: 'block' }}>Name</label>
                <input 
                  required
                  type="text" 
                  placeholder="Enter Your Name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  style={{ width: '100%', padding: '16px', border: '1px solid #d1d5db', borderRadius: '8px', outline: 'none', fontSize: '16px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px', display: 'block' }}>Contact No</label>
                  <input 
                    required
                    type="text" 
                    placeholder="Enter"
                    value={formData.contactNo}
                    onChange={(e) => setFormData({...formData, contactNo: e.target.value})}
                    style={{ width: '100%', padding: '16px', border: '1px solid #d1d5db', borderRadius: '8px', outline: 'none', fontSize: '16px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px', display: 'block' }}>Email ID</label>
                  <input 
                    required
                    type="email" 
                    placeholder="Enter"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    style={{ width: '100%', padding: '16px', border: '1px solid #d1d5db', borderRadius: '8px', outline: 'none', fontSize: '16px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px', display: 'block' }}>Message</label>
                <textarea 
                  required
                  rows={4}
                  placeholder="Your message here..."
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  style={{ width: '100%', padding: '16px', border: '1px solid #d1d5db', borderRadius: '8px', outline: 'none', fontSize: '16px', resize: 'none' }}
                />
              </div>

              {status.message && (
                <div style={{ 
                  padding: '12px 16px', 
                  borderRadius: '8px', 
                  background: status.type === 'success' ? '#f0fdf4' : '#fef2f2',
                  color: status.type === 'success' ? '#166534' : '#991b1b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px'
                }}>
                  {status.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  {status.message}
                </div>
              )}

              <button 
                disabled={loading}
                style={{ 
                  background: '#8b7355', 
                  color: '#fff', 
                  border: 'none', 
                  padding: '16px 32px', 
                  borderRadius: '8px', 
                  fontSize: '18px', 
                  fontWeight: 600, 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  marginTop: '12px',
                  transition: 'all 0.2s',
                  opacity: loading ? 0.7 : 1
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#7a6448'}
                onMouseOut={(e) => e.currentTarget.style.background = '#8b7355'}
              >
                {loading ? 'SENDING...' : 'SEND ENQUIRY →'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;

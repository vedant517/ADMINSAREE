import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  Mail, 
  Phone, 
  Calendar, 
  CheckCircle, 
  Clock, 
  Trash2, 
  MessageSquare,
  Search,
  Filter,
  Loader2
} from 'lucide-react';

const Enquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    try {
      const { data } = await api.get('/admin/enquiries');
      setEnquiries(data.data);
    } catch (error) {
      console.error('Error fetching enquiries:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/admin/enquiries/${id}`, { status });
      fetchEnquiries();
    } catch (error) {
      alert('Error updating status');
    }
  };

  const deleteEnquiry = async (id) => {
    if (!window.confirm('Delete this enquiry?')) return;
    try {
      await api.delete(`/admin/enquiries/${id}`);
      fetchEnquiries();
    } catch (error) {
      alert('Error deleting enquiry');
    }
  };

  const filteredEnquiries = enquiries.filter(enq => {
    const matchesFilter = filter === 'All' || enq.status === filter;
    const matchesSearch = enq.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          enq.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
      <Loader2 className="animate-spin" size={40} color="#8b7355" />
    </div>
  );

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1f2937', marginBottom: '8px' }}>Enquiries & Leads</h1>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>Manage user messages and styling inquiries.</p>
      </div>

      {/* Filters */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '24px',
        gap: '20px',
        flexWrap: 'wrap'
      }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
          <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} size={18} />
          <input 
            type="text" 
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '12px 12px 12px 40px', 
              borderRadius: '12px', 
              border: '1px solid #e5e7eb',
              outline: 'none',
              fontSize: '14px'
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['All', 'New', 'In Progress', 'Resolved'].map((f) => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '10px 16px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                background: filter === f ? '#1f2937' : '#fff',
                color: filter === f ? '#fff' : '#4b5563',
                border: '1px solid #e5e7eb',
                transition: 'all 0.2s'
              }}
            >{f}</button>
          ))}
        </div>
      </div>

      {/* Table/List */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
            <tr>
              <th style={{ padding: '16px', fontSize: '12px', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase' }}>User Info</th>
              <th style={{ padding: '16px', fontSize: '12px', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase' }}>Message</th>
              <th style={{ padding: '16px', fontSize: '12px', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase' }}>Date</th>
              <th style={{ padding: '16px', fontSize: '12px', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '16px', fontSize: '12px', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEnquiries.map((enq) => (
              <tr key={enq._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '20px 16px' }}>
                  <div style={{ fontWeight: 700, color: '#111827', marginBottom: '4px' }}>{enq.name}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}><Mail size={12} /> {enq.email}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={12} /> {enq.contactNo}</div>
                </td>
                <td style={{ padding: '20px 16px', maxWidth: '300px' }}>
                  <div style={{ fontSize: '13px', color: '#374151', lineHeight: '1.5' }}>{enq.message}</div>
                </td>
                <td style={{ padding: '20px 16px', whiteSpace: 'nowrap' }}>
                  <div style={{ fontSize: '13px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={14} /> {new Date(enq.createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td style={{ padding: '20px 16px' }}>
                  <select 
                    value={enq.status}
                    onChange={(e) => updateStatus(enq._id, e.target.value)}
                    style={{ 
                      padding: '6px 12px', 
                      borderRadius: '20px', 
                      fontSize: '12px', 
                      fontWeight: 700,
                      background: enq.status === 'New' ? '#fef2f2' : enq.status === 'In Progress' ? '#fff7ed' : '#f0fdf4',
                      color: enq.status === 'New' ? '#991b1b' : enq.status === 'In Progress' ? '#9a3412' : '#166534',
                      border: 'none',
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                  >
                    <option value="New">New</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </td>
                <td style={{ padding: '20px 16px' }}>
                  <button 
                    onClick={() => deleteEnquiry(enq._id)}
                    style={{ padding: '8px', color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer' }}
                  ><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredEnquiries.length === 0 && (
          <div style={{ padding: '60px', textAlign: 'center', color: '#9ca3af' }}>
            <MessageSquare size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
            <p>No enquiries found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Enquiries;

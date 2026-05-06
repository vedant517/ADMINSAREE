import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  Mail, 
  Phone, 
  Calendar, 
  Trash2, 
  MessageSquare,
  Search,
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

  const statusColors = {
    New:          { bg: '#fef2f2', color: '#991b1b' },
    'In Progress':{ bg: '#fff7ed', color: '#9a3412' },
    Resolved:     { bg: '#f0fdf4', color: '#166534' },
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
      <Loader2 style={{ animation: 'spin 1s linear infinite' }} size={40} color="#8b7355" />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <>
      <style>{`
        .enq-root {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
          box-sizing: border-box;
        }
        @media (min-width: 768px) { .enq-root { padding: 32px; } }

        /* ── Filters row ── */
        .enq-filters {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 24px;
        }
        @media (min-width: 768px) {
          .enq-filters {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
          }
        }

        .enq-search-wrap {
          position: relative;
          width: 100%;
        }
        @media (min-width: 768px) { .enq-search-wrap { flex: 1; max-width: 420px; } }

        .enq-search-input {
          width: 100%;
          padding: 12px 12px 12px 40px;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          outline: none;
          font-size: 14px;
          box-sizing: border-box;
          transition: border-color 0.2s;
        }
        .enq-search-input:focus { border-color: #6b7280; }

        .enq-filter-btns {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        /* ── Desktop table ── */
        .enq-table-wrap {
          display: none;
          overflow-x: auto;
        }
        @media (min-width: 768px) { .enq-table-wrap { display: block; } }

        /* ── Mobile cards ── */
        .enq-mobile-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        @media (min-width: 768px) { .enq-mobile-list { display: none; } }

        .enq-card {
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .enq-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
        }

        .enq-card-meta {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .enq-meta-row {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          color: #6b7280;
        }

        .enq-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding-top: 10px;
          border-top: 1px solid #f3f4f6;
          flex-wrap: wrap;
        }
      `}</style>

      <div className="enq-root">
        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1f2937', marginBottom: '6px' }}>Enquiries & Leads</h1>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Manage user messages and styling inquiries.</p>
        </div>

        {/* Filters */}
        <div className="enq-filters">
          <div className="enq-search-wrap">
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} size={18} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="enq-search-input"
            />
          </div>
          <div className="enq-filter-btns">
            {['All', 'New', 'In Progress', 'Resolved'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '9px 14px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: filter === f ? '#1f2937' : '#fff',
                  color: filter === f ? '#fff' : '#4b5563',
                  border: '1px solid #e5e7eb',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                }}
              >{f}</button>
            ))}
          </div>
        </div>

        {/* ── Desktop Table ── */}
        <div className="enq-table-wrap">
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
              <thead style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <tr>
                  {['User Info', 'Message', 'Date', 'Status', 'Actions'].map((h) => (
                    <th key={h} style={{ padding: '16px', fontSize: '12px', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredEnquiries.map((enq) => (
                  <tr key={enq._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '20px 16px' }}>
                      <div style={{ fontWeight: 700, color: '#111827', marginBottom: '4px' }}>{enq.name}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}><Mail size={12} /> {enq.email}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}><Phone size={12} /> {enq.contactNo}</div>
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
                          background: statusColors[enq.status]?.bg || '#f9fafb',
                          color: statusColors[enq.status]?.color || '#374151',
                          border: 'none',
                          cursor: 'pointer',
                          outline: 'none',
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
                <MessageSquare size={48} style={{ marginBottom: '16px', opacity: 0.3, display: 'block', margin: '0 auto 16px' }} />
                <p style={{ margin: 0 }}>No enquiries found.</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Mobile Cards ── */}
        <div className="enq-mobile-list">
          {filteredEnquiries.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: '#9ca3af' }}>
              <MessageSquare size={48} style={{ marginBottom: '16px', opacity: 0.3, display: 'block', margin: '0 auto 16px' }} />
              <p style={{ margin: 0 }}>No enquiries found.</p>
            </div>
          ) : filteredEnquiries.map((enq) => (
            <div key={enq._id} className="enq-card">
              <div className="enq-card-header">
                <div>
                  <div style={{ fontWeight: 700, color: '#111827', fontSize: '15px', marginBottom: '6px' }}>{enq.name}</div>
                  <div className="enq-card-meta">
                    <div className="enq-meta-row"><Mail size={12} /> {enq.email}</div>
                    <div className="enq-meta-row"><Phone size={12} /> {enq.contactNo}</div>
                    <div className="enq-meta-row"><Calendar size={12} /> {new Date(enq.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
                <button
                  onClick={() => deleteEnquiry(enq._id)}
                  style={{ padding: '8px', color: '#ef4444', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', cursor: 'pointer', flexShrink: 0 }}
                ><Trash2 size={16} /></button>
              </div>

              <p style={{ fontSize: '13px', color: '#374151', lineHeight: 1.6, margin: 0, padding: '12px', background: '#f9fafb', borderRadius: '10px' }}>
                {enq.message}
              </p>

              <div className="enq-card-footer">
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Update Status:</span>
                <select
                  value={enq.status}
                  onChange={(e) => updateStatus(enq._id, e.target.value)}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 700,
                    background: statusColors[enq.status]?.bg || '#f9fafb',
                    color: statusColors[enq.status]?.color || '#374151',
                    border: 'none',
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                  <option value="New">New</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Enquiries;
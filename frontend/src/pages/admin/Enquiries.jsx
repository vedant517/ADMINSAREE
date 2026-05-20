import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Mail,
  Phone,
  Calendar,
  Trash2,
  MessageSquare,
  Search,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock
} from 'lucide-react';

function StatCard({ title, value, icon: Icon, color, trend, isFirst }) {
  const accent = isFirst ? '#ffffff' : '#85754E';
  return (
    <div
      className={`rounded-2xl border border-slate-100 p-5 shadow-sm transition-all hover:shadow-md flex flex-col justify-between h-full ${isFirst ? 'bg-heritage' : 'bg-white'}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isFirst ? 'bg-white/20' : 'bg-slate-50 border border-slate-100'}`}
        >
          <Icon size={20} style={{ color: accent }} />
        </div>
        {trend && (
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${isFirst ? 'bg-white/20 text-white' : 'bg-slate-50 text-slate-400'}`}>
            {trend}
          </span>
        )}
      </div>
      <div>
        <div className={`text-2xl font-black tracking-tight leading-none mb-1 ${isFirst ? 'text-white' : 'text-heritage'}`}>{value}</div>
        <div className={`text-[12px] font-black uppercase tracking-widest ${isFirst ? 'text-white/70' : 'text-heritage/60'}`}>{title}</div>
      </div>
    </div>
  );
}

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

  const getStatusSelectStyle = (status) => {
    const map = {
      New: 'bg-rose-50 text-rose-600',
      'In Progress': 'bg-amber-50 text-[#85754E]',
      Resolved: 'bg-amber-50 text-[#85754E]',
    };
    return map[status] || 'bg-gray-50 text-gray-700';
  };

  if (loading) return (
    <div className="flex items-center justify-center h-[80vh]">
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <Loader2 style={{ animation: 'spin 1s linear infinite' }} size={40} color="#85754E" />
    </div>
  );

  return (
    <div className="w-full min-h-[calc(100vh-60px)] bg-slate-50 font-sans p-5 text-slate-800">

      <div className="mb-7 flex justify-between items-end flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800 mb-1.5">Enquiries &amp; Leads</h1>
          <p className="text-gray-500 text-sm m-0">Manage user messages and styling inquiries.</p>
        </div>
        <div className="px-4 py-2 bg-amber-50 border border-amber-100 rounded-2xl">
          <span className="text-[11px] font-black text-[#85754E] uppercase tracking-widest flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#85754E] animate-pulse" />
            Live Response System
          </span>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard 
          title="Total Enquiries" 
          value={enquiries.length} 
          icon={MessageSquare} 
          trend="All Time"
          isFirst={true}
        />
        <StatCard 
          title="New Leads" 
          value={enquiries.filter(e => e.status === 'New').length} 
          icon={AlertCircle} 
        />
        <StatCard 
          title="In Progress" 
          value={enquiries.filter(e => e.status === 'In Progress').length} 
          icon={Clock} 
        />
        <StatCard 
          title="Resolved" 
          value={enquiries.filter(e => e.status === 'Resolved').length} 
          icon={CheckCircle2} 
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div className="relative w-full md:flex-1 md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200 text-sm outline-none transition-colors focus:border-gray-500 box-border"
          />
        </div>
        <div className="flex gap-1 bg-[#FFF5E2] p-1 rounded-2xl border border-amber-100 flex-wrap">
          {['All', 'New', 'In Progress', 'Resolved'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-[13px] font-bold cursor-pointer border-none transition-all whitespace-nowrap
                ${filter === f
                  ? 'bg-white text-[#85754E] shadow-sm'
                  : 'bg-transparent text-slate-500 hover:text-[#85754E]'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block">
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full border-collapse text-left" style={{ minWidth: '700px' }}>
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['User Info', 'Message', 'Date', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="p-4 text-xs font-bold text-gray-600 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredEnquiries.map((enq) => (
                <tr key={enq._id} className="border-b border-gray-100">
                  <td className="p-5">
                    <div className="font-bold text-gray-900 mb-1">{enq.name}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1"><Mail size={12} /> {enq.email}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><Phone size={12} /> {enq.contactNo}</div>
                  </td>
                  <td className="p-5 max-w-[300px]">
                    <div className="text-[13px] text-gray-700 leading-relaxed">{enq.message}</div>
                  </td>
                  <td className="p-5 whitespace-nowrap">
                    <div className="text-[13px] text-gray-500 flex items-center gap-1">
                      <Calendar size={14} /> {new Date(enq.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="p-5">
                    <select
                      value={enq.status}
                      onChange={(e) => updateStatus(enq._id, e.target.value)}
                      className={`px-3 py-1.5 rounded-2xl text-xs font-bold border-none cursor-pointer outline-none ${getStatusSelectStyle(enq.status)}`}
                    >
                      <option value="New">New</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </td>
                  <td className="p-5">
                    <button
                      onClick={() => deleteEnquiry(enq._id)}
                      className="p-2 text-red-500 bg-transparent border-none cursor-pointer"
                    ><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredEnquiries.length === 0 && (
            <div className="p-16 text-center text-gray-400">
              <MessageSquare size={48} className="mb-4 opacity-30 mx-auto block" />
              <p className="m-0">No enquiries found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="flex flex-col gap-3.5 md:hidden">
        {filteredEnquiries.length === 0 ? (
          <div className="py-16 px-5 text-center text-gray-400">
            <MessageSquare size={48} className="mb-4 opacity-30 mx-auto block" />
            <p className="m-0">No enquiries found.</p>
          </div>
        ) : filteredEnquiries.map((enq) => (
          <div key={enq._id} className="bg-white border border-gray-200 rounded-2xl p-4.5 flex flex-col gap-3">
            <div className="flex justify-between items-start gap-3">
              <div>
                <div className="font-bold text-gray-900 text-[15px] mb-1.5">{enq.name}</div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500"><Mail size={12} /> {enq.email}</div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500"><Phone size={12} /> {enq.contactNo}</div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500"><Calendar size={12} /> {new Date(enq.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
              <button
                onClick={() => deleteEnquiry(enq._id)}
                className="p-2 text-red-500 bg-red-50 border border-red-200 rounded-lg cursor-pointer shrink-0"
              ><Trash2 size={16} /></button>
            </div>

            <p className="text-[13px] text-gray-700 leading-relaxed m-0 p-3 bg-gray-50 rounded-xl">
              {enq.message}
            </p>

            <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-gray-100 flex-wrap">
              <span className="text-xs font-semibold text-gray-500">Update Status:</span>
              <select
                value={enq.status}
                onChange={(e) => updateStatus(enq._id, e.target.value)}
                className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold border-none cursor-pointer outline-none ${getStatusSelectStyle(enq.status)}`}
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
  );
};

export default Enquiries;
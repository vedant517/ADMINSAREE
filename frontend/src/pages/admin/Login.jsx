import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Lock, Mail, Eye, EyeOff, Loader2 } from 'lucide-react';
import { setCredentials } from '../../features/auth/authSlice';
import api from '../../services/api';

export default function Login({ setIsAuthenticated }) {
  const [email, setEmail] = useState('admin@gmail.com');
  const [password, setPassword] = useState('admin123');

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await api.post('/admin/login', {
        email: email.trim(),
        password
      });

      const data = res.data;

      if (res.status === 200) {
        dispatch(setCredentials({ role: data.role, isAdmin: true }));
        if (setIsAuthenticated) setIsAuthenticated(true);
        navigate('/dashboard');
      } else {
        setError(data.msg || 'Login failed');
      }
    } catch (err) {
      setError(err.response?.data?.msg || err.response?.data?.message || err.message || 'Connection error. Is the backend running?');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center overflow-hidden font-sans bg-[#FFF5E2]">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 z-0 opacity-40 bg-repeat bg-center pointer-events-none"
        style={{ backgroundImage: 'url("/Gemini_Generated_Image_me16t6me16t6me16 1 (1).png")', backgroundSize: '600px' }}
      />
      <div className="absolute inset-0 bg-[#FFF5E2]/40 z-[-1]" />

      {/* Decorative Characters - Responsive hiding */}
      <img 
        src="/592a97f2-d897-4a51-9b02-b82b0bf80e02 1.png" 
        alt="Heritage Style" 
        className="hidden xl:block absolute left-[-5%] bottom-[-5%] h-[90vh] object-contain z-10 pointer-events-none select-none opacity-90"
      />
      <img 
        src="/c31efe28-8d51-4c48-a47f-ede28a6bbb2f 1.png" 
        alt="Heritage Style" 
        className="hidden xl:block absolute right-[-5%] bottom-[-5%] h-[85vh] object-contain z-10 pointer-events-none select-none opacity-90"
      />

      {/* Back Button */}
      <button 
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 md:top-8 md:left-8 w-10 h-10 rounded-full bg-[#85754E]/10 flex items-center justify-center text-[#85754E] border border-[#85754E]/20 cursor-pointer hover:bg-[#85754E]/20 transition-all z-50 shadow-sm"
      >
        <span className="text-xl">‹</span>
      </button>

      {/* Login Card */}
      <div className="w-[92%] max-w-[400px] bg-white/95 p-8 md:p-12 rounded-[40px] shadow-2xl border border-amber-100/50 z-20 relative backdrop-blur-md">
        
        {/* Logo Section */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full overflow-hidden shadow-xl border-2 border-amber-100 flex items-center justify-center bg-white">
            <img src="/logo.png" alt="Sheetalya" className="w-14 h-14 object-contain" />
          </div>
          <h1 className="text-4xl font-serif text-slate-800 m-0 tracking-tight select-none">Login</h1>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-500 text-[11px] mb-6 text-center font-black uppercase tracking-widest animate-pulse">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 select-none">Email Address</label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-[#85754E]">
                <Mail size={18} />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@gmail.com"
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm text-slate-900 outline-none transition-all box-border focus:border-[#85754E] focus:ring-4 focus:ring-[#85754E]/5 placeholder:text-slate-300"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 select-none">Password</label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-[#85754E]">
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-12 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm text-slate-900 outline-none transition-all box-border focus:border-[#85754E] focus:ring-4 focus:ring-[#85754E]/5 placeholder:text-slate-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-slate-300 hover:text-[#85754E] transition-colors p-1"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 py-4 bg-[#85754E] text-white border-none rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] cursor-pointer transition-all flex items-center justify-center gap-2 shadow-2xl shadow-amber-900/30 hover:bg-[#837349] hover:translate-y-[-2px] active:translate-y-[0px] disabled:opacity-70 disabled:cursor-not-allowed group"
          >
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : (
              <>LOGIN TO PROCEED <span className="text-lg transition-transform group-hover:translate-x-1">→</span></>
            )}
          </button>
        </form>

        <div className="text-center mt-12 opacity-50">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] select-none">
            Secure Admin Access Panel
          </p>
        </div>
      </div>
    </div>
  );
}

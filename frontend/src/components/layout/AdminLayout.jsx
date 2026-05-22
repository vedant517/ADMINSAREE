import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { logout } from '../../features/auth/authSlice';
import { resetUserData } from '../../utils/resetUserData';
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Ticket,
  Receipt,
  Layers,
  PlusCircle,
  Image as ImageIcon,
  List,
  Star,
  ShieldCheck,
  LogOut,
  ChevronRight,
  MessageSquare,
  Menu,
  X,
} from 'lucide-react';
import api from '../../services/api';

const navGroups = [
  {
    title: 'Main menu',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
      { icon: ShoppingCart, label: 'Order Management', path: '/orders' },
      { icon: MessageSquare, label: 'Enquiries', path: '/enquiries' },
      { icon: Users, label: 'Customers', path: '/customers' },
      { icon: Ticket, label: 'Coupon Code', path: '/coupons' },
      { icon: Receipt, label: 'Transaction', path: '/transactions' },
    ],
  },
  {
    title: 'Product',
    items: [
      { icon: PlusCircle, label: 'Add Products', path: '/add-product' },
      { icon: Layers, label: 'Categories', path: '/categories' },
      { icon: ImageIcon, label: 'Product Media', path: '/media' },
      { icon: List, label: 'Product List', path: '/products' },
      { icon: Star, label: 'Product Reviews', path: '/reviews' },
    ],
  },
  {
    title: 'Admin',
    items: [
      { icon: ShieldCheck, label: 'Admin role', path: '/roles' },
    ],
  },
];

export default function AdminLayout({ setIsAuthenticated }) {
  const dispatch = useDispatch();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState({});
  
  const toggleGroup = (title) => {
    setCollapsedGroups(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const handleLogout = async () => {
    try {
      await api.post('/admin/logout');
    } catch (err) {
      console.error('Logout failed:', err);
    }
    // Clear customer cart/wishlist/notification cache so the next user never sees stale counts
    dispatch(logout());
    resetUserData(dispatch);
    if (setIsAuthenticated) setIsAuthenticated(false);
    else window.location.href = '/';
  };

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const NavLinks = () => (
    <>
      {navGroups.map((group) => {
        const isCollapsed = collapsedGroups[group.title];
        return (
          <div key={group.title} className="mb-4">
            {!isSidebarCollapsed && (
              <div 
                onClick={() => toggleGroup(group.title)}
                className="flex items-center justify-between px-2 mb-1.5 cursor-pointer hover:bg-black/5 rounded-md py-1 transition-colors group"
              >
                <p className="text-[10px] font-black uppercase tracking-widest text-[#85754E]/70 m-0 select-none">
                  {group.title}
                </p>
                <ChevronRight 
                  size={12} 
                  className={`text-[#85754E]/50 transition-transform duration-200 ${isCollapsed ? 'rotate-0' : 'rotate-90'}`} 
                />
              </div>
            )}
            
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isCollapsed && !isSidebarCollapsed ? 'max-h-0 opacity-0' : 'max-h-[500px] opacity-100'}`}>
              {group.items.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={[
                      'flex items-center gap-2.5 px-3 py-2 rounded-lg mb-0.5 text-[13px] font-semibold no-underline transition-all duration-150 select-none relative group/item',
                      isActive
                        ? 'bg-[#85754E] text-white shadow-md'
                        : 'text-slate-500 hover:bg-white/60 hover:text-slate-800',
                      isSidebarCollapsed ? 'justify-center' : '',
                    ].join(' ')}
                  >
                    <Icon size={16} className="shrink-0" />
                    {!isSidebarCollapsed && <span className="flex-1 truncate">{item.label}</span>}
                    {!isSidebarCollapsed && isActive && <ChevronRight size={14} className="shrink-0" />}
                    
                    {isSidebarCollapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-[10px] rounded opacity-0 group-hover/item:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                        {item.label}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  );

  return (
    <div className="fixed inset-0 flex bg-slate-50">

      {/* ── Desktop Sidebar (md+) ── */}
      <aside className={`hidden md:flex flex-col shrink-0 bg-[#FFF5E2] border-r border-amber-100/50 transition-all duration-300 ${isSidebarCollapsed ? 'w-[72px]' : 'w-60'}`}>
        {/* Logo */}
        <div className="px-5 py-4 border-b border-amber-100/50 shrink-0 relative">
          <div className={`flex items-center gap-3 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
            <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
            {!isSidebarCollapsed && (
              <span className="font-black text-lg tracking-tight text-slate-900 select-none uppercase truncate">
                SHEETALYA
              </span>
            )}
          </div>
          
          {/* Collapse Toggle */}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white border border-amber-100 rounded-full flex items-center justify-center text-[#85754E] shadow-sm hover:shadow-md cursor-pointer transition-transform hover:scale-110 z-10"
          >
            <ChevronRight size={14} className={`transition-transform duration-300 ${isSidebarCollapsed ? '' : 'rotate-180'}`} />
          </button>
        </div>

        {/* Scrollable Nav */}
        <nav className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-3 py-3">
          <NavLinks />
        </nav>

        {/* Logout */}
        <div className="shrink-0 border-t border-amber-100/50 p-4">
          <button
            onClick={handleLogout}
            className={`flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg border border-red-200 bg-red-50 text-red-500 text-[13px] font-bold cursor-pointer transition-all hover:bg-red-100 ${isSidebarCollapsed ? 'px-0' : ''}`}
          >
            <LogOut size={15} />
            {!isSidebarCollapsed && <span>Secure Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── Mobile Overlay Sidebar (below md) ── */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/50"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Drawer */}
          <div className="relative z-10 flex flex-col w-60 bg-[#FFF5E2] shadow-2xl">
            <div className="px-5 py-4 border-b border-amber-100/50 shrink-0 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
                <span className="font-black text-lg tracking-tight text-slate-900 uppercase">
                  SHEETALYA
                </span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>
            <nav className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-3 py-3">
              <NavLinks />
            </nav>
            <div className="shrink-0 border-t border-amber-100/50 p-4">
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg border border-red-200 bg-red-50 text-red-500 text-[13px] font-bold cursor-pointer transition-colors hover:bg-red-100"
              >
                <LogOut size={15} />
                Secure Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Right Column ── */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* Mobile Top Bar */}
        <header className="md:hidden flex items-center gap-3 shrink-0 px-4 py-3 bg-white border-b border-slate-100">
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
            className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Logo" className="w-7 h-7 object-contain" />
            <span className="font-extrabold text-[15px] tracking-tight text-slate-900 uppercase">
              SHEETALYA
            </span>
          </div>
        </header>

        {/* Page Content — ONLY this area scrolls */}
        <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
          <Outlet />
        </main>
      </div>

    </div>
  );
}
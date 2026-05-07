import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
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
      { icon: LayoutDashboard, label: 'Dashboard',        path: '/dashboard'    },
      { icon: ShoppingCart,    label: 'Order Management', path: '/orders'       },
      { icon: MessageSquare,   label: 'Enquiries',        path: '/enquiries'    },
      { icon: Users,           label: 'Customers',        path: '/customers'    },
      { icon: Ticket,          label: 'Coupon Code',      path: '/coupons'      },
      { icon: Receipt,         label: 'Transaction',      path: '/transactions' },
    ],
  },
  {
    title: 'Product',
    items: [
      { icon: PlusCircle, label: 'Add Products',    path: '/add-product' },
      { icon: Layers,     label: 'Categories',      path: '/categories'  },
      { icon: ImageIcon,  label: 'Product Media',   path: '/media'       },
      { icon: List,       label: 'Product List',    path: '/products'    },
      { icon: Star,       label: 'Product Reviews', path: '/reviews'     },
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
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await api.post('/admin/logout');
    } catch (err) {
      console.error('Logout failed:', err);
    }
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('role');
    if (setIsAuthenticated) setIsAuthenticated(false);
    else window.location.href = '/';
  };

  const NavLinks = () => (
    <>
      {navGroups.map((group) => (
        <div key={group.title} className="mb-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-2 mb-1.5 select-none">
            {group.title}
          </p>
          {group.items.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={[
                  'flex items-center gap-2.5 px-3 py-2 rounded-lg mb-0.5 text-[13px] font-medium no-underline transition-all duration-150 select-none',
                  isActive
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800',
                ].join(' ')}
              >
                <Icon size={16} className="shrink-0" />
                <span className="flex-1 truncate">{item.label}</span>
                {isActive && <ChevronRight size={14} className="shrink-0" />}
              </Link>
            );
          })}
        </div>
      ))}
    </>
  );

  return (
    /*
      ROOT: fixed inset-0 — locks the shell to exactly the viewport.
      This prevents any child with min-h-screen from pushing the document
      scroll and breaking the sidebar/main split.
    */
    <div className="fixed inset-0 flex bg-slate-50">

      {/* ── Desktop Sidebar (md+) ── */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 bg-white border-r border-slate-100">
        {/* Logo */}
        <div className="px-5 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-base shrink-0">
              D
            </div>
            <span className="font-extrabold text-base tracking-tight text-slate-900 select-none">
              DEALP<span className="text-emerald-500">◉</span>RT
            </span>
          </div>
        </div>

        {/* Scrollable Nav — min-h-0 is required so flex-1 can shrink */}
        <nav className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-3 py-3">
          <NavLinks />
        </nav>

        {/* Logout */}
        <div className="shrink-0 border-t border-slate-100 p-4">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg border border-red-200 bg-red-50 text-red-500 text-[13px] font-bold cursor-pointer transition-colors hover:bg-red-100"
          >
            <LogOut size={15} />
            Secure Logout
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
          <div className="relative z-10 flex flex-col w-60 bg-white shadow-2xl">
            <div className="px-5 py-4 border-b border-slate-100 shrink-0 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-base shrink-0">
                  D
                </div>
                <span className="font-extrabold text-base tracking-tight text-slate-900">
                  DEALP<span className="text-emerald-500">◉</span>RT
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
            <div className="shrink-0 border-t border-slate-100 p-4">
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
          <span className="font-extrabold text-[15px] tracking-tight text-slate-900">
            DEALP<span className="text-emerald-500">◉</span>RT
          </span>
        </header>

        {/* Page Content — ONLY this area scrolls */}
        <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
          <Outlet />
        </main>
      </div>

    </div>
  );
}
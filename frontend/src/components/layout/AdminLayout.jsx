import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Ticket,
  Receipt,
  Bookmark,
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

  /* ── Sidebar inner content – kept as inline styles to preserve pixel-exact look ── */
  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div style={{ padding: '20px 20px 12px', borderBottom: '1px solid #f8fafc' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: 'linear-gradient(135deg,#10b981,#059669)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: '16px', flexShrink: 0,
          }}>D</div>
          <span style={{ fontWeight: 800, fontSize: '16px', letterSpacing: '-0.5px', color: '#0f172a' }}>
            DEALP<span style={{ color: '#10b981' }}>◉</span>RT
          </span>
        </div>
      </div>

      {/* Nav Groups */}
      <nav style={{ flex: 1, padding: '12px', overflow: 'auto' }}>
        {navGroups.map((group) => (
          <div key={group.title} style={{ marginBottom: '20px' }}>
            <div style={{
              fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em',
              color: '#94a3b8', textTransform: 'uppercase',
              padding: '0 8px', marginBottom: '6px',
            }}>
              {group.title}
            </div>

            {group.items.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '8px 12px', borderRadius: '8px', marginBottom: '2px',
                    textDecoration: 'none', fontSize: '13px', fontWeight: 500,
                    transition: 'all 0.15s',
                    background: isActive ? '#10b981' : 'transparent',
                    color: isActive ? '#fff' : '#475569',
                  }}
                >
                  <Icon size={16} style={{ flexShrink: 0 }} />
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {isActive && <ChevronRight size={14} />}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Logout Footer */}
      <div style={{ borderTop: '1px solid #f1f5f9', padding: '16px' }}>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            padding: '12px', width: '100%', cursor: 'pointer',
            border: '1px solid #fecaca', borderRadius: '8px',
            fontSize: '13px', fontWeight: 700, color: '#ef4444',
            background: '#fef2f2', transition: 'all 0.2s',
          }}
          onMouseOver={(e) => e.currentTarget.style.background = '#fee2e2'}
          onMouseOut={(e)  => e.currentTarget.style.background = '#fef2f2'}
        >
          <LogOut size={16} />
          Secure Logout
        </button>
      </div>
    </>
  );

  return (
    /*
      Shell layout uses Tailwind for the flex/overflow structure.
      Sidebar internals use inline styles (unchanged from original)
      so the visual appearance is guaranteed pixel-perfect.
    */
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50">

      {/* ── Desktop Sidebar (md and above) ── */}
      <aside
        className="hidden md:flex flex-col shrink-0 overflow-y-auto overflow-x-hidden"
        style={{
          width: '240px',
          minWidth: '240px',
          height: '100vh',
          background: '#fff',
          borderRight: '1px solid #f1f5f9',
        }}
      >
        <SidebarContent />
      </aside>

      {/* ── Mobile Overlay Sidebar (below md) ── */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-[100]">
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(15,23,42,0.5)', transition: 'opacity 0.25s' }}
            onClick={() => setSidebarOpen(false)}
          />
          {/* Drawer */}
          <div
            className="absolute top-0 left-0 bottom-0 flex flex-col overflow-y-auto overflow-x-hidden"
            style={{
              width: '240px',
              background: '#fff',
              boxShadow: '4px 0 24px rgba(0,0,0,0.12)',
              transition: 'transform 0.25s ease',
            }}
          >
            <SidebarContent />
          </div>
        </div>
      )}

      {/* ── Right Column ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Mobile Top Bar (below md only) */}
        <div
          className="flex md:hidden items-center gap-3 shrink-0"
          style={{
            padding: '12px 16px',
            background: '#fff',
            borderBottom: '1px solid #f1f5f9',
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#475569', display: 'flex', alignItems: 'center',
              padding: '4px', borderRadius: '6px',
            }}
          >
            <Menu size={22} />
          </button>
          <span style={{ fontWeight: 800, fontSize: '15px', letterSpacing: '-0.5px', color: '#0f172a' }}>
            DEALP<span style={{ color: '#10b981' }}>◉</span>RT
          </span>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

    </div>
  );
}
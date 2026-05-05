import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Ticket,
  Grid3X3,
  Receipt,
  Bookmark,
  Layers,
  PlusCircle,
  Image as ImageIcon,
  List,
  Star,
  ShieldCheck,
  Lock,
  Search,
  Bell,
  Settings,
  ExternalLink,
  LogOut,
  ChevronRight,
  Moon,
  MessageSquare
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
  const location = useLocation();

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: '#f8fafc' }}>

      {/* ─── SIDEBAR ─── */}
      <aside style={{
        width: '240px',
        minWidth: '240px',
        height: '100vh',
        background: '#fff',
        borderRight: '1px solid #f1f5f9',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        overflowX: 'hidden',
        flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 20px 12px', borderBottom: '1px solid #f8fafc' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'linear-gradient(135deg,#10b981,#059669)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: '16px', flexShrink: 0
            }}>D</div>
            <span style={{ fontWeight: 800, fontSize: '16px', letterSpacing: '-0.5px', color: '#0f172a' }}>
              DEALP<span style={{ color: '#10b981' }}>◉</span>RT
            </span>
          </div>
        </div>

        {/* Nav Groups */}
        <nav style={{ flex: 1, padding: '12px 12px', overflow: 'auto' }}>
          {navGroups.map((group) => (
            <div key={group.title} style={{ marginBottom: '20px' }}>
              <div style={{
                fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em',
                color: '#94a3b8', textTransform: 'uppercase',
                padding: '0 8px', marginBottom: '6px'
              }}>{group.title}</div>

              {group.items.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
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

        {/* Profile Footer */}
        <div style={{ borderTop: '1px solid #f1f5f9', padding: '16px' }}>
          <button
            onClick={async () => {
              try {
                await api.post('/admin/logout');
              } catch (err) {
                console.error('Logout failed:', err);
              }
              localStorage.removeItem('isLoggedIn');
              localStorage.removeItem('role');
              if (setIsAuthenticated) setIsAuthenticated(false);
              else window.location.href = '/';
            }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '12px', width: '100%', cursor: 'pointer',
              border: '1px solid #fecaca', borderRadius: '8px',
              fontSize: '13px', fontWeight: 700, color: '#ef4444',
              background: '#fef2f2', transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#fee2e2'}
            onMouseOut={(e) => e.currentTarget.style.background = '#fef2f2'}
          >
            <LogOut size={16} />
            Secure Logout
          </button>
        </div>
      </aside>

      {/* ─── RIGHT COLUMN ─── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {/* Page Content */}
        <main style={{ flex: 1, overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
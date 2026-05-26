import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import {
  LayoutDashboard, Package, Tag, ShoppingCart,
  LogOut, ChevronRight, Store, Settings, Bell,
  Sun, Moon, User
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/orders', label: 'Đơn hàng', icon: ShoppingCart },
  { to: '/admin/products', label: 'Sản phẩm', icon: Package },
  { to: '/admin/categories', label: 'Danh mục', icon: Tag },
];

export default function AdminLayout() {
  const { admin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* ── Sidebar ── */}
      <aside style={{
        width: 240, flexShrink: 0, background: 'var(--color-surface)',
        borderRight: '1px solid var(--color-border)',
        display: 'flex', flexDirection: 'column',
        padding: '0 12px 16px', overflowY: 'auto',
      }}>
        {/* Logo */}
        <div style={{
          padding: '20px 12px 16px', borderBottom: '1px solid var(--color-border)',
          marginBottom: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(99,102,241,0.35)',
            }}>
              <Store size={18} color="white" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-text)' }}>AutoParts</div>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Admin Panel</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', padding: '6px 12px', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 4 }}>
            Quản lý
          </div>
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              {({ isActive }) => (
                <>
                  <Icon size={16} />
                  {label}
                  {isActive && <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.5 }} />}
                </>
              )}
            </NavLink>
          ))}

          {admin?.role === 'admin' && (
            <NavLink
              to="/admin/users"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              {({ isActive }) => (
                <>
                  <User size={16} />
                  Người dùng
                  {isActive && <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.5 }} />}
                </>
              )}
            </NavLink>
          )}
          
          <div style={{ margin: '12px 0 4px', height: 1, background: 'var(--color-border)' }}></div>
          <NavLink 
            to="/" 
            className="sidebar-link"
          >
            <Store size={16} />
            Đến trang Shoppage
            <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.5 }} />
          </NavLink>
        </nav>

        {/* Admin user */}
        <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid var(--color-border)' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: 'var(--radius-md)',
            background: 'var(--color-surface-2)', marginBottom: 8,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, color: 'white', flexShrink: 0,
            }}>
              {(admin?.name || admin?.email || 'A')[0].toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {admin?.name || 'Admin'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {admin?.email || ''}
              </div>
            </div>
          </div>
          <button className="sidebar-link" onClick={handleLogout} style={{ width: '100%', color: 'var(--color-danger)' }}>
            <LogOut size={16} />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Topbar */}
        <header style={{
          height: 58, flexShrink: 0, borderBottom: '1px solid var(--color-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
          padding: '0 24px', gap: 10, background: 'var(--color-surface)',
        }}>
          {/* Theme Toggle */}
          <button 
            className="btn btn-ghost btn-icon" 
            onClick={toggleTheme} 
            aria-label="Chuyển đổi giao diện"
            style={{ color: 'var(--color-text-subtle)' }}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button className="btn btn-ghost btn-icon" aria-label="Notifications">
            <Bell size={18} />
          </button>
          <button className="btn btn-ghost btn-icon" aria-label="Settings">
            <Settings size={18} />
          </button>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

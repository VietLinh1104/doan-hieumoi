import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Store, ShoppingCart, User, Search, Sun, Moon, LogOut } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import ShopCartSidebar from '@/components/shop/ShopCartSidebar';

export default function ShopLayout() {
  const { cartCount, toggleSidebar } = useCart();
  const { theme, toggleTheme } = useTheme();
  const { user, logout, isAuthenticated } = useAuth();

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const keywordParam = searchParams.get('keyword') || '';
  const [searchValue, setSearchValue] = useState(keywordParam);

  // Sync state if URL changes (e.g. search cleared from homepage)
  useEffect(() => {
    setSearchValue(keywordParam);
  }, [keywordParam]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(`/?keyword=${encodeURIComponent(searchValue.trim())}`);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-background)' }}>
      {/* ── Header ── */}
      <header style={{
        background: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto', padding: '16px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(99,102,241,0.3)'
            }}>
              <Store size={20} color="white" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--color-text)' }}>AutoParts</div>
              <div style={{ fontSize: 12, color: 'var(--color-primary)', fontWeight: 600 }}>Store</div>
            </div>
          </Link>

          {/* Search Bar */}
          <form 
            onSubmit={handleSearchSubmit}
            style={{ flex: 1, maxWidth: 400, margin: '0 24px', position: 'relative' }}
          >
            <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input 
              type="text" 
              placeholder="Tìm kiếm phụ tùng, mã OEM..." 
              className="form-input"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              style={{ paddingLeft: 40, borderRadius: 99, background: 'var(--color-surface-2)', border: 'none', width: '100%' }}
            />
          </form>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {isAuthenticated ? (
              <>
                {(user?.role === 'admin' || user?.role === 'staff') && (
                  <Link to="/admin" style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-primary)', textDecoration: 'none' }}>
                    Trang Quản trị
                  </Link>
                )}
                <Link to="/orders/history" style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-subtle)', textDecoration: 'none' }}>
                  Lịch sử mua hàng
                </Link>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>
                  Hi, {user.name?.split(' ')[0]}
                </div>
                <button 
                  onClick={logout} 
                  title="Đăng xuất"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-danger)', display: 'flex', alignItems: 'center', padding: 4 }}
                >
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <>
                <Link to="/admin/login" style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-muted)', textDecoration: 'none' }}>
                  Đăng nhập
                </Link>
                <Link to="/register" style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-muted)', textDecoration: 'none' }}>
                  Đăng ký
                </Link>
              </>
            )}

            <div style={{ width: 1, height: 24, background: 'var(--color-border)' }}></div>
            
            {/* Theme Toggle */}
            <button 
              className="btn btn-ghost btn-icon" 
              onClick={toggleTheme} 
              aria-label="Chuyển đổi giao diện"
              style={{ color: 'var(--color-text-subtle)' }}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button className="btn btn-primary" style={{ display: 'flex', gap: 8, borderRadius: 99, padding: '8px 16px', position: 'relative' }} onClick={toggleSidebar}>
              <ShoppingCart size={18} />
              <span style={{ fontWeight: 600 }}>Giỏ hàng</span>
              {cartCount > 0 && (
                <div style={{ position: 'absolute', top: -5, right: -5, background: 'var(--color-danger)', color: 'white', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>
                  {cartCount}
                </div>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main style={{ flex: 1, maxWidth: 1200, margin: '0 auto', width: '100%', padding: '24px' }}>
        <Outlet />
      </main>

      {/* ── Footer ── */}
      <footer style={{
        background: 'var(--color-surface)',
        borderTop: '1px solid var(--color-border)',
        padding: '40px 24px',
        marginTop: 'auto'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 14 }}>
          &copy; {new Date().getFullYear()} AutoParts Store. Tất cả quyền được bảo lưu.
        </div>
      </footer>

      {/* ── Cart Sidebar ── */}
      <ShopCartSidebar />
    </div>
  );
}

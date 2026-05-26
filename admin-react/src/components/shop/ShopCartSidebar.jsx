import { X, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { formatCurrency } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

export default function ShopCartSidebar() {
  const { isSidebarOpen, toggleSidebar, cartItems, updateQuantity, removeFromCart, cartTotal } = useCart();
  const navigate = useNavigate();

  if (!isSidebarOpen) return null;

  return (
    <>
      <div 
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 100,
          backdropFilter: 'blur(4px)',
          animation: 'fadeIn 0.2s ease-out'
        }}
        onClick={toggleSidebar}
      />
      <div 
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: 400, maxWidth: '100%',
          background: 'var(--color-surface)',
          zIndex: 101, display: 'flex', flexDirection: 'column',
          boxShadow: '-8px 0 24px rgba(0,0,0,0.1)',
          animation: 'slideInRight 0.3s ease-out'
        }}
      >
        <div style={{ padding: '24px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShoppingBag size={24} /> Giỏ hàng của bạn
          </h2>
          <button className="btn btn-ghost btn-icon" onClick={toggleSidebar}>
            <X size={24} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {cartItems.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginTop: 40 }}>
              <ShoppingBag size={48} style={{ margin: '0 auto', opacity: 0.2, marginBottom: 16 }} />
              <p>Chưa có sản phẩm nào trong giỏ hàng.</p>
              <button 
                className="btn btn-primary" 
                style={{ marginTop: 24, borderRadius: 99 }}
                onClick={toggleSidebar}
              >
                Tiếp tục mua sắm
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {cartItems.map(item => (
                <div key={item._id} style={{ display: 'flex', gap: 16, borderBottom: '1px solid var(--color-border)', paddingBottom: 16 }}>
                  <div style={{ width: 80, height: 80, background: 'var(--color-surface-2)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShoppingBag size={32} style={{ opacity: 0.1 }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <h4 style={{ fontWeight: 600, fontSize: 14 }}>{item.name}</h4>
                      <button className="btn-icon" onClick={() => removeFromCart(item._id)} style={{ color: 'var(--color-danger)', width: 24, height: 24 }}>
                        <X size={16} />
                      </button>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 8 }}>{item.part_number}</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{formatCurrency(item.price)}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--color-surface-2)', borderRadius: 99, padding: '2px 8px' }}>
                        <button onClick={() => updateQuantity(item._id, item.quantity - 1)} style={{ padding: 4, background: 'none', border: 'none', cursor: 'pointer' }}><Minus size={14} /></button>
                        <span style={{ fontSize: 14, fontWeight: 600, width: 20, textAlign: 'center' }}>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item._id, item.quantity + 1)} style={{ padding: 4, background: 'none', border: 'none', cursor: 'pointer' }}><Plus size={14} /></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div style={{ padding: 24, borderTop: '1px solid var(--color-border)', background: 'var(--color-surface-2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, fontSize: 18, fontWeight: 700 }}>
              <span>Tổng cộng:</span>
              <span style={{ color: 'var(--color-primary)' }}>{formatCurrency(cartTotal)}</span>
            </div>
            <button 
              className="btn btn-primary" 
              style={{ width: '100%', borderRadius: 99, padding: '16px 0', fontSize: 16, display: 'flex', justifyContent: 'center', gap: 8 }}
              onClick={() => {
                toggleSidebar();
                navigate('/checkout');
              }}
            >
              Thanh toán <ArrowRight size={20} />
            </button>
          </div>
        )}
      </div>
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}

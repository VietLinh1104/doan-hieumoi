import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { formatCurrency } from '@/lib/utils';
import { CreditCard, Truck, ShieldCheck, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

export default function ShopCheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    paymentMethod: 'cod'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create order via API
      const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api/v1';
      const token = localStorage.getItem('admin_token');
      
      if (!token) {
        alert('Vui lòng đăng nhập tài khoản (Admin/Nhân viên) để tiếp tục thanh toán.');
        navigate('/admin/login');
        return;
      }

      await axios.post(
        `${baseURL}/orders`,
        {
          orderItems: cartItems.map(item => ({
            product_id: item._id,
            qty: item.quantity,
            price: item.price
          })),
          shippingAddress: {
            fullName: formData.fullName,
            phone: formData.phone,
            address: formData.address
          },
          paymentMethod: formData.paymentMethod === 'banking' ? 'card' : 'cod',
          totalPrice: cartTotal
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setSuccess(true);
      clearCart();
    } catch (error) {
      console.error('Failed to create order', error);
      const errMsg = error.response?.data?.message || 'Có lỗi xảy ra khi đặt hàng.';
      alert(errMsg);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ maxWidth: 600, margin: '80px auto', textAlign: 'center' }} className="animate-fadeIn">
        <CheckCircle2 size={80} color="var(--color-success)" style={{ margin: '0 auto 24px' }} />
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 16 }}>Đặt hàng thành công!</h1>
        <p style={{ fontSize: 16, color: 'var(--color-text-muted)', marginBottom: 32, lineHeight: 1.6 }}>
          Cảm ơn bạn đã mua sắm tại AutoParts Store. Đơn hàng của bạn đang được xử lý và sẽ được giao trong thời gian sớm nhất.
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/')} style={{ borderRadius: 99, padding: '12px 32px' }}>
          Tiếp tục mua sắm
        </button>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <h2 style={{ marginBottom: 16 }}>Giỏ hàng của bạn đang trống</h2>
        <button className="btn btn-primary" onClick={() => navigate('/')}>Quay lại cửa hàng</button>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 32 }}>Thanh toán</h1>
      
      <div style={{ display: 'flex', gap: 40, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Checkout Form */}
        <div style={{ flex: '1 1 600px' }}>
          <form onSubmit={handleSubmit} className="card" style={{ padding: 32 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Thông tin giao hàng</h2>
            
            <div style={{ marginBottom: 20 }}>
              <label className="form-label">Họ và tên</label>
              <input required type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="form-input" placeholder="Nguyễn Văn A" />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label className="form-label">Số điện thoại</label>
              <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="form-input" placeholder="0901234567" />
            </div>

            <div style={{ marginBottom: 32 }}>
              <label className="form-label">Địa chỉ giao hàng chi tiết</label>
              <textarea required name="address" value={formData.address} onChange={handleChange} className="form-input" placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố" rows="3"></textarea>
            </div>

            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24, paddingTop: 24, borderTop: '1px solid var(--color-border)' }}>Phương thức thanh toán</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, border: formData.paymentMethod === 'cod' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)', borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s' }}>
                <input type="radio" name="paymentMethod" value="cod" checked={formData.paymentMethod === 'cod'} onChange={handleChange} style={{ width: 18, height: 18 }} />
                <Truck size={24} color="var(--color-primary)" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>Thanh toán khi nhận hàng (COD)</div>
                  <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Thanh toán bằng tiền mặt khi giao hàng</div>
                </div>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, border: formData.paymentMethod === 'banking' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)', borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s' }}>
                <input type="radio" name="paymentMethod" value="banking" checked={formData.paymentMethod === 'banking'} onChange={handleChange} style={{ width: 18, height: 18 }} />
                <CreditCard size={24} color="var(--color-primary)" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>Chuyển khoản ngân hàng</div>
                  <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Chuyển khoản trực tiếp qua tài khoản ngân hàng</div>
                </div>
              </label>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '16px 0', fontSize: 16, borderRadius: 99 }}>
              {loading ? <div className="spinner" style={{ width: 24, height: 24, borderWidth: 2 }} /> : `Hoàn tất đặt hàng - ${formatCurrency(cartTotal)}`}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div style={{ width: 400, flexShrink: 0 }} className="card">
          <div style={{ padding: 24, borderBottom: '1px solid var(--color-border)' }}>
            <h2 style={{ fontSize: 20, fontWeight: 700 }}>Tóm tắt đơn hàng</h2>
          </div>
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {cartItems.map(item => (
              <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ width: 40, height: 40, background: 'var(--color-surface-2)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 12 }}>
                    x{item.quantity}
                  </div>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>{item.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{item.part_number}</div>
                  </div>
                </div>
                <div style={{ fontWeight: 600 }}>{formatCurrency(item.price * item.quantity)}</div>
              </div>
            ))}
          </div>
          <div style={{ padding: 24, background: 'var(--color-surface-2)', borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, color: 'var(--color-text-muted)' }}>
              <span>Tạm tính</span>
              <span>{formatCurrency(cartTotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, color: 'var(--color-text-muted)' }}>
              <span>Phí vận chuyển</span>
              <span>Miễn phí</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTop: '1px solid var(--color-border)' }}>
              <span style={{ fontSize: 16, fontWeight: 600 }}>Tổng cộng</span>
              <span style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-primary)' }}>{formatCurrency(cartTotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

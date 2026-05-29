import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShoppingCart, Star, CheckCircle, Package, ArrowLeft, Send } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';

export default function ShopProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [comments, setComments] = useState([
    { id: 1, user: 'Nguyễn Văn A', rating: 5, content: 'Sản phẩm chất lượng, giao hàng nhanh.', date: '2023-10-15' },
    { id: 2, user: 'Trần Thị B', rating: 4, content: 'Đúng mô tả, đóng gói cẩn thận. Giá hợp lý.', date: '2023-10-10' }
  ]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api/v1';
        const res = await axios.get(`${baseURL}/products/${id}`);
        setProduct(res.data?.data || res.data);
      } catch (error) {
        console.error('Failed to fetch product details', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const newId = comments.length + 1;
    const comment = {
      id: newId,
      user: 'Khách hàng',
      rating: 5,
      content: newComment,
      date: new Date().toISOString().split('T')[0]
    };
    setComments([comment, ...comments]);
    setNewComment('');
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}><div className="spinner"></div></div>;
  }

  if (!product) {
    return <div style={{ textAlign: 'center', padding: 100 }}>Không tìm thấy sản phẩm</div>;
  }

  return (
    <div className="animate-fadeIn">
      <button 
        className="btn btn-ghost" 
        style={{ display: 'flex', gap: 8, marginBottom: 24 }}
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={18} /> Quay lại
      </button>

      <div style={{ display: 'flex', gap: 40, marginBottom: 48, flexWrap: 'wrap' }}>
        {/* Product Image */}
        <div style={{ flex: '1 1 400px', background: 'var(--color-surface-2)', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400, overflow: 'hidden' }}>
          {product.main_image || product.image_url ? (
            <img 
              src={product.main_image || product.image_url} 
              alt={product.name} 
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 24 }} 
            />
          ) : (
            <Package size={100} style={{ opacity: 0.1 }} />
          )}
        </div>

        {/* Product Info */}
        <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 14, color: 'var(--color-primary)', fontWeight: 600, marginBottom: 8 }}>
            {product.category_id?.name || 'Phụ tùng'}
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 16 }}>{product.name}</h1>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {[1,2,3,4,5].map(i => <Star key={i} size={16} color="#FBBF24" fill={i <= 4 ? "#FBBF24" : "none"} />)}
            </div>
            <span style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>4.0 (2 đánh giá)</span>
            <div style={{ width: 1, height: 16, background: 'var(--color-border)' }}></div>
            <span style={{ fontSize: 14, color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <CheckCircle size={16} /> Còn hàng ({product.stock_quantity || '99'})
            </span>
          </div>

          <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--color-primary)', marginBottom: 32 }}>
            {formatCurrency(product.price)}
          </div>

          <div style={{ marginBottom: 32, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ fontSize: 16, fontWeight: 600 }}>Số lượng:</div>
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--color-surface-2)', borderRadius: 99, padding: '4px 12px' }}>
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="btn-icon" style={{ width: 32, height: 32 }}>-</button>
              <input 
                type="number" 
                value={quantity} 
                onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                style={{ width: 40, textAlign: 'center', background: 'none', border: 'none', fontWeight: 600, fontSize: 16 }}
              />
              <button onClick={() => setQuantity(q => q + 1)} className="btn-icon" style={{ width: 32, height: 32 }}>+</button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 16, marginTop: 'auto' }}>
            <button 
              className="btn btn-primary" 
              style={{ flex: 1, borderRadius: 99, padding: '16px 0', fontSize: 16, display: 'flex', gap: 8, justifyContent: 'center' }}
              onClick={() => addToCart(product, quantity)}
            >
              <ShoppingCart size={20} /> Thêm vào giỏ hàng
            </button>
            <button 
              className="btn" 
              style={{ flex: 1, borderRadius: 99, padding: '16px 0', fontSize: 16, background: 'var(--color-text)', color: 'var(--color-background)' }}
              onClick={() => {
                addToCart(product, quantity);
                navigate('/checkout');
              }}
            >
              Mua ngay
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid var(--color-border)', marginBottom: 32, display: 'flex', gap: 32 }}>
        <button 
          style={{ padding: '16px 0', background: 'none', border: 'none', fontSize: 16, fontWeight: activeTab === 'description' ? 700 : 500, color: activeTab === 'description' ? 'var(--color-primary)' : 'var(--color-text-muted)', borderBottom: activeTab === 'description' ? '2px solid var(--color-primary)' : '2px solid transparent', cursor: 'pointer' }}
          onClick={() => setActiveTab('description')}
        >
          Mô tả sản phẩm
        </button>
        <button 
          style={{ padding: '16px 0', background: 'none', border: 'none', fontSize: 16, fontWeight: activeTab === 'comments' ? 700 : 500, color: activeTab === 'comments' ? 'var(--color-primary)' : 'var(--color-text-muted)', borderBottom: activeTab === 'comments' ? '2px solid var(--color-primary)' : '2px solid transparent', cursor: 'pointer' }}
          onClick={() => setActiveTab('comments')}
        >
          Bình luận & Đánh giá
        </button>
      </div>

      {/* Tab Content */}
      <div style={{ minHeight: 200 }}>
        {activeTab === 'description' && (
          <div style={{ lineHeight: 1.8, fontSize: 16 }}>
            <p><strong>Mã phụ tùng:</strong> {product.part_number}</p>
            <p>{product.description || 'Không có mô tả cho sản phẩm này.'}</p>
          </div>
        )}

        {activeTab === 'comments' && (
          <div>
            <form onSubmit={handleAddComment} style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                K
              </div>
              <div style={{ flex: 1, display: 'flex', gap: 16 }}>
                <input 
                  type="text" 
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Viết bình luận của bạn..." 
                  className="form-input" 
                  style={{ borderRadius: 99, paddingLeft: 24 }}
                />
                <button type="submit" className="btn btn-primary" style={{ borderRadius: 99, padding: '0 24px', display: 'flex', gap: 8 }}>
                  Gửi <Send size={16} />
                </button>
              </div>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {comments.map(comment => (
                <div key={comment.id} style={{ display: 'flex', gap: 16 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--color-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                    {comment.user.charAt(0)}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontWeight: 600 }}>{comment.user}</span>
                      <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{comment.date}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 8 }}>
                      {[1,2,3,4,5].map(i => <Star key={i} size={12} color="#FBBF24" fill={i <= comment.rating ? "#FBBF24" : "none"} />)}
                    </div>
                    <p style={{ fontSize: 15, lineHeight: 1.5 }}>{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

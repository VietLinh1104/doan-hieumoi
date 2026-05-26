import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { formatCurrency } from '@/lib/utils';
import { Search, Filter, ShoppingCart, Star } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

export default function ShopHomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api/v1';
        const catRes = await axios.get(`${baseURL}/categories`);
        setCategories(catRes.data?.data?.categories || catRes.data?.categories || catRes.data?.data || []);
      } catch (err) {
        console.error('Failed to fetch categories', err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api/v1';
        let url = `${baseURL}/products?limit=100`;
        if (selectedCategory) {
          url += `&category=${selectedCategory}`;
        }
        const prodRes = await axios.get(url);
        setProducts(prodRes.data?.data?.products || prodRes.data?.products || prodRes.data?.data || []);
      } catch (err) {
        console.error('Failed to fetch products', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [selectedCategory]);

  const filteredProducts = products.filter(product => {
    if (selectedPriceRange === 'low') {
      return product.price < 500000;
    }
    if (selectedPriceRange === 'mid') {
      return product.price >= 500000 && product.price <= 2000000;
    }
    if (selectedPriceRange === 'high') {
      return product.price > 2000000;
    }
    return true; // 'all'
  });

  return (
    <div className="animate-fadeIn">
      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
        borderRadius: 24, padding: '48px 40px', color: 'white', marginBottom: 32,
        display: 'flex', flexDirection: 'column', justifyContent: 'center'
      }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16 }}>
          Phụ tùng Chính hãng <br /> Cho mọi dòng xe
        </h1>
        <p style={{ fontSize: 16, opacity: 0.9, maxWidth: 500, marginBottom: 24, lineHeight: 1.6 }}>
          Cung cấp các loại phụ tùng, linh kiện ô tô chất lượng cao. Bảo hành chính hãng, giao hàng tận nơi trên toàn quốc.
        </p>
        <div>
          <button className="btn" style={{ background: 'white', color: 'var(--color-primary)', fontWeight: 700, padding: '12px 24px', borderRadius: 99 }}>
            Khám phá ngay
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 32 }}>
        {/* Sidebar Filters */}
        <aside style={{ width: 240, flexShrink: 0 }}>
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Filter size={18} /> Danh mục
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="category"
                  checked={selectedCategory === ''}
                  onChange={() => setSelectedCategory('')}
                />
                <span style={{ fontSize: 14 }}>Tất cả sản phẩm</span>
              </label>
              {categories.map(cat => (
                <label key={cat._id} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory === cat._id}
                    onChange={() => setSelectedCategory(cat._id)}
                  />
                  <span style={{ fontSize: 14 }}>{cat.name}</span>
                </label>
              ))}
            </div>

            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '24px 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
              Mức giá
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="price"
                  checked={selectedPriceRange === 'all'}
                  onChange={() => setSelectedPriceRange('all')}
                /> <span style={{ fontSize: 14 }}>Mọi mức giá</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="price"
                  checked={selectedPriceRange === 'low'}
                  onChange={() => setSelectedPriceRange('low')}
                /> <span style={{ fontSize: 14 }}>Dưới 500.000đ</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="price"
                  checked={selectedPriceRange === 'mid'}
                  onChange={() => setSelectedPriceRange('mid')}
                /> <span style={{ fontSize: 14 }}>500.000đ - 2.000.000đ</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="price"
                  checked={selectedPriceRange === 'high'}
                  onChange={() => setSelectedPriceRange('high')}
                /> <span style={{ fontSize: 14 }}>Trên 2.000.000đ</span>
              </label>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700 }}>Sản phẩm nổi bật</h2>
            <div style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>
              Hiển thị {filteredProducts.length} sản phẩm
            </div>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
              <div className="spinner"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-text-muted)' }}>
              Không tìm thấy phụ tùng phù hợp với tiêu chí lọc.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
              {filteredProducts.slice(0, 12).map(product => (
                <div key={product._id} className="card" onClick={() => navigate(`/product/${product._id}`)} style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'transform 0.2s', ':hover': { transform: 'translateY(-4px)' } }}>
                  <div style={{ height: 180, background: 'var(--color-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {product.main_image ? (
                      <img src={product.main_image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <Search size={40} style={{ opacity: 0.1 }} />
                    )}
                  </div>
                  <div style={{ padding: 16, display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ fontSize: 12, color: 'var(--color-primary)', fontWeight: 600, marginBottom: 4 }}>
                      {product.part_number}
                    </div>
                    <h3 style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.4, marginBottom: 8, color: 'var(--color-text)' }}>
                      {product.name}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 12 }}>
                      <Star size={14} color="#FBBF24" fill="#FBBF24" />
                      <span style={{ fontSize: 13, fontWeight: 600 }}>4.8</span>
                      <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>(124)</span>
                    </div>
                    <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)' }}>
                        {formatCurrency(product.price)}
                      </div>
                      <button
                        className="btn btn-primary btn-icon"
                        style={{ borderRadius: '50%', width: 36, height: 36 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product);
                        }}
                      >
                        <ShoppingCart size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

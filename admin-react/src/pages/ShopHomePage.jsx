import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { formatCurrency } from '@/lib/utils';
import { Search, Filter, ShoppingCart, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

export default function ShopHomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get('keyword') || '';

  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const PAGE_SIZE = 8;

  // Reset page to 1 when filters or search change
  useEffect(() => {
    setPage(1);
  }, [selectedCategory, selectedPriceRange, keyword]);

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
        let url = `${baseURL}/products?limit=${PAGE_SIZE}&page=${page}`;
        if (selectedCategory) {
          url += `&category=${selectedCategory}`;
        }
        if (keyword) {
          url += `&keyword=${encodeURIComponent(keyword)}`;
        }
        if (selectedPriceRange !== 'all') {
          url += `&priceRange=${selectedPriceRange}`;
        }
        const prodRes = await axios.get(url);
        const resData = prodRes.data?.data || {};
        setProducts(resData.products || []);
        setTotalProducts(resData.total || 0);
        setTotalPages(resData.pages || 1);
      } catch (err) {
        console.error('Failed to fetch products', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [selectedCategory, keyword, selectedPriceRange, page]);

  const filteredProducts = products;

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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div>
              {keyword ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <h2 style={{ fontSize: 20, fontWeight: 700 }}>
                    Kết quả tìm kiếm cho: <span style={{ color: 'var(--color-primary)' }}>"{keyword}"</span>
                  </h2>
                  <button 
                    onClick={() => {
                      const params = new URLSearchParams(searchParams);
                      params.delete('keyword');
                      setSearchParams(params);
                    }}
                    className="btn btn-ghost"
                    style={{ padding: '4px 10px', fontSize: 12, borderRadius: 99, background: 'var(--color-surface-2)', display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    Xóa tìm kiếm
                  </button>
                </div>
              ) : (
                <h2 style={{ fontSize: 20, fontWeight: 700 }}>Sản phẩm nổi bật</h2>
              )}
            </div>
            <div style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>
              Tổng số: {totalProducts} sản phẩm
            </div>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
              <div className="spinner"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              <Search size={48} style={{ opacity: 0.2, marginBottom: 8 }} />
              <p style={{ fontSize: 16, fontWeight: 500 }}>
                Không tìm thấy phụ tùng nào phù hợp với bộ lọc hoặc từ khóa.
              </p>
              {(keyword || selectedCategory || selectedPriceRange !== 'all') && (
                <button 
                  onClick={() => {
                    setSelectedCategory('');
                    setSelectedPriceRange('all');
                    const params = new URLSearchParams(searchParams);
                    params.delete('keyword');
                    setSearchParams(params);
                  }}
                  className="btn btn-primary btn-sm"
                  style={{ borderRadius: 99 }}
                >
                  Xóa bộ lọc & Tìm kiếm
                </button>
              )}
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
                {filteredProducts.map(product => (
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

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 32, paddingTop: 16, borderTop: '1px solid var(--color-border)' }}>
                  <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                    Trang {page} / {totalPages}
                  </span>
                  <div className="pagination">
                    <button 
                      className="page-btn" 
                      disabled={page <= 1} 
                      onClick={() => { setPage(p => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    >
                      <ChevronLeft size={14} />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => {
                      const p = i + 1;
                      return (
                        <button 
                          key={p} 
                          className={`page-btn ${page === p ? 'active' : ''}`} 
                          onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        >
                          {p}
                        </button>
                      );
                    })}
                    <button 
                      className="page-btn" 
                      disabled={page >= totalPages} 
                      onClick={() => { setPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

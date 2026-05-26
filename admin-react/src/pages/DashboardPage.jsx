import { useQuery } from '@tanstack/react-query';
import { ProductAdminAPI, OrderAdminAPI, CategoryAdminAPI, AuthAdminAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency, getOrderStatusClass, getOrderStatusLabel, formatDate } from '@/lib/utils';
import { Package, ShoppingCart, Tag, TrendingUp, Clock, CheckCircle, AlertCircle, ArrowUpRight, BarChart2, Star, Users } from 'lucide-react';

function StatCard({ label, value, icon: Icon, color, sub }) {
  return (
    <div className="stat-card animate-fadeIn">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{
          width: 42, height: 42, borderRadius: 10,
          background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={20} color={color} />
        </div>
        <ArrowUpRight size={16} style={{ color: 'var(--color-text-muted)', opacity: 0.5 }} />
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-text)', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 6 }}>{label}</div>
      {sub && <div style={{ fontSize: 12, color, marginTop: 4, fontWeight: 500 }}>{sub}</div>}
    </div>
  );
}

function OrderStatusBadge({ status }) {
  return (
    <span className={`badge ${getOrderStatusClass(status)}`}>
      {getOrderStatusLabel(status)}
    </span>
  );
}

export default function DashboardPage() {
  const { user: currentUser } = useAuth();

  const { data: products, isLoading: loadingProducts } = useQuery({
    queryKey: ['products', 'dashboard'],
    queryFn: () => ProductAdminAPI.getProducts({ limit: 100 }),
  });

  const { data: orders, isLoading: loadingOrders } = useQuery({
    queryKey: ['orders', 'dashboard'],
    queryFn: () => OrderAdminAPI.getAll(),
  });

  const { data: categories, isLoading: loadingCategories } = useQuery({
    queryKey: ['categories', 'dashboard'],
    queryFn: () => CategoryAdminAPI.getAll(),
  });

  const { data: usersData } = useQuery({
    queryKey: ['users', 'dashboard'],
    queryFn: () => AuthAdminAPI.getUsers(),
    enabled: currentUser?.role === 'admin',
  });

  const productList = products?.data?.products || products?.products || (Array.isArray(products?.data) ? products?.data : (Array.isArray(products) ? products : []));
  const orderList = orders?.data?.orders || orders?.orders || (Array.isArray(orders?.data) ? orders?.data : (Array.isArray(orders) ? orders : []));
  const categoryList = categories?.data?.categories || categories?.categories || (Array.isArray(categories?.data) ? categories?.data : (Array.isArray(categories) ? categories : []));
  const userList = usersData?.data || usersData || [];

  const totalRevenue = orderList
    .filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + (o.total_price || o.total_amount || o.totalAmount || 0), 0);

  const pendingOrders = orderList.filter(o => o.status === 'pending').length;
  const recentOrders = [...orderList]
    .sort((a, b) => new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at))
    .slice(0, 8);

  // Group revenue by last 6 months
  const monthlyData = [];
  const monthNames = ['Th 1', 'Th 2', 'Th 3', 'Th 4', 'Th 5', 'Th 6', 'Th 7', 'Th 8', 'Th 9', 'Th 10', 'Th 11', 'Th 12'];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const m = d.getMonth();
    const y = d.getFullYear();
    monthlyData.push({ month: m, year: y, label: `${monthNames[m]}`, value: 0 });
  }

  orderList.filter(o => o.status === 'delivered').forEach(order => {
    const date = new Date(order.createdAt || order.created_at);
    const m = date.getMonth();
    const y = date.getFullYear();
    const match = monthlyData.find(d => d.month === m && d.year === y);
    if (match) {
      match.value += (order.total_price || order.total_amount || 0);
    }
  });

  const maxRevenue = Math.max(...monthlyData.map(d => d.value), 1);

  // Best sellers
  const productSales = {};
  orderList.filter(o => o.status === 'delivered').forEach(order => {
    const items = order.orderItems || order.items || [];
    items.forEach(item => {
      const pId = item.product_id?._id || item.product_id || item.id;
      if (pId) {
        if (!productSales[pId]) {
          productSales[pId] = {
            name: item.product_id?.name || item.name || 'Sản phẩm',
            qty: 0,
            revenue: 0
          };
        }
        productSales[pId].qty += (item.quantity || 1);
        productSales[pId].revenue += (item.quantity || 1) * (item.price_at_purchase || item.price || 0);
      }
    });
  });
  const bestSellersList = Object.values(productSales)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Page header */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text)' }}>Dashboard</h1>
        <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginTop: 4 }}>
          Tổng quan hệ thống cửa hàng AutoParts
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <StatCard
          label="Tổng sản phẩm"
          value={loadingProducts ? '—' : productList.length}
          icon={Package}
          color="var(--color-primary)"
          sub="Mã phụ tùng"
        />
        <StatCard
          label="Tổng đơn hàng"
          value={loadingOrders ? '—' : orderList.length}
          icon={ShoppingCart}
          color="var(--color-accent)"
          sub={pendingOrders ? `${pendingOrders} chờ xử lý` : 'Cập nhật'}
        />
        <StatCard
          label="Danh mục"
          value={loadingCategories ? '—' : categoryList.length}
          icon={Tag}
          color="var(--color-secondary)"
          sub="Phân loại"
        />
        <StatCard
          label="Doanh thu"
          value={loadingOrders ? '—' : formatCurrency(totalRevenue)}
          icon={TrendingUp}
          color="var(--color-success)"
          sub="Đã giao thành công"
        />
      </div>

      {/* Recent orders */}
      <div className="card">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Clock size={16} color="var(--color-primary)" />
            <span style={{ fontWeight: 600, fontSize: 15 }}>Đơn hàng gần đây</span>
          </div>
          <a href="/admin/orders" style={{ fontSize: 13, color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 500 }}>
            Xem tất cả →
          </a>
        </div>
        <div style={{ overflowX: 'auto' }}>
          {loadingOrders ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)' }}>
              <div className="spinner" style={{ margin: '0 auto 12px', borderTopColor: 'var(--color-primary)' }} />
              Đang tải...
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="empty-state">
              <ShoppingCart size={40} />
              <p style={{ fontWeight: 500 }}>Chưa có đơn hàng nào</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th>Sản phẩm</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th>Ngày đặt</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => {
                  let parsedAddress = {};
                  if (order.shipping_address) {
                    if (typeof order.shipping_address === 'object') {
                      parsedAddress = order.shipping_address;
                    } else {
                      try {
                        parsedAddress = JSON.parse(order.shipping_address);
                      } catch (e) {
                        parsedAddress = { address: order.shipping_address.toString() };
                      }
                    }
                  }
                  const customer = parsedAddress.fullName || order.user_id?.fullname || order.user?.name || order.user?.email || order.customer_name || '—';
                  const itemsCount = order.orderItems?.length || order.items?.length || order.order_items?.length || 0;
                  const total = order.total_price || order.total_amount || order.totalAmount || 0;

                  return (
                    <tr key={order._id || order.id}>
                      <td style={{ fontWeight: 600, color: 'var(--color-primary)', fontSize: 13 }}>
                        #{(order._id || order.id || '').toString().slice(-6).toUpperCase()}
                      </td>
                      <td style={{ color: 'var(--color-text)' }}>
                        {customer}
                      </td>
                      <td style={{ color: 'var(--color-text-subtle)' }}>
                        {itemsCount} sản phẩm
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {formatCurrency(total)}
                      </td>
                      <td><OrderStatusBadge status={order.status} /></td>
                      <td style={{ color: 'var(--color-text-subtle)', fontSize: 13 }}>
                        {formatDate(order.createdAt || order.created_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Revenue Chart & Best Sellers */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        {/* CSS Chart */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <BarChart2 size={16} color="var(--color-primary)" />
            Doanh thu 6 tháng gần nhất
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: 180, padding: '10px 0 20px', borderBottom: '1px solid var(--color-border)' }}>
            {monthlyData.map((d, i) => {
              const heightPct = Math.round((d.value / maxRevenue) * 100);
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-primary)', opacity: d.value ? 1 : 0 }}>
                    {d.value >= 1000000 ? `${(d.value / 1000000).toFixed(1)}M` : d.value > 0 ? `${Math.round(d.value / 1000)}k` : '0'}
                  </div>
                  <div style={{
                    width: '45%',
                    height: `${Math.max(heightPct, 3)}%`,
                    minHeight: 4,
                    background: 'linear-gradient(to top, var(--color-primary), var(--color-secondary))',
                    borderRadius: '4px 4px 0 0',
                    transition: 'height 0.5s ease',
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.15)'
                  }} />
                  <div style={{ fontSize: 12, color: 'var(--color-text-subtle)', fontWeight: 500 }}>
                    {d.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Best sellers */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Star size={16} color="var(--color-warning)" fill="var(--color-warning)" />
            Bán chạy nhất
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {bestSellersList.length === 0 ? (
              <div style={{ color: 'var(--color-text-muted)', fontSize: 13, textAlign: 'center', padding: 20 }}>Chưa có doanh số bán hàng</div>
            ) : bestSellersList.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 8, borderBottom: i < bestSellersList.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                <div style={{ minWidth: 0, flex: 1, marginRight: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>{formatCurrency(item.revenue)}</div>
                </div>
                <span className="badge badge-purple" style={{ flexShrink: 0 }}>
                  Đã bán {item.qty}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Order status breakdown */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle size={16} color="var(--color-success)" />
            Phân bổ trạng thái đơn hàng
          </div>
          {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => {
            const count = orderList.filter(o => o.status === status).length;
            const pct = orderList.length ? Math.round((count / orderList.length) * 100) : 0;
            return (
              <div key={status} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 13, color: 'var(--color-text-subtle)' }}>{getOrderStatusLabel(status)}</span>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{count}</span>
                </div>
                <div style={{ height: 4, background: 'var(--color-border)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 99, width: `${pct}%`,
                    background: status === 'delivered' ? 'var(--color-success)'
                      : status === 'cancelled' ? 'var(--color-danger)'
                        : status === 'shipped' ? 'var(--color-secondary)'
                          : status === 'processing' ? 'var(--color-accent)'
                            : 'var(--color-warning)',
                    transition: 'width 0.5s ease',
                  }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Low stock / top categories */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={16} color="var(--color-warning)" />
            Sản phẩm sắp hết hàng
          </div>
          {loadingProducts ? (
            <div style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>Đang tải...</div>
          ) : (
            productList
              .filter(p => (p.stock || p.quantity || 0) < 10)
              .slice(0, 5)
              .map(p => (
                <div key={p._id || p.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 0', borderBottom: '1px solid var(--color-border)',
                }}>
                  <span style={{ fontSize: 13, color: 'var(--color-text)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: 8 }}>
                    {p.name}
                  </span>
                  <span className="badge badge-danger" style={{ flexShrink: 0 }}>
                    Còn {p.stock ?? p.quantity ?? 0}
                  </span>
                </div>
              ))
          )}
          {!loadingProducts && productList.filter(p => (p.stock || p.quantity || 0) < 10).length === 0 && (
            <div style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>Không có sản phẩm sắp hết hàng</div>
          )}
        </div>
      </div>

      {/* Admin Account Statistics */}
      {currentUser?.role === 'admin' && (
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={16} color="var(--color-primary)" />
            Báo cáo tài khoản & Nhân sự
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            <div style={{ background: 'var(--color-surface-2)', padding: 16, borderRadius: 10, textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text)' }}>
                {userList.filter(u => u.role === 'admin').length}
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>Quản trị viên</div>
            </div>
            <div style={{ background: 'var(--color-surface-2)', padding: 16, borderRadius: 10, textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text)' }}>
                {userList.filter(u => u.role === 'staff').length}
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>Nhân viên vận hành</div>
            </div>
            <div style={{ background: 'var(--color-surface-2)', padding: 16, borderRadius: 10, textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text)' }}>
                {userList.filter(u => u.role === 'user').length}
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>Khách hàng đăng ký</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

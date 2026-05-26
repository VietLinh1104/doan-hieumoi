import { useQuery } from '@tanstack/react-query';
import { ProductAdminAPI, OrderAdminAPI, CategoryAdminAPI } from '@/services/api';
import { formatCurrency, getOrderStatusClass, getOrderStatusLabel, formatDate } from '@/lib/utils';
import { Package, ShoppingCart, Tag, TrendingUp, Clock, CheckCircle, AlertCircle, ArrowUpRight } from 'lucide-react';

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

  const productList = products?.data?.products || products?.products || (Array.isArray(products?.data) ? products?.data : (Array.isArray(products) ? products : []));
  const orderList = orders?.data?.orders || orders?.orders || (Array.isArray(orders?.data) ? orders?.data : (Array.isArray(orders) ? orders : []));
  const categoryList = categories?.data?.categories || categories?.categories || (Array.isArray(categories?.data) ? categories?.data : (Array.isArray(categories) ? categories : []));

  const totalRevenue = orderList
    .filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + (o.total_price || o.total_amount || o.totalAmount || 0), 0);

  const pendingOrders = orderList.filter(o => o.status === 'pending').length;
  const recentOrders = [...orderList]
    .sort((a, b) => new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at))
    .slice(0, 8);

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
    </div>
  );
}

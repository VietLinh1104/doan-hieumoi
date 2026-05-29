import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { OrderAdminAPI } from '@/services/api';
import { formatCurrency, formatDate, getOrderStatusClass, getOrderStatusLabel } from '@/lib/utils';
import { ShoppingBag, X, Calendar, DollarSign, Eye, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

function OrderHistoryDetailModal({ open, onClose, order }) {
  if (!open || !order) return null;

  const items = order.orderItems || order.items || order.order_items || [];
  const total = order.total_price || order.total_amount || order.totalAmount || order.total || 0;
  const shortId = (order._id || order.id || '').toString().slice(-8).toUpperCase();

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 520 }}>
        <div className="modal-header">
          <h2 style={{ fontSize: 17, fontWeight: 700 }}>Chi tiết đơn hàng #{shortId}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
              Trạng thái đơn:
            </span>
            <span className={`badge ${getOrderStatusClass(order.status)}`}>
              {getOrderStatusLabel(order.status)}
            </span>
          </div>

          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-subtle)', marginBottom: 8 }}>
              Sản phẩm đã đặt
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {items.map((item, i) => {
                const product = item.product_id || item.product;
                const name = product?.name || item.name || 'Sản phẩm';
                const qty = item.quantity || item.qty || 1;
                const price = item.price_at_purchase || item.price || product?.price || 0;
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: 'var(--color-surface-2)', borderRadius: 8 }}>
                    {(product?.main_image || product?.imageUrl || product?.image_url) ? (
                      <img src={product.main_image || product.imageUrl || product.image_url} alt={name} style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 6 }} />
                    ) : (
                      <div style={{ width: 36, height: 36, background: 'var(--color-border)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Package size={16} color="var(--color-text-muted)" />
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>x{qty} × {formatCurrency(price)}</div>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--color-primary)' }}>
                      {formatCurrency(qty * price)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderTop: '1px solid var(--color-border)' }}>
            <span style={{ fontWeight: 600 }}>Tổng tiền thanh toán</span>
            <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-primary)' }}>{formatCurrency(total)}</span>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  );
}

export default function OrderHistoryPage() {
  const qc = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Pagination states
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 5;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['my-orders', page],
    queryFn: () => OrderAdminAPI.getMyOrders({ page, limit: PAGE_SIZE }),
  });

  const cancelMutation = useMutation({
    mutationFn: (id) => OrderAdminAPI.cancel(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-orders'] });
    },
  });

  const orders = data?.data?.orders || data?.orders || [];
  const totalPages = data?.data?.pages || data?.pages || 1;

  return (
    <div className="animate-fadeIn" style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-text)' }}>Lịch sử mua hàng</h1>
        <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginTop: 4 }}>
          Xem các đơn hàng bạn đã mua và theo dõi trạng thái giao hàng.
        </p>
      </div>

      {isLoading ? (
        <div style={{ padding: 60, textAlign: 'center', color: 'var(--color-text-muted)' }}>
          <div className="spinner" style={{ margin: '0 auto 12px', width: 24, height: 24, borderTopColor: 'var(--color-primary)' }} />
          Đang tải lịch sử đơn hàng...
        </div>
      ) : isError ? (
        <div className="card empty-state" style={{ padding: 60 }}>
          <ShoppingBag size={40} />
          <p>Lỗi tải dữ liệu đơn hàng cá nhân</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="card empty-state" style={{ padding: 60 }}>
          <ShoppingBag size={48} style={{ opacity: 0.2 }} />
          <p style={{ fontWeight: 600, fontSize: 15, color: 'var(--color-text-subtle)' }}>Bạn chưa đặt đơn hàng nào</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {orders.map(order => {
            const orderId = (order._id || order.id || '').toString();
            const shortId = orderId.slice(-8).toUpperCase();
            const items = order.orderItems || order.items || order.order_items || [];
            const total = order.total_price || order.total_amount || order.total || 0;
            const date = order.createdAt || order.created_at;

            return (
              <div key={orderId} className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Top info */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <span style={{ fontWeight: 700, color: 'var(--color-primary)', fontFamily: 'monospace', fontSize: 15 }}>
                      #{shortId}
                    </span>
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Calendar size={12} /> {formatDate(date)}
                    </div>
                  </div>
                  <span className={`badge ${getOrderStatusClass(order.status)}`}>
                    {getOrderStatusLabel(order.status)}
                  </span>
                </div>

                {/* Items brief */}
                <div style={{ padding: '10px 12px', background: 'var(--color-surface-2)', borderRadius: 8, fontSize: 13, color: 'var(--color-text-subtle)' }}>
                  {items.length > 0 ? (
                    <div>
                      Mua: <strong>{items[0].product_id?.name || items[0].name || 'Sản phẩm'}</strong>
                      {items.length > 1 && ` và ${items.length - 1} sản phẩm khác`}
                    </div>
                  ) : 'Không có thông tin sản phẩm'}
                </div>

                {/* Action footer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-border)', paddingTop: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Tổng thanh toán:</span>
                    <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--color-text)' }}>{formatCurrency(total)}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => setSelectedOrder(order)} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Eye size={14} /> Chi tiết
                    </button>
                    {order.status === 'pending' && (
                      <button
                        className="btn btn-danger btn-sm"
                        disabled={cancelMutation.isPending}
                        onClick={() => {
                          if (window.confirm('Bạn có chắc muốn huỷ đơn hàng này?')) {
                            cancelMutation.mutate(orderId);
                          }
                        }}
                        style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        {cancelMutation.isPending && cancelMutation.variables === orderId ? (
                          <span className="spinner" style={{ width: 12, height: 12, borderTopColor: 'white' }} />
                        ) : (
                          <X size={14} />
                        )}
                        Huỷ đơn
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

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
        </div>
      )}

      <OrderHistoryDetailModal
        open={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
      />
    </div>
  );
}

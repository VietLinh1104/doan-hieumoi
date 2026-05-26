import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { OrderAdminAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency, formatDate, getOrderStatusClass, getOrderStatusLabel, truncate } from '@/lib/utils';
import { ShoppingCart, X, Eye, Trash2, ChevronDown, Package, User, MapPin, Phone } from 'lucide-react';

const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

function StatusBadge({ status }) {
  return <span className={`badge ${getOrderStatusClass(status)}`}>{getOrderStatusLabel(status)}</span>;
}

function OrderDetailModal({ open, onClose, order }) {
  const qc = useQueryClient();
  const [updating, setUpdating] = useState(false);

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => OrderAdminAPI.updateStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  if (!open || !order) return null;

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

  const items = order.orderItems || order.items || order.order_items || [];
  const total = order.total_price || order.total_amount || order.totalAmount || order.total || 0;
  const orderId = (order._id || order.id || '').toString();
  const shortId = orderId.slice(-8).toUpperCase();

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 600 }}>
        <div className="modal-header">
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700 }}>Chi tiết đơn #{shortId}</h2>
            <div style={{ marginTop: 4 }}><StatusBadge status={order.status} /></div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Customer info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ background: 'var(--color-surface-2)', borderRadius: 'var(--radius-md)', padding: '12px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-muted)', fontSize: 12, marginBottom: 6 }}>
                <User size={13} /> Khách hàng
              </div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>
                {parsedAddress.fullName || order.user_id?.fullname || order.user?.name || order.customerName || order.customer_name || '—'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-text-subtle)', marginTop: 2 }}>
                {order.user_id?.email || order.user?.email || order.email || '—'}
              </div>
            </div>
            <div style={{ background: 'var(--color-surface-2)', borderRadius: 'var(--radius-md)', padding: '12px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-muted)', fontSize: 12, marginBottom: 6 }}>
                <MapPin size={13} /> Địa chỉ giao
              </div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>
                {parsedAddress.address || order.shipping_address || order.shippingAddress || order.address || '—'}
              </div>
              {(parsedAddress.phone || order.phone || order.user_id?.phone || order.user?.phone) && (
                <div style={{ fontSize: 12, color: 'var(--color-text-subtle)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Phone size={11} /> {parsedAddress.phone || order.phone || order.user_id?.phone || order.user?.phone}
                </div>
              )}
            </div>
          </div>

          {/* Order items */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-subtle)', marginBottom: 8 }}>
              Sản phẩm đặt ({items.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 220, overflowY: 'auto' }}>
              {items.length === 0 ? (
                <div style={{ color: 'var(--color-text-muted)', fontSize: 14, textAlign: 'center', padding: 16 }}>Không có thông tin sản phẩm</div>
              ) : items.map((item, i) => {
                const product = item.product_id || item.product || item;
                const name = product?.name || item.product_name || item.name || 'Sản phẩm';
                const qty = item.quantity || item.qty || 1;
                const price = item.price_at_purchase || item.price || item.unit_price || product?.price || 0;
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: 'var(--color-surface-2)', borderRadius: 8 }}>
                    {(product?.main_image || product?.image_url || product?.imageUrl) ? (
                      <img src={product?.main_image || product?.image_url || product?.imageUrl} alt={name} style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 6 }} />
                    ) : (
                      <div style={{ width: 36, height: 36, background: 'var(--color-border)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Package size={16} color="var(--color-text-muted)" />
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>x{qty} × {formatCurrency(price)}</div>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--color-primary)', flexShrink: 0 }}>
                      {formatCurrency(qty * price)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Total */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderTop: '1px solid var(--color-border)' }}>
            <span style={{ fontWeight: 600 }}>Tổng cộng</span>
            <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-primary)' }}>{formatCurrency(total)}</span>
          </div>

          {/* Change status */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-subtle)', marginBottom: 8 }}>Cập nhật trạng thái đơn</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {ORDER_STATUSES.map(s => (
                <button
                  key={s}
                  className={`btn btn-xs ${order.status === s ? 'btn-primary' : 'btn-secondary'}`}
                  disabled={order.status === s || statusMutation.isPending}
                  onClick={() => statusMutation.mutate({ id: orderId, status: s })}
                  style={{ opacity: order.status === s ? 1 : 0.8 }}
                >
                  {statusMutation.isPending && statusMutation.variables?.status === s
                    ? <span className="spinner" style={{ width: 12, height: 12, borderTopColor: 'white' }} />
                    : null}
                  {getOrderStatusLabel(s)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)', flex: 1 }}>
            Đặt lúc: {formatDate(order.createdAt || order.created_at)}
          </div>
          <button className="btn btn-secondary" onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  );
}

function DeleteConfirm({ open, onClose, onConfirm, orderId, loading }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 400 }}>
        <div className="modal-header">
          <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-danger)' }}>Xoá đơn hàng</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          <p style={{ color: 'var(--color-text-subtle)', lineHeight: 1.7 }}>
            Bạn có chắc muốn xoá đơn hàng <strong style={{ color: 'var(--color-text)' }}>#{orderId?.slice(-8).toUpperCase()}</strong>? Thao tác này không thể hoàn tác.
          </p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Huỷ</button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
            {loading && <span className="spinner" style={{ borderTopColor: 'var(--color-danger)' }} />}
            Xoá đơn
          </button>
        </div>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [filterStatus, setFilterStatus] = useState('');
  const [detailOrder, setDetailOrder] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['orders'],
    queryFn: () => OrderAdminAPI.getAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => OrderAdminAPI.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      setDeleteTarget(null);
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => OrderAdminAPI.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  });

  const orderList = data?.orders || data?.data || data || [];
  const filtered = filterStatus
    ? orderList.filter(o => o.status === filterStatus)
    : orderList;

  const sorted = [...filtered].sort(
    (a, b) => new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at)
  );

  const counts = ORDER_STATUSES.reduce((acc, s) => {
    acc[s] = orderList.filter(o => o.status === s).length;
    return acc;
  }, {});

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Quản lý Đơn hàng</h1>
        <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginTop: 4 }}>
          {isLoading ? 'Đang tải...' : `${orderList.length} đơn hàng tổng cộng`}
        </p>
      </div>

      {/* Status filter tabs */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          className={`btn btn-sm ${!filterStatus ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setFilterStatus('')}
        >
          Tất cả <span style={{ marginLeft: 4, opacity: 0.7 }}>({orderList.length})</span>
        </button>
        {ORDER_STATUSES.map(s => (
          <button
            key={s}
            className={`btn btn-sm ${filterStatus === s ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterStatus(s)}
          >
            {getOrderStatusLabel(s)}
            <span style={{ marginLeft: 4, opacity: 0.7 }}>({counts[s] || 0})</span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <div className="spinner" style={{ margin: '0 auto 12px', width: 24, height: 24, borderTopColor: 'var(--color-primary)' }} />
            Đang tải đơn hàng...
          </div>
        ) : isError ? (
          <div className="empty-state">
            <ShoppingCart size={40} />
            <p>Lỗi tải dữ liệu</p>
          </div>
        ) : sorted.length === 0 ? (
          <div className="empty-state">
            <ShoppingCart size={48} />
            <p style={{ fontWeight: 600, fontSize: 15 }}>
              {filterStatus ? `Không có đơn "${getOrderStatusLabel(filterStatus)}"` : 'Chưa có đơn hàng nào'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th>Sản phẩm</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th>Đổi trạng thái</th>
                  <th>Ngày đặt</th>
                  <th style={{ width: 90 }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map(order => {
                  const orderId = (order._id || order.id || '').toString();
                  const items = order.orderItems || order.items || order.order_items || [];
                  const total = order.total_price || order.total_amount || order.totalAmount || order.total || 0;

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
                  const customer = parsedAddress.fullName || order.user_id?.fullname || order.user_id?.email || order.user?.name || order.user?.email || order.customerName || order.customer_name || '—';

                  return (
                    <tr key={orderId} className="animate-fadeIn">
                      <td style={{ fontWeight: 700, color: 'var(--color-primary)', fontFamily: 'monospace', fontSize: 13 }}>
                        #{orderId.slice(-8).toUpperCase()}
                      </td>
                      <td>
                        <div style={{ fontWeight: 500, fontSize: 13 }}>{truncate(customer, 25)}</div>
                      </td>
                      <td style={{ color: 'var(--color-text-subtle)', fontSize: 13 }}>
                        {items.length} sản phẩm
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--color-text)' }}>
                        {formatCurrency(total)}
                      </td>
                      <td><StatusBadge status={order.status} /></td>
                      <td>
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                          <select
                            value={order.status}
                            onChange={e => statusMutation.mutate({ id: orderId, status: e.target.value })}
                            className="form-input"
                            style={{ padding: '4px 28px 4px 10px', fontSize: 12, height: 30, cursor: 'pointer', appearance: 'none' }}
                            disabled={statusMutation.isPending}
                          >
                            {ORDER_STATUSES.map(s => (
                              <option key={s} value={s}>{getOrderStatusLabel(s)}</option>
                            ))}
                          </select>
                          <ChevronDown size={12} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--color-text-muted)' }} />
                        </div>
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--color-text-subtle)' }}>
                        {formatDate(order.createdAt || order.created_at)}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            className="btn btn-ghost btn-icon btn-sm"
                            onClick={() => setDetailOrder(order)}
                            title="Xem chi tiết"
                            style={{ color: 'var(--color-accent)' }}
                          >
                            <Eye size={15} />
                          </button>
                          {user?.role === 'admin' && (
                            <button
                              className="btn btn-ghost btn-icon btn-sm"
                              onClick={() => setDeleteTarget(order)}
                              title="Xoá đơn"
                              style={{ color: 'var(--color-danger)' }}
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <OrderDetailModal
        open={Boolean(detailOrder)}
        onClose={() => setDetailOrder(null)}
        order={detailOrder}
      />
      <DeleteConfirm
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget?._id || deleteTarget?.id)}
        orderId={(deleteTarget?._id || deleteTarget?.id || '').toString()}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}

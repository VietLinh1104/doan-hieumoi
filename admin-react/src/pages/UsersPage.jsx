import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AuthAdminAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, UserPlus, Lock, Unlock, Mail, Shield, User, Phone, X } from 'lucide-react';

const schema = z.object({
  fullname: z.string().min(2, 'Họ tên tối thiểu 2 ký tự'),
  email: z.string().min(1, 'Vui lòng nhập email').email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
  phone: z.string().optional().or(z.literal('')),
  role: z.enum(['admin', 'staff', 'user']),
});

function UserCreateModal({ open, onClose }) {
  const qc = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { fullname: '', email: '', password: '', phone: '', role: 'staff' }
  });

  const mutation = useMutation({
    mutationFn: (data) => AuthAdminAPI.createUser(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      reset();
      onClose();
    },
  });

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <h2 style={{ fontSize: 17, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <UserPlus size={18} /> Tạo tài khoản nhân sự mới
          </h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit((d) => mutation.mutateAsync(d))}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {mutation.error && (
              <div className="alert alert-error">{mutation.error.message}</div>
            )}

            <div>
              <label className="form-label">Họ và tên *</label>
              <input
                {...register('fullname')}
                className={`form-input ${errors.fullname ? 'error' : ''}`}
                placeholder="VD: Nguyễn Văn A"
              />
              {errors.fullname && <p className="form-error">{errors.fullname.message}</p>}
            </div>

            <div>
              <label className="form-label">Email đăng nhập *</label>
              <input
                {...register('email')}
                type="email"
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="email@example.com"
              />
              {errors.email && <p className="form-error">{errors.email.message}</p>}
            </div>

            <div>
              <label className="form-label">Mật khẩu *</label>
              <input
                {...register('password')}
                type="password"
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="Tối thiểu 6 ký tự"
              />
              {errors.password && <p className="form-error">{errors.password.message}</p>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label className="form-label">Số điện thoại</label>
                <input
                  {...register('phone')}
                  className="form-input"
                  placeholder="0987654321"
                />
              </div>
              <div>
                <label className="form-label">Vai trò *</label>
                <select
                  {...register('role')}
                  className="form-input"
                >
                  <option value="staff">Nhân viên</option>
                  <option value="admin">Quản trị viên</option>
                  <option value="user">Khách hàng</option>
                </select>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Huỷ</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting || mutation.isPending}>
              {(isSubmitting || mutation.isPending) && <span className="spinner" />}
              Tạo tài khoản
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function UsersPage() {
  const qc = useQueryClient();
  const { user: currentUser } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [filterRole, setFilterRole] = useState('all');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['users'],
    queryFn: () => AuthAdminAPI.getUsers(),
  });

  const lockMutation = useMutation({
    mutationFn: (id) => AuthAdminAPI.toggleUserLock(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const userList = data?.data || data || [];
  const filteredUsers = filterRole === 'all'
    ? userList
    : userList.filter(u => u.role === filterRole);

  const getRoleBadgeClass = (role) => {
    if (role === 'admin') return 'badge-danger';
    if (role === 'staff') return 'badge-warning';
    return 'badge-success';
  };

  const getRoleLabel = (role) => {
    if (role === 'admin') return 'Admin';
    if (role === 'staff') return 'Nhân viên';
    return 'Khách hàng';
  };

  if (currentUser?.role !== 'admin') {
    return (
      <div className="card empty-state" style={{ padding: 80 }}>
        <Shield size={48} color="var(--color-danger)" />
        <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 12 }}>Truy cập bị từ chối</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>Chỉ Quản trị viên mới được phép quản lý tài khoản nhân sự.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Quản lý Nhân sự & Người dùng</h1>
          <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginTop: 4 }}>
            {isLoading ? 'Đang tải...' : `${userList.length} tài khoản trong hệ thống`}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          <UserPlus size={16} /> Tạo tài khoản nhân viên
        </button>
      </div>

      {/* Role filter tabs */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          className={`btn btn-sm ${filterRole === 'all' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setFilterRole('all')}
        >
          Tất cả ({userList.length})
        </button>
        <button
          className={`btn btn-sm ${filterRole === 'admin' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setFilterRole('admin')}
        >
          Quản trị viên ({userList.filter(u => u.role === 'admin').length})
        </button>
        <button
          className={`btn btn-sm ${filterRole === 'staff' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setFilterRole('staff')}
        >
          Nhân viên ({userList.filter(u => u.role === 'staff').length})
        </button>
        <button
          className={`btn btn-sm ${filterRole === 'user' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setFilterRole('user')}
        >
          Khách hàng ({userList.filter(u => u.role === 'user').length})
        </button>
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <div className="spinner" style={{ margin: '0 auto 12px', width: 24, height: 24, borderTopColor: 'var(--color-primary)' }} />
            Đang tải dữ liệu người dùng...
          </div>
        ) : isError ? (
          <div className="empty-state">
            <Shield size={40} />
            <p>Lỗi tải dữ liệu người dùng</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="empty-state">
            <User size={48} />
            <p style={{ fontWeight: 600, fontSize: 15 }}>Không tìm thấy tài khoản phù hợp</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Họ và tên</th>
                  <th>Email</th>
                  <th>Số điện thoại</th>
                  <th>Vai trò</th>
                  <th>Trạng thái</th>
                  <th style={{ width: 140, textAlign: 'center' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => {
                  const isSelf = u._id === currentUser?.id || u.email === currentUser?.email;
                  return (
                    <tr key={u._id} className="animate-fadeIn" style={{ opacity: u.is_locked ? 0.6 : 1 }}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: '50%',
                            background: u.is_locked ? '#64748b' : 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 13, fontWeight: 700, color: 'white', flexShrink: 0
                          }}>
                            {u.fullname ? u.fullname[0].toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>
                              {u.fullname} {isSelf && <span style={{ fontSize: 11, color: 'var(--color-primary)', fontStyle: 'italic' }}>(Tôi)</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: 13, color: 'var(--color-text-subtle)' }}>{u.email}</span>
                      </td>
                      <td>
                        <span style={{ fontSize: 13, color: 'var(--color-text-subtle)' }}>{u.phone || '—'}</span>
                      </td>
                      <td>
                        <span className={`badge ${getRoleBadgeClass(u.role)}`}>
                          {getRoleLabel(u.role)}
                        </span>
                      </td>
                      <td>
                        {u.is_locked ? (
                          <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <Lock size={10} /> Đã khóa
                          </span>
                        ) : (
                          <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <Unlock size={10} /> Hoạt động
                          </span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                          <button
                            className={`btn btn-xs ${u.is_locked ? 'btn-secondary' : 'btn-danger'}`}
                            onClick={() => lockMutation.mutate(u._id)}
                            disabled={isSelf || lockMutation.isPending}
                            style={{ display: 'flex', gap: 4, width: 110, justifyContent: 'center' }}
                            title={isSelf ? 'Bạn không thể tự khóa tài khoản của mình' : ''}
                          >
                            {lockMutation.isPending && lockMutation.variables === u._id ? (
                              <span className="spinner" style={{ width: 12, height: 12 }} />
                            ) : u.is_locked ? (
                              <>
                                <Unlock size={12} /> Mở khóa
                              </>
                            ) : (
                              <>
                                <Lock size={12} /> Khóa
                              </>
                            )}
                          </button>
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

      <UserCreateModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}

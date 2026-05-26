import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CategoryAdminAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { truncate } from '@/lib/utils';
import { Plus, Pencil, Trash2, X, Tag, Image } from 'lucide-react';

const schema = z.object({
  name: z.string().min(2, 'Tên tối thiểu 2 ký tự'),
  slug: z.string().optional(),
  description: z.string().optional(),
  image_url: z.string().url('URL không hợp lệ').optional().or(z.literal('')),
});

function CategoryModal({ open, onClose, editing }) {
  const qc = useQueryClient();
  const isEdit = Boolean(editing);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', slug: '', description: '', image_url: '' }
  });

  useEffect(() => {
    if (open) {
      if (editing) {
        reset({
          name: editing.name || '',
          slug: editing.slug || '',
          description: editing.description || '',
          image_url: editing.image_url || editing.imageUrl || '',
        });
      } else {
        reset({
          name: '',
          slug: '',
          description: '',
          image_url: '',
        });
      }
    }
  }, [editing, open, reset]);

  // Auto-generate slug from name
  const nameVal = watch('name');
  const autoSlug = () => {
    const slug = nameVal
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, '')
      .trim().replace(/\s+/g, '-');
    setValue('slug', slug);
  };

  const mutation = useMutation({
    mutationFn: (data) => isEdit
      ? CategoryAdminAPI.update(editing._id || editing.id, data)
      : CategoryAdminAPI.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      reset();
      onClose();
    },
  });

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <h2 style={{ fontSize: 17, fontWeight: 700 }}>
            {isEdit ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
          </h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit((d) => mutation.mutateAsync(d))}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {mutation.error && (
              <div className="alert alert-error">{mutation.error.message}</div>
            )}

            <div>
              <label className="form-label">Tên danh mục *</label>
              <input
                {...register('name')}
                className={`form-input ${errors.name ? 'error' : ''}`}
                placeholder="VD: Lọc dầu"
                onBlur={autoSlug}
              />
              {errors.name && <p className="form-error">{errors.name.message}</p>}
            </div>

            <div>
              <label className="form-label">Slug (URL-friendly)</label>
              <input
                {...register('slug')}
                className="form-input"
                placeholder="loc-dau"
              />
              <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>
                Tự động tạo khi bạn nhập tên. Có thể chỉnh sửa thủ công.
              </p>
            </div>

            <div>
              <label className="form-label">URL hình ảnh</label>
              <input
                {...register('image_url')}
                className={`form-input ${errors.image_url ? 'error' : ''}`}
                placeholder="https://example.com/image.jpg"
              />
              {errors.image_url && <p className="form-error">{errors.image_url.message}</p>}
            </div>

            <div>
              <label className="form-label">Mô tả</label>
              <textarea
                {...register('description')}
                className="form-input"
                placeholder="Mô tả ngắn về danh mục..."
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Huỷ</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting || mutation.isPending}>
              {(isSubmitting || mutation.isPending) && <span className="spinner" />}
              {isEdit ? 'Lưu thay đổi' : 'Tạo danh mục'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteConfirm({ open, onClose, onConfirm, name, loading }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 400 }}>
        <div className="modal-header">
          <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-danger)' }}>Xác nhận xoá</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          <p style={{ color: 'var(--color-text-subtle)', lineHeight: 1.7 }}>
            Xoá danh mục <strong style={{ color: 'var(--color-text)' }}>"{name}"</strong> sẽ ảnh hưởng đến các sản phẩm liên kết. Bạn có chắc không?
          </p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Huỷ</button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
            {loading && <span className="spinner" style={{ borderTopColor: 'var(--color-danger)' }} />}
            Xoá
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CategoriesPage() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['categories'],
    queryFn: () => CategoryAdminAPI.getAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => CategoryAdminAPI.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      setDeleteTarget(null);
    },
  });

  const catList = data?.categories || data?.data || data || [];

  const openAdd = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (c) => { setEditing(c); setModalOpen(true); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Quản lý Danh mục</h1>
          <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginTop: 4 }}>
            {isLoading ? 'Đang tải...' : `${catList.length} danh mục`}
          </p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <Plus size={16} /> Thêm danh mục
        </button>
      </div>

      {/* Grid cards */}
      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card animate-pulse" style={{ height: 140 }} />
          ))}
        </div>
      ) : isError ? (
        <div className="card empty-state" style={{ padding: 60 }}>
          <Tag size={40} />
          <p>Lỗi tải dữ liệu</p>
        </div>
      ) : catList.length === 0 ? (
        <div className="card empty-state" style={{ padding: 80 }}>
          <Tag size={48} />
          <p style={{ fontWeight: 600, fontSize: 15 }}>Chưa có danh mục nào</p>
          <button className="btn btn-primary btn-sm" onClick={openAdd}><Plus size={14} />Tạo danh mục</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 16 }}>
          {catList.map(cat => {
            const img = cat.image_url || cat.imageUrl || cat.image;
            return (
              <div key={cat._id || cat.id} className="card animate-fadeIn" style={{ overflow: 'hidden', transition: 'border-color 0.2s, box-shadow 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
              >
                {/* Image */}
                <div style={{ height: 100, background: 'var(--color-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {img ? (
                    <img src={img} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <Image size={32} color="var(--color-text-muted)" />
                  )}
                </div>

                {/* Content */}
                <div style={{ padding: '14px 16px' }}>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{cat.name}</div>
                  {cat.slug && (
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontFamily: 'monospace', marginBottom: 6 }}>
                      /{cat.slug}
                    </div>
                  )}
                  {cat.description && (
                    <div style={{ fontSize: 12, color: 'var(--color-text-subtle)', marginBottom: 10 }}>
                      {truncate(cat.description, 60)}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 8, borderTop: '1px solid var(--color-border)', paddingTop: 10 }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1 }}
                      onClick={() => openEdit(cat)}
                    >
                      <Pencil size={13} /> Sửa
                    </button>
                    {user?.role === 'admin' && (
                      <button
                        className="btn btn-danger btn-sm btn-icon"
                        onClick={() => setDeleteTarget(cat)}
                        title="Xoá danh mục"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <CategoryModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        editing={editing}
      />
      <DeleteConfirm
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget?._id || deleteTarget?.id)}
        name={deleteTarget?.name}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}

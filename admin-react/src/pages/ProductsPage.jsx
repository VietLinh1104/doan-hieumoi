import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ProductAdminAPI, CategoryAdminAPI } from '@/services/api';
import { formatCurrency, truncate } from '@/lib/utils';
import { Plus, Search, Pencil, Trash2, X, Package, ChevronLeft, ChevronRight } from 'lucide-react';

const schema = z.object({
  name: z.string().min(2, 'Tên sản phẩm tối thiểu 2 ký tự'),
  price: z.coerce.number({ invalid_type_error: 'Phải là số' }).positive('Giá phải > 0'),
  stock: z.coerce.number({ invalid_type_error: 'Phải là số' }).int().min(0, 'Tồn kho >= 0').optional(),
  category_id: z.string().min(1, 'Chọn danh mục'),
  description: z.string().optional(),
  image_url: z.string().url('URL không hợp lệ').optional().or(z.literal('')),
});

function ProductModal({ open, onClose, editing, categories }) {
  const qc = useQueryClient();
  const isEdit = Boolean(editing);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { stock: 0, price: '', name: '', category_id: '', description: '', image_url: '' }
  });

  useEffect(() => {
    if (open) {
      if (editing) {
        reset({
          name: editing.name || '',
          price: editing.price || '',
          stock: editing.stock ?? editing.quantity ?? 0,
          category_id: editing.category_id || editing.category?._id || editing.category?.id || '',
          description: editing.description || '',
          image_url: editing.image_url || editing.imageUrl || '',
        });
      } else {
        reset({
          name: '',
          price: '',
          stock: 0,
          category_id: '',
          description: '',
          image_url: '',
        });
      }
    }
  }, [editing, open, reset]);

  const mutation = useMutation({
    mutationFn: (data) => isEdit
      ? ProductAdminAPI.update(editing._id || editing.id, data)
      : ProductAdminAPI.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      reset();
      onClose();
    },
  });

  if (!open) return null;

  const catList = categories?.categories || categories?.data || categories || [];

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 540 }}>
        <div className="modal-header">
          <h2 style={{ fontSize: 17, fontWeight: 700 }}>
            {isEdit ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
          </h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit((d) => mutation.mutateAsync(d))}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {mutation.error && (
              <div className="alert alert-error">{mutation.error.message}</div>
            )}

            <div>
              <label className="form-label">Tên sản phẩm *</label>
              <input {...register('name')} className={`form-input ${errors.name ? 'error' : ''}`} placeholder="VD: Lọc dầu động cơ Bosch" />
              {errors.name && <p className="form-error">{errors.name.message}</p>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label className="form-label">Giá (VND) *</label>
                <input {...register('price')} type="number" className={`form-input ${errors.price ? 'error' : ''}`} placeholder="250000" />
                {errors.price && <p className="form-error">{errors.price.message}</p>}
              </div>
              <div>
                <label className="form-label">Tồn kho</label>
                <input {...register('stock')} type="number" className={`form-input ${errors.stock ? 'error' : ''}`} placeholder="50" />
                {errors.stock && <p className="form-error">{errors.stock.message}</p>}
              </div>
            </div>

            <div>
              <label className="form-label">Danh mục *</label>
              <select {...register('category_id')} className={`form-input ${errors.category_id ? 'error' : ''}`}>
                <option value="">-- Chọn danh mục --</option>
                {catList.map(c => (
                  <option key={c._id || c.id} value={c._id || c.id}>{c.name}</option>
                ))}
              </select>
              {errors.category_id && <p className="form-error">{errors.category_id.message}</p>}
            </div>

            <div>
              <label className="form-label">URL hình ảnh</label>
              <input {...register('image_url')} className={`form-input ${errors.image_url ? 'error' : ''}`} placeholder="https://..." />
              {errors.image_url && <p className="form-error">{errors.image_url.message}</p>}
            </div>

            <div>
              <label className="form-label">Mô tả</label>
              <textarea {...register('description')} className="form-input" placeholder="Mô tả chi tiết sản phẩm..." />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Huỷ</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting || mutation.isPending}>
              {(isSubmitting || mutation.isPending) && <span className="spinner" />}
              {isEdit ? 'Lưu thay đổi' : 'Thêm sản phẩm'}
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
      <div className="modal-box" style={{ maxWidth: 420 }}>
        <div className="modal-header">
          <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-danger)' }}>Xác nhận xoá</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          <p style={{ color: 'var(--color-text-subtle)', lineHeight: 1.7 }}>
            Bạn có chắc muốn xoá sản phẩm <strong style={{ color: 'var(--color-text)' }}>"{name}"</strong>?
            Hành động này không thể hoàn tác.
          </p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Huỷ</button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
            {loading && <span className="spinner" style={{ borderTopColor: 'var(--color-danger)' }} />}
            Xoá sản phẩm
          </button>
        </div>
      </div>
    </div>
  );
}

const PAGE_SIZE = 10;

export default function ProductsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['products', page, search],
    queryFn: () => ProductAdminAPI.getProducts({ page, limit: PAGE_SIZE, keyword: search }),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => CategoryAdminAPI.getAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => ProductAdminAPI.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      setDeleteTarget(null);
    },
  });

  const productList = data?.data?.products || data?.products || (Array.isArray(data?.data) ? data?.data : (Array.isArray(data) ? data : []));
  const total = data?.data?.total || data?.total || data?.totalCount || productList.length;
  const totalPages = Math.ceil(total / PAGE_SIZE) || 1;

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(keyword);
    setPage(1);
  };

  const openAdd = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (p) => { setEditing(p); setModalOpen(true); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Quản lý Sản phẩm</h1>
          <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginTop: 4 }}>
            {isLoading ? 'Đang tải...' : `${total} sản phẩm`}
          </p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <Plus size={16} /> Thêm sản phẩm
        </button>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, maxWidth: 420 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
          <input
            className="form-input"
            style={{ paddingLeft: 36 }}
            placeholder="Tìm kiếm sản phẩm..."
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-secondary">Tìm</button>
        {search && <button type="button" className="btn btn-ghost btn-icon" onClick={() => { setSearch(''); setKeyword(''); setPage(1); }}><X size={16} /></button>}
      </form>

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <div className="spinner" style={{ margin: '0 auto 12px', width: 24, height: 24, borderTopColor: 'var(--color-primary)' }} />
            Đang tải sản phẩm...
          </div>
        ) : isError ? (
          <div className="empty-state">
            <Package size={40} />
            <p style={{ fontWeight: 500 }}>Lỗi tải dữ liệu</p>
          </div>
        ) : productList.length === 0 ? (
          <div className="empty-state">
            <Package size={48} />
            <p style={{ fontWeight: 600, fontSize: 15 }}>Chưa có sản phẩm nào</p>
            <button className="btn btn-primary btn-sm" onClick={openAdd}><Plus size={14} />Thêm mới</button>
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: 56 }}>Ảnh</th>
                    <th>Tên sản phẩm</th>
                    <th>Danh mục</th>
                    <th>Giá bán</th>
                    <th>Tồn kho</th>
                    <th style={{ width: 110 }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {productList.map(p => {
                    const imgSrc = p.image_url || p.imageUrl || p.image;
                    const stock = p.stock ?? p.quantity ?? 0;
                    return (
                      <tr key={p._id || p.id} className="animate-fadeIn">
                        <td>
                          {imgSrc ? (
                            <img src={imgSrc} alt={p.name} style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', background: 'var(--color-surface-2)' }} />
                          ) : (
                            <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--color-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Package size={18} color="var(--color-text-muted)" />
                            </div>
                          )}
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{truncate(p.name, 45)}</div>
                          {p.description && <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{truncate(p.description, 55)}</div>}
                        </td>
                        <td>
                          <span className="badge badge-default">
                            {p.category?.name || p.categoryName || '—'}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                          {formatCurrency(p.price)}
                        </td>
                        <td>
                          <span className={`badge ${stock === 0 ? 'badge-danger' : stock < 10 ? 'badge-warning' : 'badge-success'}`}>
                            {stock}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              className="btn btn-ghost btn-icon btn-sm"
                              onClick={() => openEdit(p)}
                              title="Chỉnh sửa"
                              style={{ color: 'var(--color-primary)' }}
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              className="btn btn-ghost btn-icon btn-sm"
                              onClick={() => setDeleteTarget(p)}
                              title="Xoá"
                              style={{ color: 'var(--color-danger)' }}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid var(--color-border)' }}>
                <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                  Trang {page} / {totalPages}
                </span>
                <div className="pagination">
                  <button className="page-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                    <ChevronLeft size={14} />
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const p = i + 1;
                    return (
                      <button key={p} className={`page-btn ${page === p ? 'active' : ''}`} onClick={() => setPage(p)}>
                        {p}
                      </button>
                    );
                  })}
                  <button className="page-btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <ProductModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        editing={editing}
        categories={categories}
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

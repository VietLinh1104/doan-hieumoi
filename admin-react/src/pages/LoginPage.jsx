import { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Lock, Mail, Store, Eye, EyeOff } from 'lucide-react';

const schema = z.object({
  email: z.string().min(1, 'Vui lòng nhập email').email('Email không hợp lệ'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  if (isAuthenticated) return <Navigate to="/admin/dashboard" replace />;

  const onSubmit = async (data) => {
    setServerError('');
    try {
      await login(data.email, data.password);
      navigate('/admin/dashboard');
    } catch (err) {
      setServerError(err.message || 'Đăng nhập thất bại. Kiểm tra lại thông tin.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--color-background)',
      padding: 16, position: 'relative', overflow: 'hidden',
    }}>
      {/* Background glow blobs */}
      <div style={{
        position: 'absolute', width: 400, height: 400,
        background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
        top: '10%', left: '20%', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', width: 350, height: 350,
        background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)',
        bottom: '15%', right: '15%', pointerEvents: 'none',
      }} />

      <div className="animate-fadeIn" style={{ width: '100%', maxWidth: 420, position: 'relative' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 60, height: 60, borderRadius: 16, margin: '0 auto 16px',
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(99,102,241,0.4)',
          }}>
            <Store size={28} color="white" />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 }}>
            AutoParts Admin
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>
            Đăng nhập để quản lý cửa hàng
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '32px 28px' }}>
          {serverError && (
            <div className="alert alert-error" style={{ marginBottom: 20 }}>
              <Lock size={15} style={{ flexShrink: 0, marginTop: 1 }} />
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Email */}
            <div>
              <label className="form-label">
                <Mail size={13} style={{ display: 'inline', marginRight: 5 }} />
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  {...register('email')}
                  type="email"
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  placeholder="admin@example.com"
                  style={{ paddingLeft: 14 }}
                />
              </div>
              {errors.email && <p className="form-error">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="form-label">
                <Lock size={13} style={{ display: 'inline', marginRight: 5 }} />
                Mật khẩu
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  {...register('password')}
                  type={showPass ? 'text' : 'password'}
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  placeholder="••••••••"
                  style={{ paddingRight: 42 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--color-text-muted)', display: 'flex',
                  }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="form-error">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
              style={{ marginTop: 6, height: 44, fontSize: 15 }}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner" style={{ width: 16, height: 16 }} />
                  Đang đăng nhập...
                </>
              ) : 'Đăng nhập'}
            </button>
            <div style={{ textAlign: 'center', marginTop: 10 }}>
                <span style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>
                    Chưa có tài khoản?{' '}
                </span>
                <Link to="/admin/register" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>
                    Đăng ký ngay
                </Link>
            </div>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: 'var(--color-text-muted)' }}>
          AutoParts Admin Panel · Chỉ dành cho quản trị viên
        </p>
      </div>
    </div>
  );
}

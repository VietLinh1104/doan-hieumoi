import axios from 'axios';

// Cấu hình Axios dành riêng cho Admin (yêu cầu quản trị viên)
const adminClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

adminClient.interceptors.request.use(
  (config) => {
    // Lấy token của admin
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

adminClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status;
    if (status === 401 || status === 403) {
      // Token hết hạn hoặc người dùng không có quyền -> Force Logout ở đây
      console.warn('Lỗi phân quyền hoặc token đã hết hạn');
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      
      const isPathAdmin = window.location.pathname.startsWith('/admin');
      if (isPathAdmin) {
        if (!window.location.pathname.includes('/admin/login') && !window.location.pathname.includes('/admin/register')) {
          window.location.href = '/admin/login'; // Điều hướng về trang admin login
        }
      } else {
        if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
          window.location.href = '/login'; // Điều hướng về trang shop login
        }
      }
    }

    const message = error.response?.data?.message || 'Lỗi máy chủ Admin';
    return Promise.reject(new Error(message));
  }
);

// CUNG CẤP TẤT CẢ CÁC GỌI API CHO BẢNG ĐIỀU KHIỂN (DASHBOARD)

// ─── Auth & Users (/api/v1/auth) ─────────────────────────────────────────────
export const AuthAdminAPI = {
  login: (data) => adminClient.post('/auth/login', data),
  register: (data) => adminClient.post('/auth/register', data),
  getProfile: () => adminClient.get('/auth/profile'),
  getUsers: () => adminClient.get('/auth/users'),
  createUser: (data) => adminClient.post('/auth/users', data),
  toggleUserLock: (id) => adminClient.put(`/auth/users/${id}/lock`),
  getSetupStatus: () => adminClient.get('/auth/setup-status'),
};

// ─── Categories (/api/v1/categories) ─────────────────────────────────────────
export const CategoryAdminAPI = {
  getAll: () => adminClient.get('/categories'),
  getById: (id) => adminClient.get(`/categories/${id}`),
  create: (data) => adminClient.post('/categories', data),
  update: (id, data) => adminClient.put(`/categories/${id}`, data),
  delete: (id) => adminClient.delete(`/categories/${id}`),
};

// ─── Products (/api/v1/products) ─────────────────────────────────────────────
export const ProductAdminAPI = {
  // params chứa các query filter: { page, limit, keyword, category }
  getProducts: (params = {}) => adminClient.get('/products', { params }),
  getById: (id) => adminClient.get(`/products/${id}`),
  create: (data) => adminClient.post('/products', data),
  update: (id, data) => adminClient.put(`/products/${id}`, data),
  delete: (id) => adminClient.delete(`/products/${id}`),
};

// ─── Orders (/api/v1/orders) ──────────────────────────────────────────────────
export const OrderAdminAPI = {
  getAll: (params = {}) => adminClient.get('/orders', { params }),
  getMyOrders: (params = {}) => adminClient.get('/orders/myorders', { params }),
  getById: (id) => adminClient.get(`/orders/${id}`),
  updateStatus: (id, status) => adminClient.put(`/orders/${id}/status`, { status }),
  delete: (id) => adminClient.delete(`/orders/${id}`),
  cancel: (id) => adminClient.put(`/orders/${id}/cancel`),
};

export default adminClient;


import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import AdminLayout from '@/components/layout/AdminLayout';
import DashboardPage from '@/pages/DashboardPage';
import ProductsPage from '@/pages/ProductsPage';
import CategoriesPage from '@/pages/CategoriesPage';
import OrdersPage from '@/pages/OrdersPage';
import UsersPage from '@/pages/UsersPage';

// Shop Pages
import ShopLayout from '@/components/layout/ShopLayout';
import ShopHomePage from '@/pages/ShopHomePage';
import ShopProductDetailPage from '@/pages/ShopProductDetailPage';
import ShopCheckoutPage from '@/pages/ShopCheckoutPage';
import OrderHistoryPage from '@/pages/OrderHistoryPage';

function ProtectedRoute({ children }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  if (user?.role !== 'admin' && user?.role !== 'staff') return <Navigate to="/" replace />;
  return children;
}

function CustomerProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      {/* ─── PUBLIC SHOP ─── */}
      <Route path="/" element={<ShopLayout />}>
        <Route index element={<ShopHomePage />} />
        <Route path="product/:id" element={<ShopProductDetailPage />} />
        <Route path="checkout" element={
          <CustomerProtectedRoute>
            <ShopCheckoutPage />
          </CustomerProtectedRoute>
        } />
        <Route path="orders/history" element={
          <CustomerProtectedRoute>
            <OrderHistoryPage />
          </CustomerProtectedRoute>
        } />
      </Route>

      {/* ─── ADMIN PANEL ─── */}
      <Route path="/admin/login" element={<LoginPage />} />
      <Route path="/admin/register" element={<RegisterPage />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="users" element={<UsersPage />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

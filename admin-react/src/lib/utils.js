import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Format tiền VND
export function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount || 0);
}

// Format ngày giờ
export function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr));
}

// Trạng thái đơn hàng -> badge class
export function getOrderStatusClass(status) {
  const map = {
    pending: 'badge-warning',
    processing: 'badge-info',
    shipped: 'badge-purple',
    delivered: 'badge-success',
    cancelled: 'badge-danger',
  };
  return map[status] || 'badge-default';
}

// Label tiếng Việt cho trạng thái đơn
export function getOrderStatusLabel(status) {
  const map = {
    pending: 'Chờ xử lý',
    processing: 'Đang xử lý',
    shipped: 'Đang giao',
    delivered: 'Đã giao',
    cancelled: 'Đã huỷ',
  };
  return map[status] || status;
}

// Truncate string
export function truncate(str, n = 40) {
  if (!str) return '';
  return str.length > n ? str.slice(0, n) + '…' : str;
}

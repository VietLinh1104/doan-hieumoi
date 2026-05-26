---
name: shoppage-react
description: Kỹ năng và tiêu chuẩn lập trình dành cho project Shoppage React (Website Khách hàng)
---

# Shoppage React Skill

Bạn (Antigravity) sẽ đóng vai trò là một Frontend Developer phát triển ứng dụng web React tuyệt đẹp, có UX tốt nhất dành cho khách hàng mua phụ tùng, linh kiện ô tô trực tuyến.

## 1. Mạch Web & UI/UX
- Giao diện hướng đến khách hàng: Cần trau chuốt từng pixel, sử dụng hiệu ứng hover, loading states, màu sắc dễ nhìn, sang trọng (có thể theo hướng dark/light mode hiện đại).
- Phụ tùng ô tô là sản phẩm có độ tin cậy. UI phải cung cấp rõ ràng đầy đủ thông số kỹ thuật, đánh giá, và đặc biệt là hệ thống lọc (Filter) trực quan để chọn đúng loại tương thích với xe.
- Trang cần **Responsive** tuyệt đối (First-mobile approach) vì lượng lớn khách hàng tra cứu bằng điện thoại khi mang xe ra gara.

## 2. Tiêu Chuẩn Coding (Coding Standards)
- **Tổ chức thư mục:** Theo sát chuẩn `components` (UI mộc), `pages` (Giao diện trang), `hooks` (Logic tái sử dụng), và `services`/`api` (Gọi Server).
- **CSS:** Sử dụng Tailwind CSS triệt để, tránh viết code CSS thuần vào file trừ trường hợp hiệu ứng phức tạp.
- **Quản lý Application State:** Áp dụng Redux Toolkit (hoặc Zustand) để lưu trữ Cart (Giỏ hàng) đồng bộ toàn ứng dụng, trạng thái đang đăng nhập của User, cũng như Checkout Flow.
- **Tối Ưu Hóa:** Tách bundle (Lazy Loading) các pages lớn (Ví dụ: `Checkout` hay `Profile`), hiển thị các Skeleton Loading trực quan trong lúc chờ gọi API để tối đa hoá User Experience.
- **Xử lý API (Client):** Xử lý tập trung qua thư viện (Axios). LUÔN LUÔN xử lý hiển thị báo lỗi (Toasts/Alerts) rõ ràng ra màn hình mỗi khi API call có vấn đề để người dùng hiểu chuyện gì đã xảy ra.

## 3. Danh sách API Endpoints Reference (Client Shoppage)
Base URL: `http://localhost:5000/api/v1`

**👉 Auth & Profiles:**
- `POST /auth/register`: Đăng ký tài khoản (body payload: `fullname`, `email`, `password`, `phone`).
- `POST /auth/login`: Lấy Token đăng nhập (body payload: `email`, `password`). Trả kết quả: `{ success, data: { token, id, fullname, role } }`.
- `GET /auth/profile`: Lấy thông tin tài khoản hiện tại (Bắt buộc Header: `Authorization: Bearer <token>`).

**👉 Categories & Products (Public Access):**
- `GET /categories`: Lấy toàn bộ thẻ danh mục (Ví dụ Hệ thống Phanh, Động cơ).
- `GET /products?page=1&limit=12&keyword=xxx&category=id`: Lấy danh sách phụ tùng (Hỗ trợ phân trang, lọc theo keyword tên / mã part_number và theo danh mục).
- `GET /products/:id`: Xem chi tiết kỹ thuật 1 sản phẩm.

**👉 Cart & Checkout Orders (Yêu cầu JWT Token):**
- `POST /orders`: Tiến hành đặt hàng. Body payload gồm `orderItems` (chứa các objects có `product_id, qty, price`), trường `shippingAddress`, trường `paymentMethod`, và trường `totalPrice`.
- `GET /orders/myorders`: Xem lịch sử đơn hàng của bản thân khách.
- `GET /orders/:id`: Xem trạng thái/chi tiết 1 đơn hàng đã mua.

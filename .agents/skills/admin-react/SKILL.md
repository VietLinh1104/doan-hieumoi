---
name: admin-react
description: Kỹ năng và tiêu chuẩn lập trình dành cho project Admin React Dashboard
---

# Admin React Skill

Bạn (Antigravity) sẽ đóng vai trò là chuyên gia Frontend sử dụng ReactJS, xây dựng giao diện Dashboard quản lý cửa hàng (Admin Panel) chuyên nghiệp.

## 1. Domain Context
- Giao diện Admin không cần quá bóng bẩy về hiệu ứng (animations), nhưng cần SẠCH SẼ, rõ ràng, hiển thị được lượng lớn dữ liệu (Data grids, Tables, Charts).
- Quản trị viên phải xử lý các nghiệp vụ phức tạp: Đặt hàng theo mẻ, thay đổi trạng thái đơn, quản lý chi tiết thông số của hàng ngàn loại phụ kiện/phụ tùng ô tô khác nhau.

## 2. Tiêu Chuẩn Coding (Coding Standards)
- **Component Design:** Tái sử dụng tối đa các UI Components (như Data Table, Form Modal). Chia nhỏ component. 
- **Form Handling:** Không quản lý state của Form phức tạp bằng cách thủ công, bắt buộc sử dụng `react-hook-form` kết hợp `yup` (hoặc `zod`) để validate dữ liệu đầu vào.
- **Data Fetching & State:** Admin apps yêu cầu tính đồng bộ hoá dữ liệu cao. Sử dụng React Query (TanStack Query) để gọi API, lưu cache, mutate dữ liệu và gán thẻ thời gian (stale time). Tránh lạm dụng Redux cho Server State.
- **Bảo mật Frontend:** Các route phải được bọc trong một rào cản kiểm tra Token (Protected Routes). Xử lý tốt logic Refresh Token qua Axios Interceptors, và log-out người dùng khi Token hết hạn / bị từ chối 401.

## 3. Quản Lý Theme & Giao Diện (Theme System)
- **CSS Variables & Theme Switcher:** Ứng dụng hỗ trợ Sáng/Tối (Light/Dark mode) qua các CSS variables định nghĩa trong `index.css`. Mặc định hiển thị giao diện sáng (Light mode) với nền dịu mát và đổ bóng nhẹ.
- **Theme Context:** File `ThemeContext.jsx` cung cấp hook `useTheme()` để chuyển đổi giữa `'light'` và `'dark'`, tự động đồng bộ lựa chọn của người dùng vào `localStorage` và cập nhật thuộc tính `data-theme` trên thẻ `html`.
- **Theme Button:** Được đặt ở header (ShopLayout) và topbar (AdminLayout) để người dùng chuyển đổi tức thì.

## 4. Phân Quyền Vai Trò Ở Frontend (Role-based Frontend Access)
- **ProtectedRoute:** Route quản trị được bảo vệ bằng cách kiểm tra:
  - Nếu chưa đăng nhập: Điều hướng về `/admin/login`.
  - Nếu vai trò không phải là `admin` hoặc `staff`: Điều hướng về `/` (trang Shop).
- **Sidebar & Menu:** Menu "Người dùng" (`/admin/users`) chỉ hiển thị đối với người dùng có vai trò `admin`. Trả về thông báo lỗi "Truy cập bị từ chối" nếu `staff` cố tình truy cập.
- **Ẩn nút Xóa dữ liệu:** Trong các trang quản lý sản phẩm, danh mục và đơn hàng, các nút Xóa vĩnh viễn bị ẩn hoàn toàn đối với vai trò `staff` để tránh thao tác sai lệch dữ liệu.
- **Ẩn/Hiện Sản phẩm:** Biểu mẫu Sản phẩm hỗ trợ thuộc tính `is_hidden` (checkbox) để nhân viên ẩn sản phẩm khỏi Shop thay vì xóa.

## 5. Danh Sách API Endpoints Reference (adminClient)
Base URL: `/api/v1` (tự động đính kèm Token trong header `Authorization: Bearer <TOKEN>` thông qua Axios Interceptors).

👉 **General Auth & Users:**
- `POST /auth/login`: Đăng nhập, nhận diện vai trò và điều hướng tương ứng (admin/staff vào trang quản trị, user vào Shop).
- `POST /auth/register`: Đăng ký tài khoản (mặc định gán vai trò `user`).
- `GET /auth/users`: Lấy danh sách toàn bộ người dùng (Quyền Admin).
- `POST /auth/users`: Tạo tài khoản nhân sự mới (Quyền Admin).
- `PUT /auth/users/:id/lock`: Khóa / Mở khóa tài khoản người dùng (Quyền Admin).

👉 **Quản lý Categories (Danh mục):**
- `GET /categories`: Lấy danh sách tất cả danh mục.
- `POST /categories`: Thêm mới danh mục (Yêu cầu Token Staff/Admin).
- `PUT /categories/:id`: Cập nhật danh mục (Yêu cầu Token Staff/Admin).
- `DELETE /categories/:id`: Xoá vĩnh viễn danh mục (Quyền Admin).

👉 **Quản lý Products (Sản phẩm):**
- `GET /products`: Xem danh sách tất cả sản phẩm (tự động ẩn sản phẩm có `is_hidden: true` đối với Guest/Customer).
- `POST /products`: Đăng sản phẩm mới (Yêu cầu Token Staff/Admin).
- `PUT /products/:id`: Cập nhật thông tin sản phẩm (Yêu cầu Token Staff/Admin).
- `DELETE /products/:id`: Xoá vĩnh viễn sản phẩm (Quyền Admin).

👉 **Quản lý Đơn Hàng (Orders):**
- `GET /orders`: Lấy toàn bộ đơn hàng của tất cả khách hàng (Yêu cầu Token Staff/Admin).
- `GET /orders/myorders`: Lấy danh sách đơn hàng cá nhân của Khách thân (Yêu cầu Token Customer).
- `PUT /orders/:id/status`: Chuyển đổi trạng thái đơn (Yêu cầu Token Staff/Admin).
- `PUT /orders/:id/cancel`: Khách hàng tự hủy đơn hàng đang chờ duyệt (Yêu cầu Token Customer).
- `DELETE /orders/:id`: Xoá vĩnh viễn đơn hàng (Quyền Admin).

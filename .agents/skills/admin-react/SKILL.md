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

## 3. Danh sách API Endpoints Reference (Bảng Điều Khiển Admin)
Base URL: `http://localhost:5000/api/v1`
*Tâm niệm: Tất cả thao tác CRUD Admin đều BẮT BUỘC gắn header `Authorization: Bearer <ADMIN_TOKEN>` để server xác thực.*

**👉 General Auth:**
- `POST /auth/login`: Dùng để Quản trị viên đăng nhập vào hệ thống lấy Admin Token.

**👉 Quản lý Categories (Danh mục):**
- `GET /categories`: Lấy danh sách danh mục phụ tùng để độ vào Table/Select List.
- `POST /categories`: Thêm mới một danh mục (Yêu cầu body: `name`, `slug`, `image_url`, `description`).
- `PUT /categories/:id`: Cập nhật thông tin danh mục tương ứng.
- `DELETE /categories/:id`: Nhấn nút xoá bỏ vĩnh viễn danh mục ra khỏi hệ thống.

**👉 Quản lý Products (Phụ tùng/Sản phẩm):**
- `GET /products`: Xem danh sách tất cả mã phụ kiện (hỗ trợ tham số `page`, `limit`, `keyword` để lọc trên bảng).
- `POST /products`: Đăng một phụ tùng mới lên sàn. (Body yêu cầu ít nhất: `name`, `price`, `category_id`).
- `PUT /products/:id`: Cập nhật tồn kho (`stock`), thay đổi mô tả hoặc giá bán của mã hàng.
- `DELETE /products/:id`: Xoá phụ tùng.

**👉 Quản lý Đơn Hàng (Orders Admin View):**
- `GET /orders`: Lấy toàn bộ đơn hàng của tất cả khách hàng về Dashboard.
- `GET /orders/:id`: Nhấn xem chi tiết 1 order để biết họ đặt món gì.
- `PUT /orders/:id/status`: Chuyển đổi trạng thái đơn (pending -> processing -> shipped -> delivered -> cancelled). Bạn truyền `{ "status": "shipped" }` trong body.
- `DELETE /orders/:id`: Xoá bỏ/Huỷ hoàn toàn 1 đơn hàng (Quyền Admin).

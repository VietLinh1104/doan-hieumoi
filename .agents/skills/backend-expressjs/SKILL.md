---
name: backend-expressjs
description: Kỹ năng và tiêu chuẩn lập trình dành cho project Backend ExpressJS (API Server)
---

# Backend ExpressJS Agent Skill

Bạn (Antigravity) sẽ đóng vai trò là chuyên gia Backend Developer thực hiện phát triển API Server hệ thống thương mại điện tử phụ tùng ô tô.

## 1. Tiêu Chuẩn Phân Lớp Kiến Trúc Tuyệt Đối (Strict Layered Architecture)
Tất cả các module phải chia tách rõ ràng thành 3 lớp: **Routes -> Controllers -> Models**. KHÔNG TẠP NHAM.

- **[Routes]:** Mapping tới Controller. Yêu cầu có đầy đủ chuẩn CRUD API (`GET`, `POST`, `PUT`, `DELETE`).
- **[Controllers]:** Chứa toàn bộ Business Logic. Xử lý nhận Request JSON (`req.body`, `req.params`, `req.query`), thực hiện logic nghiệp vụ (kiểm tra điều kiện, tương tác với database thông qua Mongoose Models) và trả về response dạng `{ success, data, message }`. Nếu có lỗi, ném ra Exception hoặc trả về status code phù hợp.
- **[Models]:** Định nghĩa Schema và Model của MongoDB bằng Mongoose (`mongoose.Schema`, `mongoose.model`). Không chứa các câu lệnh SQL.

## 2. API Design & Security
- Mọi module chính (Ví dụ: Categories, Products) đều phải có đầy đủ API CRUD.
- Hành vi Update/Delete/Create phải có Middleware bảo mật (như kiểm tra tài khoản `Admin` hoặc xác thực JWT).
- Tinh chỉnh các thao tác `session`, `startTransaction`, `commitTransaction`, `abortTransaction` của Mongoose bên trong `Controllers` nếu có nhiều luồng thay đổi Database (Ví dụ tạo Order).

## 3. Danh Sách API Endpoints Chi Tiết

Tất cả các API endpoints của hệ thống đều có base URL là `/api/v1` và tuân thủ các quy tắc sau:

### 🔑 Authentication & Users (`/api/v1/auth`)

#### 1. Kiểm tra trạng thái thiết lập hệ thống (Setup Status)
- **Method:** `GET`
- **URL:** `/auth/setup-status`
- **Quyền truy cập:** Public (Bất kỳ ai)
- **Response:** Trả về `{ success: true, data: { isSetup: true | false } }` (trả về `isSetup: true` nếu đã tồn tại ít nhất một tài khoản `admin` hoặc `staff` trong database).

#### 2. Đăng ký tài khoản (Register)
- **Method:** `POST`
- **URL:** `/auth/register`
- **Quyền truy cập:** Public (Bất kỳ ai)
- **Đặc trưng:** Chặn đăng ký vai trò `admin` hoặc `staff` nếu hệ thống đã có tài khoản Quản trị viên/Nhân viên trong database.
- **Request Body:**
  ```json
  {
    "fullname": "Họ tên người dùng (String, required)",
    "email": "Email đăng ký (String, required, unique)",
    "password": "Mật khẩu (String, required)",
    "phone": "Số điện thoại (String, optional)",
    "role": "Vai trò mong muốn (String: 'admin' | 'staff' | 'user', optional, default: 'user')"
  }
  ```
- **Response:** Trả về `{ success: true, data: { id, fullname, email, role, token } }` (vai trò mặc định là `'user'` nếu không truyền).

#### 2. Đăng nhập (Login)
- **Method:** `POST`
- **URL:** `/auth/login`
- **Quyền truy cập:** Public
- **Request Body:**
  ```json
  {
    "email": "Email đăng nhập (String, required)",
    "password": "Mật khẩu (String, required)"
  }
  ```
- **Response:** Trả về `{ success: true, data: { id, fullname, email, role, token } }`. Chặn đăng nhập nếu tài khoản bị khóa (`is_locked === true`).

#### 3. Xem hồ sơ cá nhân (Profile)
- **Method:** `GET`
- **URL:** `/auth/profile`
- **Quyền truy cập:** Private (Yêu cầu `Authorization: Bearer <TOKEN>`)
- **Response:** Trả về `{ success: true, data: { _id, fullname, email, phone, role, is_locked, ... } }`.

#### 4. Xem danh sách người dùng (Admin only)
- **Method:** `GET`
- **URL:** `/auth/users`
- **Quyền truy cập:** Private Admin (Yêu cầu Token Admin)
- **Response:** Trả về `{ success: true, data: [ { _id, fullname, email, phone, role, is_locked, ... } ] }`.

#### 5. Tạo mới nhân sự/người dùng (Admin only)
- **Method:** `POST`
- **URL:** `/auth/users`
- **Quyền truy cập:** Private Admin (Yêu cầu Token Admin)
- **Request Body:**
  ```json
  {
    "fullname": "Họ tên (String, required)",
    "email": "Email (String, required)",
    "password": "Mật khẩu (String, required)",
    "phone": "Số điện thoại (String, optional)",
    "role": "Vai trò (String: 'admin' | 'staff' | 'user', default: 'user')"
  }
  ```
- **Response:** Trả về `{ success: true, data: { id, fullname, email, role, is_locked } }`.

#### 6. Khóa/Mở khóa tài khoản (Admin only)
- **Method:** `PUT`
- **URL:** `/auth/users/:id/lock`
- **Quyền truy cập:** Private Admin (Yêu cầu Token Admin)
- **Response:** Trả về `{ success: true, message: "Đã khóa/mở khóa tài khoản...", data: { id, is_locked } }`. Không cho phép tự khóa chính mình.

---

### 📦 Danh Mục Phụ Tùng (`/api/v1/categories`)

#### 1. Xem danh sách danh mục
- **Method:** `GET`
- **URL:** `/categories`
- **Quyền truy cập:** Public
- **Response:** Trả về `{ success: true, data: [ { _id, name, slug, description, image_url } ] }`.

#### 2. Xem chi tiết danh mục
- **Method:** `GET`
- **URL:** `/categories/:id`
- **Quyền truy cập:** Public
- **Response:** Trả về `{ success: true, data: { _id, name, slug, description, image_url } }`.

#### 3. Tạo mới danh mục
- **Method:** `POST`
- **URL:** `/categories`
- **Quyền truy cập:** Private Staff/Admin (Yêu cầu Token Staff hoặc Admin)
- **Request Body:**
  ```json
  {
    "name": "Tên danh mục (String, required)",
    "slug": "Slug thân thiện (String, optional, tự sinh nếu trống)",
    "description": "Mô tả danh mục (String, optional)",
    "image_url": "Link ảnh danh mục (String, optional)"
  }
  ```
- **Response:** Trả về `{ success: true, data: { danh mục vừa tạo } }`.

#### 4. Cập nhật danh mục
- **Method:** `PUT`
- **URL:** `/categories/:id`
- **Quyền truy cập:** Private Staff/Admin
- **Request Body:** Tương tự API tạo mới (gửi các trường cần sửa).
- **Response:** Trả về `{ success: true, data: { danh mục sau khi sửa } }`.

#### 5. Xóa danh mục (Admin only)
- **Method:** `DELETE`
- **URL:** `/categories/:id`
- **Quyền truy cập:** Private Admin (Yêu cầu Token Admin, Staff không được xóa)
- **Response:** Trả về `{ success: true, message: "Đã xóa danh mục", data: { id } }`.

---

### 🛠️ Phụ Tùng & Sản Phẩm (`/api/v1/products`)

#### 1. Xem danh sách sản phẩm (có lọc & phân trang)
- **Method:** `GET`
- **URL:** `/products`
- **Quyền truy cập:** Public
- **Query Parameters:**
  - `page`: Số trang (Number, default: 1)
  - `limit`: Số lượng/trang (Number, default: 12)
  - `keyword`: Từ khóa tìm kiếm theo tên hoặc mã OEM (String, optional)
  - `category`: Lọc theo ID danh mục (String, optional)
  - `priceRange`: Lọc theo khoảng giá (low: dưới 500k | mid: 500k-2M | high: trên 2M, optional)
- **Response:** Trả về `{ success: true, data: { products: [...], page, pages, total } }`.
- **Đặc trưng:** Nếu người dùng là Guest/Customer, tự động ẩn sản phẩm có `is_hidden === true`. Nếu là Staff/Admin (gửi kèm Token hợp lệ), hiển thị đầy đủ.

#### 2. Xem chi tiết sản phẩm
- **Method:** `GET`
- **URL:** `/products/:id`
- **Quyền truy cập:** Public
- **Response:** Trả về `{ success: true, data: { sản phẩm chi tiết } }`.

#### 3. Tạo mới sản phẩm
- **Method:** `POST`
- **URL:** `/products`
- **Quyền truy cập:** Private Staff/Admin
- **Đặc trưng:** Tự động đồng bộ hóa liên kết hình ảnh giữa 2 trường `main_image` và `image_url`.
- **Request Body:**
  ```json
  {
    "name": "Tên phụ tùng (String, required)",
    "price": "Giá bán (Number, required)",
    "category_id": "ID danh mục liên kết (String, required)",
    "part_number": "Mã OEM (String, unique, optional)",
    "stock": "Tồn kho ban đầu (Number, default: 0)",
    "description": "Mô tả sản phẩm (String, optional)",
    "image_url": "Link ảnh sản phẩm (String, optional)",
    "main_image": "Link ảnh chính sản phẩm (String, optional)",
    "is_hidden": "Ẩn khỏi Shop (Boolean, default: false)"
  }
  ```

#### 4. Cập nhật sản phẩm
- **Method:** `PUT`
- **URL:** `/products/:id`
- **Quyền truy cập:** Private Staff/Admin
- **Đặc trưng:** Tự động đồng bộ hóa liên kết hình ảnh giữa 2 trường `main_image` và `image_url`.
- **Request Body:** Các trường sản phẩm cần sửa.

#### 5. Xóa sản phẩm (Admin only)
- **Method:** `DELETE`
- **URL:** `/products/:id`
- **Quyền truy cập:** Private Admin (Staff không được xóa)

---

### 🛒 Đơn Hàng (`/api/v1/orders`)

#### 1. Xem danh sách tất cả đơn hàng (có phân trang)
- **Method:** `GET`
- **URL:** `/orders`
- **Quyền truy cập:** Private Staff/Admin (Xem tất cả đơn của hệ thống)
- **Query Parameters:**
  - `page`: Số trang (Number, default: 1)
  - `limit`: Số lượng/trang (Number, default: 10)
  - `status`: Lọc theo trạng thái đơn hàng (String, optional)
- **Response:** Trả về `{ success: true, data: { orders: [...], page, pages, total } }`.

#### 2. Xem danh sách đơn hàng cá nhân (My Orders - có phân trang)
- **Method:** `GET`
- **URL:** `/orders/myorders`
- **Quyền truy cập:** Private Customer (Xem đơn của chính mình đăng nhập)
- **Query Parameters:**
  - `page`: Số trang (Number, default: 1)
  - `limit`: Số lượng/trang (Number, default: 10)
- **Response:** Trả về `{ success: true, data: { orders: [...], page, pages, total } }`.

#### 3. Xem chi tiết đơn hàng
- **Method:** `GET`
- **URL:** `/orders/:id`
- **Quyền truy cập:** Private (Khách hàng xem đơn của mình, Staff/Admin xem bất kỳ đơn nào)

#### 4. Tạo mới đơn hàng (Checkout)
- **Method:** `POST`
- **URL:** `/orders`
- **Quyền truy cập:** Private Customer
- **Request Body:**
  ```json
  {
    "orderItems": [
      {
        "product_id": "ID sản phẩm (String)",
        "qty": "Số lượng mua (Number)",
        "price": "Giá tại thời điểm mua (Number)"
      }
    ],
    "shippingAddress": {
      "fullName": "Tên người nhận",
      "address": "Địa chỉ giao hàng",
      "phone": "Số điện thoại người nhận"
    },
    "paymentMethod": "Phương thức thanh toán (String)",
    "totalPrice": "Tổng tiền đơn hàng (Number)"
  }
  ```
- **Response:** Trả về `{ success: true, data: { orderId } }`. Tự động trừ tồn kho khi tạo thành công.

#### 5. Cập nhật trạng thái đơn hàng (Duyệt đơn)
- **Method:** `PUT`
- **URL:** `/orders/:id/status`
- **Quyền truy cập:** Private Staff/Admin
- **Request Body:**
  ```json
  {
    "status": "Trạng thái đơn (String: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled')"
  }
  ```

#### 6. Hủy đơn hàng (Customer cancels own order)
- **Method:** `PUT`
- **URL:** `/orders/:id/cancel`
- **Quyền truy cập:** Private Customer (Yêu cầu đăng nhập chính chủ)
- **Response:** Trả về `{ success: true, message: "Đã huỷ đơn hàng thành công", data: order }`.
- **Đặc trưng:** Chỉ được phép hủy khi trạng thái là `'pending'`. Tự động hoàn lại số lượng tồn kho sản phẩm về database.

#### 7. Xóa đơn hàng (Admin only)
- **Method:** `DELETE`
- **URL:** `/orders/:id`
- **Quyền truy cập:** Private Admin


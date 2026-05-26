# Tài liệu Backend API Endpoints

Dưới đây là danh sách các API endpoints hiện có trong hệ thống `backend-expressjs`, cùng với phương thức HTTP, route, yêu cầu quyền truy cập (Access) và các tham số truyền vào tương ứng (Body/Params/Query).

*Base URL mặc định cho tất cả các endpoint là `/api/v1` (tùy thuộc vào cấu hình app)*.

---

## 1. Auth & Users (`/api/v1/auth`)

### 1.1 Đăng nhập (Login)
- **Phương thức:** `POST`
- **Route:** `/login`
- **Access:** Public
- **Body Request (JSON):**
  ```json
  {
    "email": "user@example.com",
    "password": "yourpassword"
  }
  ```

### 1.2 Đăng ký (Register)
- **Phương thức:** `POST`
- **Route:** `/register`
- **Access:** Public
- **Body Request (JSON):**
  ```json
  {
    "fullname": "Tên Của Bạn",
    "email": "user@example.com",
    "password": "yourpassword",
    "phone": "0123456789" // Không bắt buộc
  }
  ```

### 1.3 Lấy thông tin cá nhân (Profile)
- **Phương thức:** `GET`
- **Route:** `/profile`
- **Access:** Private (Yêu cầu Header `Authorization: Bearer <token>`)
- **Tham số:** Không cần truyền params hay body.

---

## 2. Categories (`/api/v1/categories`)

### 2.1 Lấy danh sách danh mục
- **Phương thức:** `GET`
- **Route:** `/`
- **Access:** Public
- **Tham số:** Không có

### 2.2 Lấy thông tin một danh mục
- **Phương thức:** `GET`
- **Route:** `/:id`
- **Access:** Public
- **URL Params:**
  - `id`: Mã ID của danh mục

### 2.3 Tạo danh mục mới
- **Phương thức:** `POST`
- **Route:** `/`
- **Access:** Private / Admin
- **Body Request (JSON):**
  ```json
  {
    "name": "Tên danh mục",
    "slug": "ten-danh-muc",
    "image_url": "url-hinh-anh", // Không bắt buộc
    "description": "Mô tả danh mục" // Không bắt buộc
  }
  ```

### 2.4 Cập nhật danh mục
- **Phương thức:** `PUT`
- **Route:** `/:id`
- **Access:** Private / Admin
- **URL Params:**
  - `id`: Mã ID của danh mục
- **Body Request (JSON):** Các trường muốn cập nhật (ví dụ: `name`, `slug`, `image_url`, `description`).

### 2.5 Xóa danh mục
- **Phương thức:** `DELETE`
- **Route:** `/:id`
- **Access:** Private / Admin
- **URL Params:**
  - `id`: Mã ID của danh mục

---

## 3. Products (`/api/v1/products`)

### 3.1 Lấy danh sách sản phẩm (có tìm kiếm & phân trang)
- **Phương thức:** `GET`
- **Route:** `/`
- **Access:** Public
- **Query Params:**
  - `limit`: Số lượng trên mỗi trang (Mặc định: 12)
  - `page`: Số trang (Mặc định: 1)
  - `keyword`: Tìm kiếm theo tên hoặc mã sản phẩm (`part_number`)
  - `category`: Lọc theo ID danh mục

### 3.2 Lấy thông tin một sản phẩm
- **Phương thức:** `GET`
- **Route:** `/:id`
- **Access:** Public
- **URL Params:**
  - `id`: Mã ID của sản phẩm

### 3.3 Tạo sản phẩm mới
- **Phương thức:** `POST`
- **Route:** `/`
- **Access:** Private / Admin
- **Body Request (JSON):**
  ```json
  {
    "name": "Tên sản phẩm",
    "price": 100000,
    "category_id": "mã_id_danh_mục",
    // Các trường khác tương ứng với schema (ví dụ: part_number, stock, description...)
  }
  ```

### 3.4 Cập nhật sản phẩm
- **Phương thức:** `PUT`
- **Route:** `/:id`
- **Access:** Private / Admin
- **URL Params:**
  - `id`: Mã ID của sản phẩm
- **Body Request (JSON):** Các trường muốn cập nhật của sản phẩm.

### 3.5 Xóa sản phẩm
- **Phương thức:** `DELETE`
- **Route:** `/:id`
- **Access:** Private / Admin
- **URL Params:**
  - `id`: Mã ID của sản phẩm

---

## 4. Orders (`/api/v1/orders`)

### 4.1 Tạo đơn hàng mới
- **Phương thức:** `POST`
- **Route:** `/`
- **Access:** Private
- **Body Request (JSON):**
  ```json
  {
    "orderItems": [
      {
        "product_id": "mã_sản_phẩm",
        "qty": 2,
        "price": 100000
      }
    ],
    "shippingAddress": {
      "address": "Địa chỉ",
      "city": "Thành phố",
      "postalCode": "Mã bưu điện",
      "country": "Quốc gia"
    },
    "paymentMethod": "Tiền mặt / Thẻ...",
    "totalPrice": 200000
  }
  ```

### 4.2 Lấy danh sách tất cả đơn hàng
- **Phương thức:** `GET`
- **Route:** `/`
- **Access:** Private / Admin
- **Tham số:** Không có.

### 4.3 Lấy danh sách đơn hàng của tôi
- **Phương thức:** `GET`
- **Route:** `/myorders`
- **Access:** Private (Lấy ID user từ token)
- **Tham số:** Không có.

### 4.4 Lấy thông tin chi tiết một đơn hàng
- **Phương thức:** `GET`
- **Route:** `/:id`
- **Access:** Private (User sở hữu đơn hàng hoặc Admin)
- **URL Params:**
  - `id`: Mã ID của đơn hàng

### 4.5 Cập nhật trạng thái đơn hàng
- **Phương thức:** `PUT`
- **Route:** `/:id/status`
- **Access:** Private / Admin
- **URL Params:**
  - `id`: Mã ID của đơn hàng
- **Body Request (JSON):**
  ```json
  {
    "status": "Đang xử lý / Đã giao hàng / Đã hủy..." // Tùy thuộc enum trong model
  }
  ```

### 4.6 Xóa đơn hàng
- **Phương thức:** `DELETE`
- **Route:** `/:id`
- **Access:** Private / Admin
- **URL Params:**
  - `id`: Mã ID của đơn hàng

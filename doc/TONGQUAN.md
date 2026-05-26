# TỔNG QUAN HỆ THỐNG - ĐỒ ÁN MUA BÁN PHỤ TÙNG, LINH KIỆN Ô TÔ

## 1. Giới thiệu Dự án
Đây là hệ thống website thương mại điện tử chuyên cung cấp phụ tùng và linh kiện ô tô. Hệ thống được chia thành 3 dự án (projects) độc lập để đảm bảo tính dễ bảo trì, dễ mở rộng và tách biệt trách nhiệm:
1. **Shoppage (`shoppage-react`):** Giao diện Frontend dành cho Khách hàng (người mua).
2. **Admin (`admin-react`):** Giao diện Frontend dành cho Ban quản trị (nhân viên, quản trị viên cửa hàng).
3. **Backend (`backend-expressjs`):** Máy chủ API cung cấp dữ liệu và xử lý logic nghiệp vụ cho cả 2 Frontend trên.

---

## 2. Kiến trúc Hệ Thống
Hệ thống sử dụng kiến trúc **Client-Server** với việc giao tiếp thông qua **RESTful API**.
- **Frontend (Shoppage & Admin):** ReactJS (khuyến nghị kết hợp Vite để build nhanh).
- **Backend:** Node.js với ExpressJS.
- **Cơ sở dữ liệu (Database):** MongoDB (stack MERN) hoặc PostgreSQL/MySQL (tuỳ theo yêu cầu của nhà trường/giáo viên hướng dẫn). Khuyến nghị MongoDB nếu muốn phát triển nhanh.
- **Xác thực (Auth):** Sử dụng mã thông báo JSON Web Token (JWT), lưu trữ token an toàn và phân quyền Rõ ràng (Role: User / Admin).

---

## 3. Phân Tích Chức Năng Cốt Lõi

### 3.1. Shoppage (`shoppage-react`)
- **Trang chủ:** Banner chiến dịch, danh mục phụ tùng nổi bật, sản phẩm bán chạy, sản phẩm mới.
- **Tìm kiếm & Lọc nâng cao:** Tìm kiếm theo tên phụ tùng, số hiệu (Part Number), bộ lọc theo hãng xe (Toyota, Ford, Honda,...), dòng xe, đời xe và mức giá.
- **Chi tiết sản phẩm:** Hình ảnh, thông số kỹ thuật, danh sách dòng xe tương thích, đánh giá & bình luận.
- **Giỏ hàng & Đặt hàng:** Thêm/sửa/xoá sản phẩm trong giỏ, quy trình thanh toán (Checkout), chọn phương thức thanh toán (Tiền mặt khi nhận hàng COD, hoặc tích hợp VNPAY/Momo nếu cần thiết).
- **Tài khoản Khách hàng:** Đăng ký, đăng nhập, quên mật khẩu, xem lịch sử đơn hàng, cập nhật thông tin cá nhân.

### 3.2. Admin (`admin-react`)
- **Bảng điều khiển (Dashboard):** Thống kê tổng quan về doanh thu, số lượng đơn hàng, lượng khách truy cập, sản phẩm bán chạy, sản phẩm sắp hết hàng.
- **Quản lý Sản phẩm:** Thêm mới, chỉnh sửa, xoá phụ tùng. Quản lý hình ảnh sản phẩm, thông số định dạng kỹ thuật.
- **Quản lý Danh mục:** Phân loại phụ tùng (VD: Hệ thống động cơ, Hệ thống điện, Nội thất, Ngoại thất,...).
- **Quản lý Đơn hàng:** Xem trạng thái đơn (Chờ xác nhận, Đang chuẩn bị, Đang giao, Đã giao, Đã huỷ). Cập nhật trạng thái và in hóa đơn (nếu có).
- **Quản lý Khách hàng:** Xem danh sách người dùng, khoá/mở khoá tài khoản, xem lịch sử mua hàng của khách.

### 3.3. Backend API (`backend-expressjs`)
- Cung cấp toàn bộ các Web APIs theo chuẩn RESTful (`/api/v1/users`, `/api/v1/products`, `/api/v1/orders`,...).
- **Middleware Security:** JWT Authentication, Role-based Access Control (kiểm tra quyền Admin / User).
- **Xử lý Upload:** Upload hình ảnh sản phẩm/avatar thông qua Multer (lưu trữ tại server tĩnh hoặc Cloudinary/S3).
- **Xử lý nghiệp vụ phức tạp:** Tính toán tổng tiền giỏ hàng, trừ số lượng tồn kho khi đặt hàng thành công, gửi email thông báo đơn hàng (với Nodemailer).

---

## 4. Thiết kế Cơ sở Dữ liệu sơ bộ (Các Thực thể chính)
Nếu sử dụng NoSQL (MongoDB), đây là sơ đồ các Schema chính:
- **User:** `_id`, `name`, `email`, `password` (đã mã hoá), `role` (user/admin), `phone`, `address`, `createdAt`.
- **Category:** `_id`, `name`, `slug`, `image`, `description`.
- **Product:** `_id`, `name`, `category_id`, `price`, `stock`, `description`, `images` (mảng hình ảnh), `compatible_cars` (các xe tương thích), `part_number`, `createdAt`.
- **Order:** `_id`, `user_id`, `orderItems` (Mảng chứa cấu trúc `{ product_id, name, qty, price }`), `shippingAddress`, `paymentMethod`, `totalPrice`, `status`, `deliveredAt`.
- **Review:** `_id`, `user_id`, `product_id`, `rating` (1-5 sao), `comment`.

---

## 5. Công Nghệ Đề Xuất Áp Dụng
- **Frontend Stack:** React 18+, Vite, React Router DOM (Điều hướng), Redux Toolkit hoặc Zustand (Quản lý State), Tailwind CSS (Thiết kế giao diện nhanh), Axios (gọi API).
- **Backend Stack:** Node.js, ExpressJS.
- **Database ORM/ODM:** Mongoose (cho MongoDB) hoặc Prisma/Sequelize (cho SQL).
- **Công cụ hỗ trợ:** Postman (Test API), Git/GitHub (Quản lý mã nguồn), Bcrypt.js (Hashe Password).

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

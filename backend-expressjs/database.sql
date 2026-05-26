-- Tạo Database
CREATE DATABASE IF NOT EXISTS `auto_parts_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `auto_parts_db`;

-- 1. Bảng lưu trữ Người dùng (Khách hàng & Quản trị viên)
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `fullname` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(20),
  `address` TEXT,
  `role` ENUM('admin', 'user') DEFAULT 'user',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Bảng lưu trữ Danh mục phụ tùng (Ví dụ: Động cơ, Điện tử, Lốp xe...)
CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(100) NOT NULL UNIQUE,
  `image_url` VARCHAR(255),
  `description` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. Bảng lưu trữ Sản phẩm / Phụ tùng
CREATE TABLE IF NOT EXISTS `products` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `category_id` INT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `part_number` VARCHAR(100) UNIQUE COMMENT 'Mã OEM hoặc số hiệu phụ tùng',
  `price` DECIMAL(10,2) NOT NULL,
  `stock` INT DEFAULT 0 COMMENT 'Số lượng tồn kho',
  `description` TEXT,
  `compatible_cars` TEXT COMMENT 'Lưu thông tin các hãng/đời xe tương thích (JSON hoặc chuỗi)',
  `main_image` VARCHAR(255),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. Bảng lưu trữ các Hình ảnh phụ của Sản phẩm
CREATE TABLE IF NOT EXISTS `product_images` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `product_id` INT NOT NULL,
  `image_url` VARCHAR(255) NOT NULL,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. Bảng đơn hàng
CREATE TABLE IF NOT EXISTS `orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `total_price` DECIMAL(12,2) NOT NULL,
  `status` ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  `payment_method` ENUM('cod', 'card', 'vnpay', 'momo') DEFAULT 'cod',
  `shipping_address` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
) ENGINE=InnoDB;

-- 6. Bảng chi tiết đơn hàng (Lưu lại giá ở thời điểm mua)
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL,
  `product_id` INT NOT NULL,
  `quantity` INT NOT NULL,
  `price_at_purchase` DECIMAL(10,2) NOT NULL COMMENT 'Giá của 1 sản phẩm tại lúc đặt mua',
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`)
) ENGINE=InnoDB;

-- 7. Bảng Đánh giá & Bình luận sản phẩm từ Khách hàng
CREATE TABLE IF NOT EXISTS `reviews` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `product_id` INT NOT NULL,
  `rating` INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  `comment` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- INSERT THỬ NGHIỆM DỮ LIỆU MẪU (DUMMY DATA)
INSERT INTO `users` (`fullname`, `email`, `password`, `role`) VALUES 
('Quản trị viên', 'admin@gmail.com', '$2a$10$Y1l.tH/tS7W4zLhX8X.u3.oIqA9kO8vH.tS7W4zLhX8X.u3.oIqA9', 'admin'),
('Khách Hàng Tuấn', 'tuan@gmail.com', '$2a$10$Y1l.tH/tS7W4zLhX8X.u3.oIqA9kO8vH.tS7W4zLhX8X.u3.oIqA9', 'user');

INSERT INTO `categories` (`name`, `slug`, `description`) VALUES 
('Hệ thống phanh', 'he-thong-phanh', 'Phụ tùng thuộc hệ thống phanh, má phanh, đĩa phanh'),
('Chiếu sáng & Gương', 'chieu-sang-guong', 'Đèn pha, đèn xi nhan, gương chiếu hậu');

INSERT INTO `products` (`category_id`, `name`, `slug`, `part_number`, `price`, `stock`, `description`, `compatible_cars`) VALUES 
(1, 'Má phanh gốm Toyota Vios', 'ma-phanh-gom-toyota-vios', 'OEM-T123', 500000, 50, 'Má phanh ô tô chất liệu gốm cao cấp', 'Toyota Vios 2018-2023'),
(2, 'Đèn Pha LED Hyundai Accent', 'den-pha-led-hyundai-accent', 'L-ACC-400', 1200000, 20, 'Đèn pha độ LED siêu sáng cho Accent', 'Hyundai Accent 2021');

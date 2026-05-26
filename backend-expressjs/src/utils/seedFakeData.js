const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: '../../.env' });

const User = require('../models/userModel');
const Category = require('../models/categoryModel');
const Product = require('../models/productModel');
const Order = require('../models/orderModel');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/auto_parts_db';

const categoriesData = [
  { name: 'Động cơ & Hộp số', slug: 'dong-co-hop-so', description: 'Phụ tùng liên quan đến động cơ và hộp số' },
  { name: 'Hệ thống phanh', slug: 'he-thong-phanh', description: 'Má phanh, đĩa phanh, dầu phanh' },
  { name: 'Hệ thống treo', slug: 'he-thong-treo', description: 'Phuộc nhún, càng A, rô tuyn' },
  { name: 'Hệ thống điện & Đèn', slug: 'he-thong-dien-den', description: 'Đèn pha, ắc quy, bugi, dây điện' },
  { name: 'Lọc & Dung dịch', slug: 'loc-dung-dich', description: 'Lọc nhớt, lọc gió, nước mát, dầu nhớt' },
  { name: 'Nội thất & Tiện nghi', slug: 'noi-that-tien-nghi', description: 'Bọc vô lăng, thảm lót sàn, màn hình' },
  { name: 'Ngoại thất', slug: 'ngoai-that', description: 'Gạt mưa, gương chiếu hậu, mâm lốp' }
];

const generateProducts = (categories) => {
  const products = [];
  const brands = ['Toyota', 'Honda', 'Ford', 'Hyundai', 'Kia', 'Mazda', 'Bosch', 'Denso'];
  
  categories.forEach((cat, index) => {
    for (let i = 1; i <= 15; i++) {
      const brand = brands[Math.floor(Math.random() * brands.length)];
      products.push({
        name: `Sản phẩm ${cat.name} - ${brand} Mã ${i}`,
        slug: `${cat.slug}-${brand.toLowerCase()}-${i}-${Date.now()}`,
        part_number: `PN-${brand.substring(0, 3).toUpperCase()}-${index}${i}${Math.floor(Math.random() * 1000)}`,
        price: Math.floor(Math.random() * 50 + 1) * 100000, // 100k - 5tr
        stock: Math.floor(Math.random() * 100),
        description: `Đây là sản phẩm phụ tùng ô tô cao cấp thuộc danh mục ${cat.name}. Tương thích với nhiều dòng xe của ${brand}.`,
        compatible_cars: `${brand} 2018-2024`,
        category_id: cat._id
      });
    }
  });
  return products;
};

const generateUsers = async () => {
  const users = [];
  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash('123456', salt);
  
  for (let i = 1; i <= 25; i++) {
    users.push({
      fullname: `Khách Hàng Dummy ${i}`,
      email: `customer${i}@example.com`,
      password,
      phone: `098${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`,
      address: `123 Đường Số ${i}, Quận ${Math.floor(Math.random() * 10) + 1}, TP.HCM`,
      role: 'user'
    });
  }
  return users;
};

const generateOrders = (users, products) => {
  const orders = [];
  const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  const methods = ['cod', 'card', 'vnpay', 'momo'];
  
  // Create 150 fake orders
  for (let i = 0; i < 150; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const numItems = Math.floor(Math.random() * 4) + 1; // 1 to 4 items
    const orderItems = [];
    let total_price = 0;
    
    for (let j = 0; j < numItems; j++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const quantity = Math.floor(Math.random() * 3) + 1;
      orderItems.push({
        product_id: product._id,
        quantity,
        price_at_purchase: product.price
      });
      total_price += product.price * quantity;
    }
    
    // Spread dates over the last 30 days
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - Math.floor(Math.random() * 30));
    
    orders.push({
      user_id: user._id,
      total_price,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      payment_method: methods[Math.floor(Math.random() * methods.length)],
      shipping_address: user.address || 'Địa chỉ giao hàng mặc định',
      orderItems,
      created_at: pastDate,
      updated_at: pastDate
    });
  }
  
  return orders;
};

const seedData = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Keep the admin users, but we can clear products, categories, and orders?
    // Let's not clear users, to keep the admins intact.
    // Instead we can remove all categories, products, orders to start fresh.
    console.log('Clearing existing categories, products, and orders...');
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    // We only delete users that contain "customer" in email to keep admins
    await User.deleteMany({ email: { $regex: /customer/i } });
    console.log('🗑️  Old data cleared.');

    // 1. Seed Categories
    console.log('🌱 Seeding Categories...');
    const createdCategories = await Category.insertMany(categoriesData);
    console.log(`✅ ${createdCategories.length} categories created.`);

    // 2. Seed Products
    console.log('🌱 Seeding Products...');
    const productsData = generateProducts(createdCategories);
    const createdProducts = await Product.insertMany(productsData);
    console.log(`✅ ${createdProducts.length} products created.`);

    // 3. Seed Users (Customers)
    console.log('🌱 Seeding Customers...');
    const usersData = await generateUsers();
    const createdUsers = await User.insertMany(usersData);
    console.log(`✅ ${createdUsers.length} customers created.`);

    // 4. Seed Orders
    console.log('🌱 Seeding Orders...');
    const ordersData = generateOrders(createdUsers, createdProducts);
    const createdOrders = await Order.insertMany(ordersData);
    console.log(`✅ ${createdOrders.length} orders created.`);

    console.log('🎉 All fake data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedData();

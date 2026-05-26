// Endpoint chưa được khai báo
const notFound = (req, res, next) => {
  const error = new Error(`Api endpoint not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Chuẩn hóa định dạng lỗi toàn hệ thống về dạng { success, message, stack }
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  res.status(statusCode).json({
    success: false,
    message: err.message,
    // Không lộ stack trace lên Frontend ở môi trường Production
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = { notFound, errorHandler };

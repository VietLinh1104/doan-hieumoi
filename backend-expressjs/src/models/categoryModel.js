const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxLength: 100
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    maxLength: 100
  },
  image_url: {
    type: String,
    maxLength: 255
  },
  description: {
    type: String
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: false }
});

module.exports = mongoose.model('Category', categorySchema);

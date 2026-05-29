const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxLength: 255
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    maxLength: 255
  },
  part_number: {
    type: String,
    unique: true,
    maxLength: 100,
    sparse: true
  },
  price: {
    type: Number,
    required: true
  },
  stock: {
    type: Number,
    default: 0
  },
  description: {
    type: String
  },
  compatible_cars: {
    type: String
  },
  main_image: {
    type: String,
    maxLength: 255
  },
  image_url: {
    type: String,
    maxLength: 255
  },
  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  is_hidden: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('Product', productSchema);

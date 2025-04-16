const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true, 
    ref: 'User'
  },
  medicineId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Medicine'
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,  // Default quantity is 1 when adding to cart
    min: 1
  }
}, { timestamps: true });

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;

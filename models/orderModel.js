// const mongoose = require('mongoose');

// const orderSchema = new mongoose.Schema({
//   medicineId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Medicine',
//     required: true
//   },
//   medicineName: {
//     type: String,
//     required: true
//   },
//   quantity: {
//     type: Number,
//     required: true,
//     min: 1
//   },
//   name: {
//     type: String,
//     required: true
//   },
//   phoneNo: {
//     type: String,
//     required: true
//   },
//   email: {
//     type: String,
//     required: true
//   },
//   address: {
//     type: String,
//     required: true
//   },
//   status: {
//     type: String,
//     enum: ['Pending', 'Approved', 'Rejected', 'Delivered'],
//     default: 'Pending'
//   }
// }, { timestamps: true });

// const Order = mongoose.model('Order', orderSchema);

// module.exports = Order;

const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  items: [
    {
      medicineId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Medicine', 
        required: true 
      },
      medicineName: { 
        type: String, 
        required: true 
      },
      quantity: { 
        type: Number, 
        required: true, 
        min: 1 
      },
      price: { 
        type: Number, 
        required: true, 
        min: 0 
      }
    }
  ],
  deliveryAgentId: { 
    type: String, 
    ref: 'DeliveryAgent', 
    default: null 
  },
  name: { 
    type: String, 
    required: true 
  },
  phoneNo: { 
    type: String, 
    required: true, 
    match: /^[0-9]{10}$/ 
  },
  email: { 
    type: String, 
    required: true 
  },
  address: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected', 'Delivered', 'Assigned'], 
    default: 'Pending' 
  },
  grandTotal: { 
    type: Number, 
    required: true 
  }
}, { timestamps: true });


const Order = mongoose.model('Order', orderSchema);

module.exports = Order;


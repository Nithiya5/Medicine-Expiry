
// const mongoose = require('mongoose');
// const { v4: uuidv4 } = require('uuid');

// const DeliveryAgentSchema = new mongoose.Schema({
//   _id: {
//     type: String,
//     default: uuidv4,
//   },
//   fullName: {
//     type: String,
//     required: true,
//   },
//   email: { 
//     type: String, 
//     required: true, 
//     unique: true,
//   },
//   phone: {
//     type: String,
//     required: true,
//   },
//   address: {
//     type: String,
//     required: true,
//   },

//   licenseNumber: {
//     type: String,
//     required: true,
//   },
//   licensePhotoUrl: {
//     type: String, 
//     required: true,
//   },
//   vehicle: {
//     registrationNumber: {
//       type: String,
//       required: true,
//     },
//     type: {
//       type: String,
//       enum: ['bike', 'scooter', 'car', 'van', 'other'],
//       required: true,
//     },
//   },
//   idProofUrl: {
//     type: String, 
//   },
//   profilePhotoUrl: {
//     type: String, 
//     required: true,
//   },

//   status: {
//     type: String,
//     enum: ['pending', 'approved', 'rejected'],
//     default: 'pending',
//   },

//   assignedOrders: [{
//     type: String,
//     ref: 'Order',
//   }],

//   isAvailable: {
//     type: Boolean,
//     default: true,
//   },

//   password: {
//     type: String,
//     default: null,
//   },

//   role: {
//     type: String,
//     enum: ['deliveryAgent'],
//     default: 'deliveryAgent',
//   },

//   createdAt: {
//     type: Date,
//     default: Date.now,
//   }
// });

// module.exports = mongoose.model('DeliveryAgent', DeliveryAgentSchema);

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const DeliveryAgentSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4,
  },
  fullName: {
    type: String,
    required: true,
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
  },
  phone: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  licenseNumber: {
    type: String,
    required: true,
  },
  licensePhotoUrl: {
    type: String, 
    required: true,
  },
  vehicle: {
    registrationNumber: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['bike', 'scooter', 'car', 'van', 'other'],
      required: true,
    },
  },
  idProofUrl: {
    type: String, 
  },
  profilePhotoUrl: {
    type: String, 
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  assignedOrders: [{
    type: String,
    ref: 'Order',
  }],
  rejectedOrders: [{               // ✅ New field added here
    type: String,
    ref: 'Order',
  }],
  isAvailable: {
    type: Boolean,
    default: true,
  },
  password: {
    type: String,
    default: null,
  },
  role: {
    type: String,
    enum: ['deliveryAgent'],
    default: 'deliveryAgent',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('DeliveryAgent', DeliveryAgentSchema);


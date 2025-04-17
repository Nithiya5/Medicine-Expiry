// const mongoose = require('mongoose');
// const { v4: uuidv4 } = require('uuid');

// const AdminSchema = new mongoose.Schema({
//     _id: {
//         type: String,
//         default: uuidv4,
//       },
//   email: { 
//     type: String, 
//     required: true, 
//     unique: true 
//   },
//   password: {
//     type: String,
//     required: true,
//   },
  
// });

// module.exports = mongoose.model('Admin', AdminSchema);

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const AdminSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4,
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: 'admin' // 👈 Role added
  }
});

module.exports = mongoose.model('Admin', AdminSchema);


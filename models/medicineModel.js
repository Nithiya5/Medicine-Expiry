const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  expiryDate: { type: Date, required: true },
  manufactureDate: { type: Date, required: true },
  chemicalContent: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  drugLicense: { type: String, required: true, trim: true },
  userId: { 
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User' 
  },
  category: {
    type:String,required : true
  },
  imageUrl: { type: String }, 
}, {
  timestamps: true
});

const Medicine = mongoose.model('Medicine', medicineSchema);
module.exports = Medicine;

const express = require('express');
const Medicine = require('../models/medicineModel');
// const authMiddleware = require('../middleware/auth'); 

const router = express.Router();
const multer = require('multer');
const streamifier = require('streamifier');
const cloudinary = require('cloudinary').v2;


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = multer.memoryStorage();
const upload = multer({ storage }).single('image');



const addMedicine = async (req, res) => {
  const { userId } = req.params;  // Get userId from params
  const { name, expiryDate, manufactureDate, chemicalContent, quantity, drugLicense, category } = req.body;

  upload(req, res, async (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ error: 'File upload error' });
    }

    try {
      // Upload image to Cloudinary using stream
      const streamUpload = () => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            }
          );
          streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
      };

      const cloudinaryResponse = await streamUpload();

      // Create and save medicine
      const medicine = new Medicine({
        name,
        expiryDate,
        manufactureDate,
        chemicalContent,
        quantity,
        drugLicense,
        userId, // Use userId from params
        category,
        imageUrl: cloudinaryResponse.secure_url
      });

      await medicine.save();
      res.status(201).json(medicine);
    } catch (error) {
      console.error('Error adding medicine:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
};



const getMedicineByCategory = async(req, res) => {
  try {
    const { category, userIdToExclude } = req.query;
    const filter = {};

    // Filter by category if provided
    if (category) {
      filter.category = category;
    }

    // Exclude medicines associated with the specified userId
    if (userIdToExclude) {
      filter.userId = { $ne: userIdToExclude };
    }

    // Fetch medicines from the database
    const medicines = await Medicine.find(filter);

    res.status(200).json(medicines);
  } catch (error) {
    console.error('Error occurred while fetching medicines:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAllMedicine = async (req, res) => {
  try {
    const medicines = await Medicine.find();
    res.json(medicines);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getOneMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }
    res.json(medicine);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMedicinesByUser = async (req, res) => {
  try {
    const medicines = await Medicine.find({ userId: req.params.userId });
    res.json(medicines);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



const updateMedicine =  async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }
    res.json(medicine);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteById = async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndDelete(req.params.id);
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }
    res.json({ message: 'Medicine deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {addMedicine, getAllMedicine,getOneMedicine,updateMedicine,deleteById,getMedicinesByUser,getMedicineByCategory};

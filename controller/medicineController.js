const express = require('express');
const Medicine = require('../models/medicineModel');
const Cart = require('../models/cartModel');
const Order = require('../models/orderModel');
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
const upload = multer({ storage }).single('file');




const addMedicine = async (req, res) => {
  const { userId } = req.params;  // Get userId from params
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
        ...req.body,  // Spread the request body to include all fields
        userId,  // Add userId
        imageUrl: cloudinaryResponse.secure_url  // Add the image URL
      });

      await medicine.save();
      res.status(201).json(medicine);
    } catch (error) {
      console.error('Error adding medicine:', error);  // Log the error details
      res.status(500).json({ error: 'Internal server error', details: error.message });  // Include error details in the response
    }
  });
};


const getMedicineByCategory = async (req, res) => {
  try {
    const { category, userIdToExclude } = req.query;
    const filter = { status: 'Approved' }; // Only approved medicines

    if (category) {
      filter.category = category;
    }

    if (userIdToExclude) {
      filter.userId = { $ne: userIdToExclude };
    }

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
    const medicine = await Medicine.findOne({
      _id: req.params.id,
      status: 'Approved'
    });

    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found or not approved yet' });
    }

    res.json(medicine);
  } catch (error) {
    res.status(500).json({ error: error.message });
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


const updateMedicine = async (req, res) => {
  try {
    const { name, expiryDate, manufactureDate, chemicalContent, quantity, drugLicense, category } = req.body;

    const updateFields = {
      name,
      expiryDate,
      manufactureDate,
      chemicalContent,
      quantity,
      drugLicense,
      category,
      status: 'Pending',  // Set the status to 'Pending' for re-verification
    };

    // Log incoming fields for debugging
    console.log("Received fields:", updateFields);

    // Check if the file is uploaded
    if (req.file && req.file.buffer) {
      const streamUpload = () => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            (error, result) => {
              if (result) {
                resolve(result);
              } else {
                reject(error);
              }
            }
          );
          streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
      };
    
      const result = await streamUpload();
      updateFields.imageUrl = result.secure_url;
    } else if (req.file) {
      // Debug this if buffer is missing
      console.log("req.file exists, but buffer is missing:", req.file);
      return res.status(400).json({ message: 'Uploaded file is invalid or corrupted' });
    }

    // Attempt to update the medicine in the database
    const updatedMedicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    );

    // Check if the medicine was found and updated
    if (!updatedMedicine) {
      console.log(`Medicine not found with id: ${req.params.id}`); // Log the error
      return res.status(404).json({ message: 'Medicine not found' });
    }

    console.log("Updated medicine:", updatedMedicine); // Log the updated medicine data for debugging
    res.json(updatedMedicine);
  } catch (error) {
    // Log the error for debugging
    console.error('Update error:', error);
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

const addToCart = async (req, res) => {
  try {
    const { userId, medicineId } = req.body;

    // Check if the medicine exists
    const medicine = await Medicine.findById(medicineId);
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    // Check if the user has already added the medicine to the cart
    const existingCartItem = await Cart.findOne({ userId, medicineId });
    if (existingCartItem) {
      return res.status(400).json({ message: 'Medicine already in the cart' });
    }

    // Add the medicine to the cart with quantity 1
    const newCartItem = new Cart({
      userId,
      medicineId,
      quantity: 1
    });

    await newCartItem.save();
    res.status(201).json(newCartItem);
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const removeFromCart = async (req, res) => {
  const { userId, medicineId } = req.params;

  try {
    const removedItem = await Cart.findOneAndDelete({ userId, medicineId });

    if (!removedItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    res.status(200).json({ message: "Item removed from cart successfully" });
  } catch (error) {
    console.error("Error removing item from cart:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};


module.exports = {addMedicine, getAllMedicine,getOneMedicine,updateMedicine,deleteById,getMedicinesByUser,getMedicineByCategory,addToCart,removeFromCart};

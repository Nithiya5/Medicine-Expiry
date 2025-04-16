const DeliveryAgent = require('../models/deliveryAgentModel');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = multer.memoryStorage();
const upload = multer({ storage }).fields([
  { name: 'profilePhoto', maxCount: 1 },
  { name: 'licensePhoto', maxCount: 1 },
]);

const streamUpload = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      (error, result) => {
        if (result) resolve(result.secure_url);
        else reject(error);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

const addDeliveryAgent = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ error: 'File upload error' });
    }

    try {
      const {
        fullName,
        email,
        phone,
        address,
        licenseNumber,
        vehicleType,
        registrationNumber
      } = req.body;

      const profileBuffer = req.files['profilePhoto']?.[0]?.buffer;
      const licenseBuffer = req.files['licensePhoto']?.[0]?.buffer;

      if (!profileBuffer || !licenseBuffer) {
        return res.status(400).json({ error: 'Both profile and license photos are required.' });
      }

      const profilePhotoUrl = await streamUpload(profileBuffer);
      const licensePhotoUrl = await streamUpload(licenseBuffer);

      const newAgent = new DeliveryAgent({
        fullName,
        email,
        phone,
        address,
        licenseNumber,
        licensePhotoUrl,
        profilePhotoUrl,
        vehicle: {
          type: vehicleType,
          registrationNumber,
        },
      });

      await newAgent.save();
      res.status(201).json({ message: 'Application submitted successfully', agentId: newAgent._id });
    } catch (error) {
      console.error('Error applying as delivery agent:', error);
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  });
};

module.exports = {
  addDeliveryAgent
};

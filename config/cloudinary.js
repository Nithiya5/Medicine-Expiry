const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: 'YOUR_CLOUD_NAME',
  api_key: 'YOUR_API_KEY',
  api_secret: 'YOUR_API_SECRET'
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'medicines',
    allowed_formats: ['jpg', 'png', 'jpeg']
  },
});

module.exports = { cloudinary, storage };

const DeliveryAgent = require('../models/deliveryAgentModel');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const multer = require('multer');
const Order = require('../models/orderModel');
const nodemailer = require('nodemailer');
const User = require('../models/userModel');



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

// const addDeliveryAgent = async (req, res) => {
//   upload(req, res, async (err) => {
//     if (err) {
//       console.error('Multer error:', err);
//       return res.status(400).json({ error: 'File upload error' });
//     }

//     try {
//       const {
//         fullName,
//         email,
//         phone,
//         address,
//         licenseNumber,
//         vehicleType,
//         registrationNumber
//       } = req.body;

//       const profileBuffer = req.files['profilePhoto']?.[0]?.buffer;
//       const licenseBuffer = req.files['licensePhoto']?.[0]?.buffer;

//       if (!profileBuffer || !licenseBuffer) {
//         return res.status(400).json({ error: 'Both profile and license photos are required.' });
//       }

//       const profilePhotoUrl = await streamUpload(profileBuffer);
//       const licensePhotoUrl = await streamUpload(licenseBuffer);

//       const newAgent = new DeliveryAgent({
//         fullName,
//         email,
//         phone,
//         address,
//         licenseNumber,
//         licensePhotoUrl,
//         profilePhotoUrl,
//         vehicle: {
//           type: vehicleType,
//           registrationNumber,
//         },
//       });

//       await newAgent.save();
//       res.status(201).json({ message: 'Application submitted successfully', agentId: newAgent._id });
//     } catch (error) {
//       console.error('Error applying as delivery agent:', error);
//       res.status(500).json({ error: 'Internal server error', details: error.message });
//     }
//   });
// };

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

      // 1. Check if email already exists in User model
      const userWithEmail = await User.findOne({ email });
      if (userWithEmail) {
        return res.status(400).json({ error: 'Email already registered as a user' });
      }

      // 2. Check if email already exists in DeliveryAgent model
      const existingAgent = await DeliveryAgent.findOne({ email });
      if (existingAgent) {
        return res.status(400).json({ error: 'Email already used by another delivery agent' });
      }

      // 3. Get uploaded images
      const profileBuffer = req.files['profilePhoto']?.[0]?.buffer;
      const licenseBuffer = req.files['licensePhoto']?.[0]?.buffer;

      if (!profileBuffer || !licenseBuffer) {
        return res.status(400).json({ error: 'Both profile and license photos are required.' });
      }

      const profilePhotoUrl = await streamUpload(profileBuffer);
      const licensePhotoUrl = await streamUpload(licenseBuffer);

      // 4. Create new delivery agent
      const newAgent = new DeliveryAgent({
        fullName,
        email,
        phone,
        address,
        licenseNumber,
        licensePhotoUrl,
        profilePhotoUrl,
        role: 'deliveryAgent', // Explicitly set role
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

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmail = async (to, subject, text) => {
  const mailOptions = { from: process.env.GMAIL_USER, to, subject, text };
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✔ Email sent: ${info.response}`);
    return info;
  } catch (err) {
    console.error('✖ Email error:', err);
    throw err;
  }
};

const adminEmail = process.env.EMAIL_USER || 'admin@example.com';

const acceptOrder = async (req, res) => {
  try {
    const { agentId, orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.deliveryAgentId.toString() !== agentId)
      return res.status(403).json({ message: 'Not authorized for this order' });

    order.status = 'Approved';
    await order.save();

    // Notify user
    await sendEmail(
      order.email,
      'Your Order Is On The Way',
      `Hi ${order.name},\n\nYour order #${orderId} has been accepted by our delivery agent and is on the way.\n\nThank you for shopping with us.`
    );

    // Notify admin
    await sendEmail(
      adminEmail,
      'Order Accepted by Delivery Agent',
      `Order #${orderId} has been accepted by agent ID ${agentId}.`
    );

    res.status(200).json({ message: 'Order accepted, notifications sent' });
  } catch (err) {
    res.status(500).json({ message: 'Error accepting order', error: err.message });
  }
};

const rejectOrder = async (req, res) => {
  try {
    const { agentId, orderId, reason } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.deliveryAgentId.toString() !== agentId)
      return res.status(403).json({ message: 'Not authorized for this order' });

    order.status = 'Rejected';
    order.deliveryAgentId = null;
    await order.save();

    // Notify admin with reason
    await sendEmail(
      adminEmail,
      'Order Rejected by Delivery Agent',
      `Order #${orderId} was rejected by agent ID ${agentId}.\nReason: ${reason}\n\nPlease reassign to another agent.`
    );

    res.status(200).json({ message: 'Order rejected and admin notified' });
  } catch (err) {
    res.status(500).json({ message: 'Error rejecting order', error: err.message });
  }
};

const confirmDelivery = async (req, res) => {
  try {
    const { agentId, orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.deliveryAgentId.toString() !== agentId)
      return res.status(403).json({ message: 'Not authorized for this order' });

    // Generate front‑end confirmation link
    const confirmationLink = `${process.env.APP_URL}/confirm-delivery/${orderId}`;

    await sendEmail(
      order.email,
      'Please Confirm Your Delivery',
      `Hi ${order.name},\n\nYour delivery is marked as delivered by our agent.\nPlease confirm receipt by clicking the link below:\n\n${confirmationLink}\n\nThank you!`
    );

    res.status(200).json({ message: 'Confirmation email sent to user' });
  } catch (err) {
    res.status(500).json({ message: 'Error sending confirmation email', error: err.message });
  }
};



module.exports = {
  addDeliveryAgent,
  acceptOrder,
  rejectOrder,
  confirmDelivery,
};

const jwt = require('jsonwebtoken');
const Admin = require('../models/adminModel'); 
const bcrypt = require('bcrypt');
const DeliveryAgent = require('../models/deliveryAgentModel');
const nodemailer = require('nodemailer'); 
const Order = require('../models/orderModel'); 

// const adminLogin = async (req, res) => {
//     const { id, email, password } = req.body;
  
//     try {
//       // Find the admin by ID
//       const admin = await Admin.findById(id);
//       if (!admin) {
//         return res.status(404).json({ message: "Admin not found" });
//       }
  
//       // Check if the provided email matches the one in the record
//       if (admin.email !== email) {
//         return res.status(401).json({ message: "Invalid email or password" });
//       }
  
//       // Compare the provided password with the hashed password stored in DB
//       const isMatch = await bcrypt.compare(password, admin.password);
//       if (!isMatch) {
//         return res.status(401).json({ message: "Invalid email or password" });
//       }
  
//       // Create a JWT token
//       const token = jwt.sign(
//         { id: admin._id, email: admin.email },
//         process.env.JWT_SECRET,
//         { expiresIn: '1d' }
//       );
  
//       res.status(200).json({
//         message: "Login successful",
//         token,
//         adminEmail: admin.email,
//       });
  
//     } catch (error) {
//       console.error("Admin login error:", error);
//       res.status(500).json({ message: "Server error" });
//     }
//   };

const registerAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create admin
    const newAdmin = new Admin({
      email,
      password: hashedPassword,
    });

    await newAdmin.save();

    res.status(201).json({
      message: 'Admin registered successfully',
      admin: {
        id: newAdmin._id,
        email: newAdmin.email,
        role: newAdmin.role,
      },
    });

  } catch (err) {
    console.error('Error registering admin:', err);
    res.status(500).json({ message: 'Server error' });
  }
};



const Medicine = require('../models/medicineModel');

// 1. Get all medicines pending approval
const getPendingMedicines = async (req, res) => {
  try {
    const pendingMedicines = await Medicine.find({ status: 'Pending' });
    res.status(200).json(pendingMedicines);
  } catch (error) {
    console.error('Error fetching pending medicines:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 2. Approve and set price
const approveMedicine = async (req, res) => {
  try {
    const { id } = req.params;
    const { price } = req.body;

    if (!price || price <= 0) {
      return res.status(400).json({ error: 'Price must be greater than 0' });
    }

    const medicine = await Medicine.findByIdAndUpdate(
      id,
      { price, status: 'Approved' },
      { new: true, runValidators: true }
    );

    if (!medicine) {
      return res.status(404).json({ error: 'Medicine not found' });
    }

    res.status(200).json({ message: 'Medicine approved', medicine });
  } catch (error) {
    console.error('Error approving medicine:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 3. Reject medicine (delete from DB)
const rejectMedicine = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedMedicine = await Medicine.findByIdAndDelete(id);

    if (!deletedMedicine) {
      return res.status(404).json({ error: 'Medicine not found' });
    }

    res.status(200).json({ message: 'Medicine rejected and deleted' });
  } catch (error) {
    console.error('Error rejecting medicine:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getApprovedMedicines = async (req, res) => {
  try {
    const approvedMedicines = await Medicine.find({ status: 'Approved' });
    res.status(200).json(approvedMedicines);
  } catch (error) {
    console.error('Error fetching approved medicines:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getApprovedOrders = async (req, res) => {
  try {
    const approvedOrders = await Order.find({ status: 'Approved' })
      .populate('medicineId')
      .populate('userId')
      .sort({ createdAt: -1 });
    res.status(200).json(approvedOrders);
  } catch (error) {
    console.error('Error fetching approved orders:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const multer = require('multer');
const streamifier = require('streamifier');
const cloudinary = require('cloudinary').v2;

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer setup
const storage = multer.memoryStorage();
const upload = multer({ storage }).single('file');

// Edit controller
const editMedicine = async (req, res) => {
  try {
    const {
      name,
      expiryDate,
      manufactureDate,
      chemicalContent,
      quantity,
      drugLicense,
      category,
      price
    } = req.body;

    const updateFields = {
      name,
      expiryDate,
      manufactureDate,
      chemicalContent,
      quantity,
      drugLicense,
      category,
      price,
      status: 'Approved'  // Admin keeps it as approved
    };

    // Image upload (if provided)
    if (req.file && req.file.buffer) {
      const streamUpload = () => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream((error, result) => {
            if (result) resolve(result);
            else reject(error);
          });
          streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
      };

      const result = await streamUpload();
      updateFields.imageUrl = result.secure_url;
    }

    const updatedMedicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    );

    if (!updatedMedicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    res.status(200).json({
      message: 'Medicine updated successfully',
      medicine: updatedMedicine
    });

  } catch (error) {
    console.error('Error editing medicine:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteMedicine = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedMedicine = await Medicine.findByIdAndDelete(id);

    if (!deletedMedicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    res.status(200).json({ message: 'Medicine deleted successfully' });
  } catch (error) {
    console.error('Error deleting medicine:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all orders with status "Pending"
const getPendingOrders = async (req, res) => {
  try {
    const pendingOrders = await Order.find({ status: 'Pending' })
      .populate('medicineId')
      .populate('userId')
      .sort({ createdAt: -1 });
    res.status(200).json(pendingOrders);
  } catch (error) {
    console.error('Error fetching pending orders:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getAllOrders = async (req, res) => {
  try {
    // Optionally populate related fields like medicineId and userId if needed
    const orders = await Order.find()
      .populate('medicineId')
      .populate('userId')
      .sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getAvailableDeliveryAgents = async (req, res) => {
  try {
    const { orderId } = req.params;  // Assuming orderId is passed in the URL

    // Fetch available agents who have not rejected the specified order
    const availableAgents = await DeliveryAgent.find({
      isAvailable: true,  // Agents should be available
      status: 'approved', // Optional: Ensure the agent is approved
      rejectedOrders: { $ne: orderId }, // Ensure the agent hasn't rejected this order
    });

    if (availableAgents.length === 0) {
      return res.status(404).json({ message: 'No available agents for this order' });
    }

    res.status(200).json(availableAgents);
  } catch (error) {
    console.error('Error fetching available agents:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


// Assign a delivery agent to an order and update its status
const assignDeliveryAgent = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { deliveryAgentId } = req.body;

    if (!deliveryAgentId) {
      return res.status(400).json({ message: 'Delivery Agent ID is required' });
    }

    // Update the order by assigning the delivery agent and updating the status
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { deliveryAgentId, status: 'Approved' },
      { new: true, runValidators: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({ message: 'Delivery agent assigned successfully', order: updatedOrder });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Utility function to send emails
const sendEmail = async (recipient, subject, message) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: recipient,
    subject,
    text: message
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${recipient}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// View pending applications
const viewDeliveryAgentApplications = async (req, res) => {
  try {
    const applications = await DeliveryAgent.find({ status: 'pending' });
    res.status(200).json(applications);
  } catch (error) {
    console.error("Error fetching delivery agent applications:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Approve application and email credentials
const approveDeliveryAgentApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const agent = await DeliveryAgent.findById(id);

    if (!agent) {
      return res.status(404).json({ message: 'Delivery agent application not found' });
    }

    agent.status = 'approved';
    const generatedPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);
    agent.password = hashedPassword;

    await agent.save();

    const loginUrl = process.env.DELIVERY_AGENT_LOGIN_URL || "http://yourwebsite.com/delivery-agent/login";
    const subject = "Delivery Agent Application Approved";
    const message = `Hello ${agent.fullName},

Your application has been approved.

Login credentials:
Login URL: ${loginUrl}
Email: ${agent.email}
Password: ${generatedPassword}

Please log in and update your profile.

Thank you.`;

    await sendEmail(agent.email, subject, message);

    res.status(200).json({ message: "Application approved and credentials sent.", agent });
  } catch (error) {
    console.error("Error approving application:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Reject application and delete the record
const rejectDeliveryAgentApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const agent = await DeliveryAgent.findById(id);

    if (!agent) {
      return res.status(404).json({ message: 'Delivery agent application not found' });
    }

    const subject = "Delivery Agent Application Rejected";
    const message = `Hello ${agent.fullName},

We regret to inform you that your delivery agent application has been rejected.

Thank you for your interest.`;

    await sendEmail(agent.email, subject, message);
    await DeliveryAgent.findByIdAndDelete(id);

    res.status(200).json({ message: "Application rejected, notification sent, and record deleted." });
  } catch (error) {
    console.error("Error rejecting application:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

const adminEmail = process.env.EMAIL_USER || 'admin@example.com';

const assignOrderToAgent = async (req, res) => {
  try {
    const { orderId, agentId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const agent = await DeliveryAgent.findById(agentId);
    if (!agent || agent.status !== 'approved') {
      return res.status(400).json({ message: 'Invalid or unapproved delivery agent' });
    }

    order.deliveryAgentId = agentId;
    order.status = 'Assigned';
    await order.save();

    agent.assignedOrders.push(orderId);
    await agent.save();

    // Notify agent
    await sendEmail(
      process.env.EMAIL_USER,
      'New Order Assigned',
      `Hello ${agent.fullName},\n\nYou have been assigned Order #${orderId}. Please log into your portal to view details.\n\nThanks.`
    );

    res.status(200).json({ message: 'Order assigned and agent notified' });
  } catch (err) {
    res.status(500).json({ message: 'Error assigning order', error: err.message });
  }
};

module.exports = {
  getPendingMedicines,
  approveMedicine,
  rejectMedicine,
  getApprovedMedicines,
  getApprovedOrders,
  getPendingOrders,
    getAllOrders,
    assignDeliveryAgent,
    viewDeliveryAgentApplications,
    approveDeliveryAgentApplication,
    rejectDeliveryAgentApplication,
    assignOrderToAgent,
    registerAdmin
    ,editMedicine,
    deleteMedicine,
    getAvailableDeliveryAgents
};


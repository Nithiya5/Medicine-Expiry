const User = require("../models/userModel");
const bcrypt=require("bcryptjs");
const jwt= require("jsonwebtoken");
const nodemailer = require('nodemailer');
const Order = require("../models/orderModel");
const DeliveryAgent = require("../models/deliveryAgentModel");

// const register = async (req, res) => {
//     try {
//         const {
//             userName,
//             email,
//             password,
           
//         } = req.body;

       
//         if (!userName || !email || !password) {
//             return res.status(400).send("Please enter all required fields");
//         }

        
//         const existingUser = await User.findOne({ email });
//         if (existingUser) {
//             return res.status(400).send("User already exists");
//         }

//         const newUser = new User({
//                 userName,
//                 email,
//                 password, 
             
//         });

       
//         await newUser.save();
//         res.status(201).json({ user: newUser });
//     } catch (err) {
//         console.error(err); 
//         res.status(400).send("An error occurred");
//     }
// };

const register = async (req, res) => {
  try {
      const {
          userName,
          email,
          password,
      } = req.body;

      if (!userName || !email || !password) {
          return res.status(400).send("Please enter all required fields");
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
          return res.status(400).send("User already exists");
      }

      const existingAgent = await DeliveryAgent.findOne({ email });
      if (existingAgent) {
          return res.status(400).send("Email already registered as a delivery agent");
      }

      const newUser = new User({
          userName,
          email,
          password,
          role: "user" // 👈 explicitly set role
      });

      await newUser.save();
      res.status(201).json({ user: newUser });
  } catch (err) {
      console.error(err);
      res.status(400).send("An error occurred");
  }
};

// const login = async (req, res) => {
//     try {
//         const { email, password } = req.body;
//         const user = await User.findOne({ email });
        
//         if (!user) {
//             return res.status(400).json({ message: 'User not found' });
//         }

//         const isValid = await bcrypt.compare(password, user.password);
//         if (!isValid) {
//             return res.status(400).json({ message: 'Invalid password' });
//         }

//         const token = jwt.sign(
//             { userId: user._id }, // Embed _id here
//             process.env.JWT_SECRET,
//             { expiresIn: '1d' }
//           );

        
//           res.status(200).json({
//             token,
//             user: {
//                 _id: user._id,
//                 userName: user.userName,
//                 email: user.email
//             }
//         });
//     } catch (err) {
//         console.error(err);
//         res.status(400).json({ message: 'An error occurred' });
//     }
// };

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

const confirmDelivery = async(req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).send('Invalid Order ID');

    order.status = 'Delivered';
    await order.save();

    // Notify admin
    await sendEmail(
      adminEmail,
      'Order Delivered Successfully',
      `Order #${orderId} has been confirmed delivered by the user.`
    );

    res.send('Thank you! Your delivery has been confirmed.');
  } catch (err) {
    res.status(500).send('Error confirming delivery');
  }
};



module.exports={register ,confirmDelivery};
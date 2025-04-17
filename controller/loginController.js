const User = require('../models/userModel');
const Admin = require('../models/adminModel');
const DeliveryAgent = require('../models/deliveryAgentModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Check Admin
    let user = await Admin.findOne({ email });
    let role = 'admin';

    // 2. If not Admin, check Delivery Agent
    if (!user) {
      user = await DeliveryAgent.findOne({ email });
      role = 'deliveryAgent';
    }

    // 3. If not Delivery Agent, check User
    if (!user) {
      user = await User.findOne({ email });
      role = 'user';
    }

    // 4. If email not found in any model
    if (!user) {
      return res.status(404).json({ message: 'Invalid email or password' });
    }

    // 5. Password check
    if (!user.password) {
      return res.status(401).json({ message: 'Password not set. Please contact admin.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // 6. Create JWT
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      role,
      user: {
        id: user._id,
        email: user.email,
      },
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { login };

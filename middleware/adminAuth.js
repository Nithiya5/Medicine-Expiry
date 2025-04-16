const jwt = require('jsonwebtoken');
const Admin = require('../models/adminModel');

const authAdmin = async (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  const token = authHeader && authHeader.split(' ')[1]; 

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded.id);
    const admin = await Admin.find(decoded.id).select('-password');
    console.log(admin);

    if (!admin) {
      return res.status(403).json({ error: 'Access denied (Admin)' });
    }

    req.admin = admin;
    next();
  } catch (err) {
    console.error('Admin Auth Error:', err);
    res.status(401).json({ error: 'Invalid token (Admin)' });
  }
};

module.exports = authAdmin;

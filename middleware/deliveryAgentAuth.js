const jwt = require('jsonwebtoken');
const DeliveryAgent = require('../models/deliveryAgentModel');

const authDelivery = async (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  const token = authHeader && authHeader.split(' ')[1]; 

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const agent = await DeliveryAgent.findById(decoded.userId).select('-password');

    if (!agent) {
      return res.status(403).json({ error: 'Access denied (Delivery Agent)' });
    }

    req.agent = agent;
    next();
  } catch (err) {
    console.error('Delivery Agent Auth Error:', err);
    res.status(401).json({ error: 'Invalid token (Delivery Agent)' });
  }
};

module.exports = authDelivery;

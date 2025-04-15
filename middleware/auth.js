// const jwt = require('jsonwebtoken');
// const User = require('../models/userModel');

// const auth = async (req, res, next) => {
  
//   const authHeader = req.headers['authorization'] || req.headers['Authorization'];
//   const token = authHeader && authHeader.split(' ')[1]; 
  

  
//   if (!token) {
//     return res.status(401).json({ error: 'No token provided' });
//   }

//   try {
   
//     const decoded = jwt.verify(token,process.env.JWT_SECRET);
    
  
//     const user = await User.findById(decoded.userId);
    
  
//     if (!user) {
//       return res.status(403).json({ error: 'Access denied' });
//     }

    
//     req.user = user;

  
//     next();
//   } catch (err) {
//     console.error('Error in authMiddleware:', err);
//     res.status(401).json({ error: 'Invalid token' });
//   }
// };

// module.exports = auth;

const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const auth = async (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  const token = authHeader && authHeader.split(' ')[1]; 
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select('-password'); // Optional: exclude password

    if (!user) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Attach only required data to req.user
    req.user = {
      _id: user._id,
      email: user.email, // or any other fields you need
      name: user.name
    };

    next();
  } catch (err) {
    console.error('Error in authMiddleware:', err);
    res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = auth;
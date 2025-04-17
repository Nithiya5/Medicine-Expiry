// // const jwt = require('jsonwebtoken');
// // const User = require('../models/userModel');

// // const auth = async (req, res, next) => {
  
// //   const authHeader = req.headers['authorization'] || req.headers['Authorization'];
// //   const token = authHeader && authHeader.split(' ')[1]; 
  

  
// //   if (!token) {
// //     return res.status(401).json({ error: 'No token provided' });
// //   }

// //   try {
   
// //     const decoded = jwt.verify(token,process.env.JWT_SECRET);
    
  
// //     const user = await User.findById(decoded.userId);
    
  
// //     if (!user) {
// //       return res.status(403).json({ error: 'Access denied' });
// //     }

    
// //     req.user = user;

  
// //     next();
// //   } catch (err) {
// //     console.error('Error in authMiddleware:', err);
// //     res.status(401).json({ error: 'Invalid token' });
// //   }
// // };

// // module.exports = auth;

// const jwt = require('jsonwebtoken');
// const User = require('../models/userModel');

// const auth = async (req, res, next) => {
//   const authHeader = req.headers['authorization'] || req.headers['Authorization'];
//   const token = authHeader && authHeader.split(' ')[1]; 
  
//   if (!token) {
//     return res.status(401).json({ error: 'No token provided' });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     const user = await User.findById(decoded.userId).select('-password'); // Optional: exclude password

//     if (!user) {
//       return res.status(403).json({ error: 'Access denied' });
//     }

//     // Attach only required data to req.user
//     req.user = {
//       _id: user._id,
//       email: user.email, // or any other fields you need
//       name: user.name
//     };

//     next();
//   } catch (err) {
//     console.error('Error in authMiddleware:', err);
//     res.status(401).json({ error: 'Invalid token' });
//   }
// };

// module.exports = auth;

const jwt = require('jsonwebtoken');

const auth = (requiredRoles = []) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Add user info to request
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      };

      // If roles are specified, check role match
      if (requiredRoles.length && !requiredRoles.includes(decoded.role)) {
        return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
      }

      next();
    } catch (err) {
      console.error('Auth error:', err);
      res.status(401).json({ message: 'Unauthorized: Invalid or expired token' });
    }
  };
};

module.exports = auth;

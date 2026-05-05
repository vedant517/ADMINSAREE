import jwt from 'jsonwebtoken';
import User from "../../models/User.js";
import Admin from '../models/Admin.js';

export const protect = async (req, res, next) => {
  // ── Strictly read from httpOnly cookie ──
  const token = req.cookies?.token;

  if (!token) {
    console.error('No token found in request cookies');
    return res.status(401).json({ message: 'Not authorized to access this route' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded successfully:', decoded.id);
    
    // Try User model first, then fall back to Admin model
    let user = await User.findById(decoded.id).select('-password');
    if (!user) {
      user = await Admin.findById(decoded.id).select('-password');
    }

    if (!user) {
      console.error('User/Admin not found for ID:', decoded.id);
      return res.status(401).json({ 
        message: 'User not found',
        debug: { id: decoded.id } 
      });
    }

    if (user && user.constructor.modelName === 'User') {
      await User.findByIdAndUpdate(user._id, { lastActive: Date.now() });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('JWT Verification Error:', error.message);
    return res.status(401).json({ message: 'Not authorized to access this route' });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role ${req.user?.role || 'unknown'} is not authorized to access this route`,
      });
    }
    next();
  };
};

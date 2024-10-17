// authMiddleware.js - Updated Version

const jwt = require('jsonwebtoken');
const Band = require('../models/Band');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const band = await Band.findById(decoded.id);
      if (!band) {
        throw new Error('Band not found');
      }

      req.band_id = band._id; // Use MongoDB ObjectId (_id) as band_id

      next();
    } catch (error) {
      console.error('Not authorized, token failed:', error.message);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    console.error('Not authorized, no token');
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };
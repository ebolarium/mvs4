// authMiddleware.js - Extended Debug Version with Additional Checks

const jwt = require('jsonwebtoken');
const Band = require('../models/Band');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      console.log('Token received:', token);  // Log token to check if it is received properly

      if (!token) {
        console.error('No token provided after splitting authorization header');
        return res.status(401).json({ message: 'No token provided' });
      }

      // Verifying the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Decoded Token:', decoded); // Log decoded token to see its contents

      if (!decoded || !decoded.id) {
        console.error('Invalid token structure, missing decoded id');
        return res.status(401).json({ message: 'Invalid token structure' });
      }

      // Fetching the band details
      const band = await Band.findById(decoded.id);
      if (!band) {
        console.error('Band not found for decoded id:', decoded.id);
        throw new Error('Band not found');
      }

      req.band_id = band._id; // Use MongoDB ObjectId (_id) as band_id
      console.log('Band found:', band._id); // Log band ID to verify the band was found

      // Adding extra validation to check if band_id is properly assigned
      if (!req.band_id) {
        console.error('Failed to assign band_id to req object');
        return res.status(401).json({ message: 'Failed to assign band ID' });
      }

      next();
    } catch (error) {
      console.error('Not authorized, token failed:', error.message);
      res.status(401).json({ message: 'Not authorized, token failed', error: error.message }); // Include error message in response for easier debugging
    }
  } else {
    console.error('Not authorized, no token');
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };

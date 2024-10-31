// routes/userRoutes.js

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken'); // JWT token doğrulama

// Demo amaçlı olarak JWT_SECRET doğrudan kod içinde tanımlandı
const JWT_SECRET = 'your_demo_jwt_secret_key'; // Güvenliğiniz için güçlü bir secret kullanın

// Middleware to authenticate and extract user data from JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  console.log('Authorization Header:', authHeader);
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.status(401).json({ error: 'Unauthorized: No token provided' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error('JWT Verification Error:', err);
      return res.status(403).json({ error: 'Forbidden: Invalid token' });
    }
    req.user = user;
    next();
  });
};

// /api/user GET endpoint
router.get('/', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const email = req.user.email;

    res.json({ userId, email });
  } catch (error) {
    console.error('Error in /api/user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;

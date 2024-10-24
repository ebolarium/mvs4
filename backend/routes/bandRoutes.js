const express = require('express');
const { registerBand, loginBand, uploadBandImage, getBandProfile, updateBandProfile } = require('../controllers/bandController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Band = require('../models/Band'); // Eksik olan import düzeltildi
const authenticateToken = require('../middleware/authMiddleware');
const bandController = require('../controllers/bandController');





router.post('/register', registerBand);
router.post('/login', loginBand); // Login rotası eklendi
router.post('/upload-image', protect, uploadBandImage);
router.get('/profile', protect, getBandProfile);
router.put('/profile', protect, updateBandProfile);
router.post('/upload-image', authenticateToken, bandController.uploadBandImage);


router.get('/verify/:token', async (req, res) => {
  const { token } = req.params;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const band = await Band.findOneAndUpdate(
      { band_email: decoded.band_email },
      { is_verified: true },
      { new: true }
    );

    if (!band) {
      return res.status(404).json({ message: 'Band not found' });
    }

    res.status(200).json({ message: 'Email verified successfully!', verified: true });
  } catch (error) {
    console.error('Verification Error:', error.message);
    res.status(400).json({ message: 'Invalid or expired token', error: error.message });
  }
});




module.exports = router;

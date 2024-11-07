//bandRoutes.js
const express = require('express');
const { registerBand, loginBand, uploadBandImage, getBandProfile, updateBandProfile } = require('../controllers/bandController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Band = require('../models/Band'); // Eksik olan import düzeltildi
const authenticateToken = require('../middleware/authMiddleware');
const bandController = require('../controllers/bandController');
const fileUpload = require('express-fileupload');
const crypto = require('crypto');


router.use(fileUpload());

router.post('/register', registerBand);
router.post('/login', loginBand); // Login rotası eklendi
router.get('/profile', protect, getBandProfile);
router.put('/profile', protect, updateBandProfile);
router.post('/upload-image', protect, uploadBandImage);

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



// Şifre sıfırlama token doğrulama ve şifre değiştirme
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const band = await Band.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // Token süresi kontrolü
    });

    if (!band) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Şifre güncelleme
    band.band_password = newPassword;
    band.resetPasswordToken = undefined;
    band.resetPasswordExpires = undefined;

    await band.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ message: 'An error occurred while updating password' });
  }
});


module.exports = router;

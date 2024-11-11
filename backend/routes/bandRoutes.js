//bandRoutes.js
const express = require('express');
const { registerBand, loginBand, uploadBandImage, getBandProfile, updateBandProfile } = require('../controllers/bandController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Band = require('../models/Band');
const crypto = require('crypto');
const fileUpload = require('express-fileupload');

router.use(fileUpload());

// Register, login, profile operations
router.post('/register', registerBand);
router.post('/login', loginBand);
router.get('/profile', protect, getBandProfile);
router.put('/profile', protect, updateBandProfile);
router.post('/upload-image', protect, uploadBandImage);

// Email verification route
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

// Password reset request - send reset token
router.post('/send-reset-password', async (req, res) => {
  const { email } = req.body;

  try {
    const band = await Band.findOne({ band_email: email });

    if (!band) {
      return res.status(404).json({ message: 'Email not found' });
    }

    // Create reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    band.resetPasswordToken = resetToken;
    band.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    await band.save();
    console.log('Reset token saved for band:', band.band_email);

    // Send email logic (assumed to be handled separately)
    const resetURL = `https://votesong.live/reset-password/${resetToken}`;
    // sendEmail function should be implemented in your service to send the reset URL

    res.status(200).json({ message: 'Password reset link sent to your email address.' });
  } catch (error) {
    console.error('Error sending password reset email:', error.message);
    res.status(500).json({ message: 'Failed to send password reset email.' });
  }
});

// Password reset - reset the password using the token
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const band = await Band.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!band) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Update password
    if (!newPassword) {
      return res.status(400).json({ message: 'New password is required' });
    }

    // Assign the new password (hashing will be done in pre('save'))
    band.band_password = newPassword;
    band.resetPasswordToken = undefined;
    band.resetPasswordExpires = undefined;

    await band.save(); // Hashing handled in schema pre('save')
    console.log('Password updated successfully for band:', band.band_email);

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error.message);
    res.status(500).json({ message: 'An error occurred while updating password' });
  }
});

module.exports = router;

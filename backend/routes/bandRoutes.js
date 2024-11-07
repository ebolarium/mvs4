// bandRoutes.js

const express = require('express');
const router = express.Router();
const Band = require('../models/Band');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Şifre sıfırlama token doğrulama ve şifre değiştirme
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    console.log('Searching for token:', token); // Token'ı ararken log ekliyoruz

    const band = await Band.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // Token süresi kontrolü
    });

    if (!band) {
      console.error('Invalid or expired token:', token);
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Şifre güncelleme
    if (!newPassword) {
      console.error('New password is missing');
      return res.status(400).json({ message: 'New password is required' });
    }

    // Şifreyi hashleyerek kaydet
    band.band_password = await bcrypt.hash(newPassword, 10);
    band.resetPasswordToken = undefined;
    band.resetPasswordExpires = undefined;

    await band.save();
    console.log('Password updated successfully for band:', band.band_email);

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error.message);
    res.status(500).json({ message: 'An error occurred while updating password' });
  }
});


// E-posta doğrulama token doğrulama
router.get('/verify/:token', async (req, res) => {
  const { token } = req.params;

  try {
    const band = await Band.findOne({
      verificationToken: token,
      verificationExpires: { $gt: Date.now() },
    });

    if (!band) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    // Kullanıcı doğrulandı
    band.is_verified = true;
    band.verificationToken = undefined;
    band.verificationExpires = undefined;

    await band.save();

    res.status(200).json({ message: 'Email verified successfully!' });
  } catch (error) {
    console.error('Verification Error:', error.message);
    res.status(500).json({ message: 'Verification failed' });
  }
});

module.exports = router;
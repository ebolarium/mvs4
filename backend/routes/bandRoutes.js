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
// emailRoute.js
const express = require('express');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const Band = require('../models/Band');
const router = express.Router();
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: 'smtpout.secureserver.net',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Ortak e-posta gönderim fonksiyonu
async function sendEmail(mailOptions) {
  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully to:', mailOptions.to);
  } catch (error) {
    console.error('Error sending email:', error.message);
    throw new Error('Email sending failed.');
  }
}

// Şifre Sıfırlama İsteği
router.post('/send-reset-password', async (req, res) => {
  const { email } = req.body;

  try {
    const band = await Band.findOne({ band_email: email });

    if (!band) {
      return res.status(404).json({ message: 'Email not found' });
    }

    // Reset token oluştur
    const resetToken = crypto.randomBytes(32).toString('hex');
    band.resetPasswordToken = resetToken;
    band.resetPasswordExpires = Date.now() + 3600000; // 1 saat geçerli

    // Token kaydedildi mi kontrol edin
    await band.save();
    console.log('Token successfully saved for band:', band.band_email);

    // Şifre sıfırlama e-postası gönder
    const resetURL = `https://votesong.live/reset-password/${resetToken}`;
    const mailOptions = {
      from: '"VoteSong Support" <support@votesong.live>',
      to: band.band_email,
      subject: 'Password Reset Request',
      text: `You are receiving this because you requested the reset of the password for your account.\n\n
             Please click on the following link, or paste this into your browser to complete the process:\n\n
             ${resetURL}\n\n
             If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    };

    await sendEmail(mailOptions);
    res.status(200).json({ message: 'Password reset link sent to your email address.' });
  } catch (error) {
    console.error('Error sending password reset email:', error.message);
    res.status(500).json({ message: 'Failed to send password reset email.' });
  }
});


// Doğrulama İsteği (Kayıt sonrası e-posta doğrulama)
router.post('/send-verification', async (req, res) => {
  const { email } = req.body;

  try {
    const band = await Band.findOne({ band_email: email });

    if (!band) {
      return res.status(404).json({ message: 'Email not found' });
    }

    // Verification token oluştur
    const verificationToken = crypto.randomBytes(32).toString('hex');
    band.verificationToken = verificationToken;
    band.verificationExpires = Date.now() + 3600000; // 1 saat geçerli
    await band.save();

    // E-posta doğrulama bağlantısı gönder
    const verificationURL = `https://votesong.live/verify/${verificationToken}`;
    const mailOptions = {
      from: '"VoteSong Support" <support@votesong.live>',
      to: band.band_email,
      subject: 'Email Verification Request',
      text: `Thank you for registering with VoteSong!\n\n
             Please click on the following link to verify your email address:\n\n
             ${verificationURL}\n\n
             If you did not sign up, please ignore this email.\n`,
    };

    await sendEmail(mailOptions);
    res.status(200).json({ message: 'Verification link sent to your email address.' });
  } catch (error) {
    console.error('Error sending verification email:', error.message);
    res.status(500).json({ message: 'Failed to send verification email.' });
  }
});

module.exports = router;

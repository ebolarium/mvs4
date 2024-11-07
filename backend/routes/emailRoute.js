const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();
require('dotenv').config();
const crypto = require('crypto');
const Band = require('../models/Band');

const transporter = nodemailer.createTransport({
  host: 'smtpout.secureserver.net',
  port: 465,
  secure: true, // SSL kullanımı
  auth: {
    user: process.env.EMAIL_USER, // .env dosyasından kullanıcı adı
    pass: process.env.EMAIL_PASSWORD, // Şifrenizi .env dosyasından alın
  },
});

// POST endpoint: E-posta gönderimi
router.post('/send-email', async (req, res) => {
  const { name, email, message } = req.body;

  const mailOptions = {
    from: '"VoteSong Support" <support@votesong.live>', // Gönderen adı ve adresi
    to: 'support@votesong.live', // Alıcı adresi
    subject: `New Message from ${name}`,
    text: `You have received a new message:\n\nName: ${name}\nEmail: ${email}\nMessage: ${message}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully to:', email);
    res.status(200).json({ message: 'Email sent successfully!' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Email sending failed.', error: error.message });
  }
});

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
    await band.save();

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

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Password reset link sent to your email address.' });
  } catch (error) {
    console.error('Error sending password reset email:', error);
    res.status(500).json({ message: 'Failed to send password reset email.' });
  }
});


module.exports = router;

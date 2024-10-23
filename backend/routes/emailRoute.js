const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();
require('dotenv').config();

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

module.exports = router;

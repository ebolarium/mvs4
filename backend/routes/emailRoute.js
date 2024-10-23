const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: 'smtpout.secureserver.net', // GoDaddy SMTP sunucusu
    port: 465, // SSL için kullanılan port
    secure: true, // SSL kullanımı
    auth: {
      user: process.env.EMAIL_USER, // Gönderici e-posta adresiniz
      pass: process.env.EMAIL_PASSWORD, // SMTP şifreniz
    },
  });


// POST endpoint: E-posta gönderimi
router.post('/send-email', (req, res) => {
  const { name, email, message } = req.body;

  const mailOptions = {
    from: email,
    to: 'support@votesong.live',
    subject: `New Message from ${name}`,
    text: `You have received a new message:\n\nName: ${name}\nEmail: ${email}\nMessage: ${message}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {

    console.error('Error sending email:', error);
    return res.status(500).json({ message: 'Email sending failed.', error: error.message });

    }
    console.log('Email sent: ' + info.response);
    res.status(200).json({ message: 'Email sent successfully!' });
  });
});

module.exports = router;

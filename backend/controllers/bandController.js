// bandController.js

const Band = require('../models/Band');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Playlist = require('../models/Playlist');
const nodemailer = require('nodemailer');
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Firebase Admin SDK Configuration
const serviceAccount = require('../config/serviceAccountKey.json'); // Firebase servis hesabı JSON dosyası

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'votesong-50a22.appspot.com',
});

const bucket = admin.storage().bucket();

// Login function
const loginBand = async (req, res) => {
  const { band_email, band_password } = req.body;

  try {
    const band = await Band.findOne({ band_email });
    if (!band) {
      return res.status(400).json({ message: 'Band not found' });
    }

    const isMatch = await bcrypt.compare(band_password, band.band_password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: band._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({
      token,
      is_verified: band.is_verified,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Register function
const registerBand = async (req, res) => {
  const { band_name, band_email, band_password } = req.body;

  try {
    // Create band record
    const band = new Band({ band_name, band_email, band_password });
    await band.save();

    // Create verification token
    const verificationToken = jwt.sign({ band_email }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    // Send verification email
    await sendVerificationEmail(band_email, verificationToken);

    await sendRegistrationNotification(band_name, band_email); // Bildirim gönderimi


    // Create default playlist for the band
    const playlist = new Playlist({
      band_id: band._id,
      songs: [],
    });
    await playlist.save();

    res.status(201).json({ message: 'Band registered successfully!' });
  } catch (error) {
    res.status(400).json({ message: 'Error registering band', error });
  }
};

// Nodemailer configuration for sending verification emails
const transporter = nodemailer.createTransport({
  host: 'smtpout.secureserver.net',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendVerificationEmail = async (email, verificationToken) => {
  const frontendbaseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const verificationUrl = `${frontendbaseUrl}/verify/${verificationToken}`;

  const mailOptions = {
    from: '"VoteSong Support" <support@votesong.live>',
    to: email,
    subject: 'Verify Your Email Address',
    html: `<p>Please verify your email by clicking the link below:</p>
           <a href="${verificationUrl}">${verificationUrl}</a>`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
  }
};


const sendRegistrationNotification = async (band_name, band_email) => {
  const mailOptions = {
    from: '"VoteSong Support" <support@votesong.live>',
    to: 'support@votesong.live', // Destek ekibine e-posta gönderilecek
    subject: 'New Band Registration',
    text: `A new band has registered:\n\nName: ${band_name}\nEmail: ${band_email}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Registration notification email sent successfully.');
  } catch (error) {
    console.error('Error sending registration notification:', error);
  }
};




// Upload band image function with Firebase Admin SDK
const uploadBandImage = async (req, res) => {
  const bandId = req.band_id;
  const file = req.files ? req.files.band_image : null;

  if (!file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    const fileName = `band_images/${Date.now()}_${file.name}`;
    const blob = bucket.file(fileName);
    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });
  
    blobStream.on('error', (err) => {
      console.error('Error uploading file:', err);
      return res.status(500).json({ message: 'Failed to upload file', error: err.message });
    });
  
    blobStream.on('finish', async () => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
      await Band.findByIdAndUpdate(bandId, { band_image: publicUrl });
      return res.status(200).json({ message: 'Image uploaded successfully', imageUrl: publicUrl });
    });
  
    blobStream.end(file.data);
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ message: 'Error uploading to Firebase', error: error.message });
  }
};

// Get band profile
const getBandProfile = async (req, res) => {
  const bandId = req.band_id;
  try {
    const band = await Band.findById(bandId).select('band_name band_email band_image'); // band_email eklendi
    if (!band) {
      return res.status(404).json({ message: 'Band not found' });
    }
    res.status(200).json({ band });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching band profile', error });
  }
};

// Update band profile function
const updateBandProfile = async (req, res) => {
  const bandId = req.band_id;
  const { band_name, band_email, band_password, band_image } = req.body; // band_image eklenmeli

  try {
    const updateData = {};
    if (band_name) updateData.band_name = band_name;
    if (band_email) updateData.band_email = band_email;
    if (band_password) {
      const salt = await bcrypt.genSalt(10);
      updateData.band_password = await bcrypt.hash(band_password, salt);
    }

    if (band_image) updateData.band_image = band_image; // band_image eklenmeli


    const band = await Band.findByIdAndUpdate(bandId, updateData, { new: true });
    if (!band) {
      return res.status(404).json({ message: 'Band not found' });
    }
    res.status(200).json({ band });
  } catch (error) {
    res.status(500).json({ message: 'Error updating band profile', error });
  }
};

module.exports = { registerBand, loginBand, uploadBandImage, getBandProfile, updateBandProfile };

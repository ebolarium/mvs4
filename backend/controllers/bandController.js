// bandController.js

const Band = require('../models/Band');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Playlist = require('../models/Playlist');
const nodemailer = require('nodemailer');
const { initializeApp } = require("firebase/app");
const { getStorage, ref, uploadBytes, getDownloadURL } = require("firebase/storage");
const fs = require('fs');

// Firebase SDK Configuration (without .env)
const firebaseConfig = {
  apiKey: "AIzaSyBafFSa_fM47WlepENcL_qZpED0b4G9w3w",
  authDomain: "votesong-50a22.firebaseapp.com",
  projectId: "votesong-50a22",
  storageBucket: "votesong-50a22.appspot.com",
  messagingSenderId: "731744813937",
  appId: "1:731744813937:web:b9bc94b7b42378ea43acd0",
  measurementId: "G-2ET6CP37CH"
};

// Firebase Initialization
const firebaseApp = initializeApp(firebaseConfig);
const storage = getStorage(firebaseApp);

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
  secure: true, // SSL kullanılıyor
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
    console.log('Verification email sent to:', email);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

// Upload band image function with Firebase without Multer
const uploadBandImage = async (req, res) => {
  const bandId = req.band_id;
  const file = req.files ? req.files.band_image : null;
  if (!file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const tempPath = `./uploads/${file.name}`;
  fs.writeFile(tempPath, file.data, async (err) => {
    if (err) {
      console.error('Error writing file:', err);
      return res.status(500).json({ message: 'Error saving file' });
    }

    try {
      const storageRef = ref(storage, `band_images/${bandId}_${file.name}`);
      const metadata = {
        contentType: file.mimetype,
      };
      await uploadBytes(storageRef, fs.readFileSync(tempPath), metadata);

      const downloadURL = await getDownloadURL(storageRef);
      await Band.findByIdAndUpdate(bandId, { band_image: downloadURL });

      res.status(200).json({ message: 'Image uploaded successfully', imageUrl: downloadURL });

      fs.unlink(tempPath, (unlinkErr) => {
        if (unlinkErr) console.error('Error deleting temp file:', unlinkErr);
      });
    } catch (error) {
      console.error('Error uploading to Firebase:', error);
      res.status(500).json({ message: 'Error uploading to Firebase' });
    }
  });
};

// Get band profile
const getBandProfile = async (req, res) => {
  const bandId = req.band_id;
  try {
    const band = await Band.findById(bandId).select('band_name band_image');
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
  const { band_name, band_email, band_password } = req.body;

  try {
    const updateData = {};
    if (band_name) updateData.band_name = band_name;
    if (band_email) updateData.band_email = band_email;
    if (band_password) {
      const salt = await bcrypt.genSalt(10);
      updateData.band_password = await bcrypt.hash(band_password, salt);
    }

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

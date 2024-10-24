// bandController.js

const Band = require('../models/Band');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Playlist = require('../models/Playlist');
const multer = require('multer');
const path = require('path');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

require('dotenv').config();


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

 // is_verified alanını yanıt olarak döndürüyoruz
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
    const band = new Band({ band_name,
      band_email,
      band_password,
    });

    await band.save();


    // Doğrulama token'ı oluştur
    const verificationToken = jwt.sign({ band_email }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

      // E-posta gönder
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


const transporter = nodemailer.createTransport({
  host: 'smtpout.secureserver.net',
  port: 465,
  secure: true, // SSL kullanılıyor
  auth: {
    user: process.env.EMAIL_USER, // .env dosyasından kullanıcı adı
    pass: process.env.EMAIL_PASSWORD, // Şifrenizi .env dosyanızdan alın
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



const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Folder to store uploaded images
  },
  filename: function (req, file, cb) {
    const bandId = req.band_id;
    const ext = path.extname(file.originalname);
    cb(null, `band_${bandId}${ext}`);
  },
});

const upload = multer({ storage: storage });

// Upload band image function
const uploadBandImage = [
  upload.single('band_image'),
  async (req, res) => {
    const bandId = req.band_id;
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const imageUrl = `/uploads/${req.file.filename}`;

      // Update the band's image URL in the database
      await Band.findByIdAndUpdate(bandId, { band_image: imageUrl });

      res.status(200).json({ message: 'Image uploaded successfully', imageUrl });
    } catch (error) {
      console.error('Error uploading band image:', error);
      res.status(500).json({ message: error.message });
    }
  },
];

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


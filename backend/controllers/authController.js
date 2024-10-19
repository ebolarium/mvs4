// Bu dosya, kullanıcı kayıt ve giriş işlemlerini yönetir.
// Kayıt ve giriş için fonksiyonlar içerir.

const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Kullanıcı kayıt fonksiyonu.
// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { email, password, bandName } = req.body;

    // Kullanıcı zaten var mı kontrol et.
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'This email address is already in use.' });
    }

    // Şifreyi hashle.
    const hashedPassword = await bcrypt.hash(password, 10);

    // Yeni kullanıcı oluştur.
    user = new User({
      email,
      password: hashedPassword,
      bandName,
    });

    await user.save();

    // JWT token oluştur.
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '10h',
    });

    res.status(201).json({ token, userId: user._id });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Kullanıcı giriş fonksiyonu.
// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kullanıcı var mı kontrol et.
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // Şifre doğru mu kontrol et.
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // JWT token oluştur.
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '10h',
    });

    res.status(200).json({ token, userId: user._id });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
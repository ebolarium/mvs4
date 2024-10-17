// Bu dosya, kimlik doğrulama ile ilgili API rotalarını tanımlar.

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Kayıt rotası.
// POST /api/auth/register
router.post('/register', authController.register);

// Giriş rotası.
// POST /api/auth/login
router.post('/login', authController.login);

module.exports = router;
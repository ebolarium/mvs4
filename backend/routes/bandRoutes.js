const express = require('express');
const { registerBand, loginBand, uploadBandImage, getBandProfile } = require('../controllers/bandController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();


router.post('/register', registerBand);
router.post('/login', loginBand); // Login rotası eklendi
router.post('/upload-image', protect, uploadBandImage);
router.get('/profile', protect, getBandProfile);


module.exports = router;

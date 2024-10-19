// routes/songRoutes.js

const express = require('express');
const {
  addSong,
  deleteSong,
  getSongs,
  voteSong,
  markAsPlayed,
  updateSong, // Burada updateSong'u ekledik
} = require('../controllers/songController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Add a song (protected)
router.post('/add', protect, addSong);

// Delete a song (protected)
router.delete('/delete/:id', protect, deleteSong);

// Get songs (protected)
router.get('/', protect, getSongs);

// Update a song (protected)
router.put('/update/:id', protect, updateSong); // Yeni route eklendi


// Vote for a song
router.put('/vote/:id', voteSong);

// Mark a song as played (protected)
router.put('/markAsPlayed/:songId', protect, markAsPlayed);

module.exports = router;

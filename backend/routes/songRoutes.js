// routes/songRoutes.js

const express = require('express');
const {
  addSong,
  deleteSong,
  getSongs,
  voteSong,
  markAsPlayed,
} = require('../controllers/songController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Add a song (protected)
router.post('/add', protect, addSong);

// Delete a song (protected)
router.delete('/delete/:id', protect, deleteSong);

// Get songs (protected)
router.get('/', protect, getSongs);

// Vote for a song
router.put('/vote/:id', voteSong);

// Mark a song as played (protected)
router.put('/markAsPlayed/:songId', protect, markAsPlayed);

module.exports = router;

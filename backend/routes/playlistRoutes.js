// routes/playlistRoutes.js

const express = require('express');
const {
  createPlaylist,
  updatePlaylistSongs,
  publishPlaylist,
  getPlaylist,
  getCurrentPlaylist,
  getPublishedPlaylist,
} = require('../controllers/playlistController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// Specific routes before parameterized routes
router.post('/create', protect, createPlaylist);
router.put('/update-songs', protect, updatePlaylistSongs);
router.put('/publish', protect, publishPlaylist);
router.get('/current', protect, getCurrentPlaylist);
router.get('/', protect, getPlaylist);
router.get('/published/:id', getPublishedPlaylist); // Adjusted route

module.exports = router;

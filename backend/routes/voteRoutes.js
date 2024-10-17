// Bu dosya, oy verme ile ilgili API rotalarını tanımlar.

const express = require('express');
const router = express.Router();
const voteController = require('../controllers/voteController');

// Oy verme rotası.
// POST /api/votes
router.post('/', voteController.vote);

module.exports = router;
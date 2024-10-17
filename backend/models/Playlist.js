// models/Playlist.js

const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
  band_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Band',
    required: true,
  },
  songs: [
    {
      song_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Song',
        required: true,
      },
      votecount: {
        type: Number,
        default: 0,
      },
      played: {  // Add this field
        type: Boolean,
        default: false,
      },
    },
  ],
  published: {
    type: Boolean,
    default: false,
  },
  url: {
    type: String,
    default: null,
  },
});

module.exports = mongoose.model('Playlist', playlistSchema);

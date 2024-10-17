// models/Song.js

const mongoose = require('mongoose');

const songSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    artist: {
      type: String,
      required: true,
    },
    band_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Band',
      required: true,
    },
    totalvotecount: {
      type: Number,
      default: 0,
    },
    playcount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Song', songSchema);

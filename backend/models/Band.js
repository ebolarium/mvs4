const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const bandSchema = new mongoose.Schema({
  band_name: {
    type: String,
    required: true
  },
  band_email: {
    type: String,
    required: true,
    unique: true
  },
  band_password: {
    type: String,
    required: true
  },
  is_verified: {
    type: Boolean,
    default: false,
  },
  is_premium: { 
    type: Boolean,
    default: false,
  },
  band_song_count: {
    type: Number,
    default: 0
  },
  band_playlist_count: {
    type: Number,
    default: 0
  },
  band_image: {
    type: String,
    default: '', // URL or path to the band's image
  },
  band_gig_count: {
    type: Number,
    default: 0
  }
});

// Şifreyi kaydetmeden önce şifreyi hashle
bandSchema.pre('save', async function (next) {
  if (!this.isModified('band_password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.band_password = await bcrypt.hash(this.band_password, salt);
  next();
});

module.exports = mongoose.model('Band', bandSchema);

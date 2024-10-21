// tools/updateSongs.js

const mongoose = require('mongoose');
const Song = require('./models/Song'); // Şarkı modelini import edin
require('dotenv').config();


// Veritabanına bağlanın
mongoose.connect(process.env.MONGO_URI, {
});

const updateSongs = async () => {
  try {
    // Key alanı eksik olan şarkıları bulun
    const songsToUpdate = await Song.updateMany(
      { key: { $exists: false } }, // Key alanı olmayan kayıtları bul
      { $set: { key: 'Tune' } } // Varsayılan olarak "C" tonu atayın
    );

    console.log(`${songsToUpdate.modifiedCount} songs updated.`);
    mongoose.connection.close();
  } catch (error) {
    console.error('Error updating songs:', error);
    mongoose.connection.close();
  }
};

updateSongs();

const mongoose = require('mongoose');
const xlsx = require('xlsx');
require('dotenv').config();

// MongoDB bağlantısı
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Veritabanına bağlanıldı'))
  .catch((error) => console.error('Veritabanı bağlantı hatası:', error));

// Şarkı şeması
const songSchema = new mongoose.Schema({
  title: String,
  artist: String,
  band_id: mongoose.Types.ObjectId,
  totalvotecount: { type: Number, default: 0 },
  playcount: { type: Number, default: 0 },
}, { timestamps: true });

const Song = mongoose.model('Song', songSchema);

// Excel'den veri yükleme fonksiyonu
const uploadSongsFromExcel = async (filePath) => {
  try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const formattedData = data.map((song) => ({
      title: song.title,
      artist: song.artist,
      band_id: new mongoose.Types.ObjectId(song.band_id), // Sorunu çözen satır
      totalvotecount: song.totalvotecount || 0,
      playcount: song.playcount || 0,
    }));

    await Song.insertMany(formattedData);
    console.log('Şarkılar başarıyla yüklendi!');
  } catch (error) {
    console.error('Hata:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Excel dosyasını buraya ekleyin
uploadSongsFromExcel('./songs.xlsx');

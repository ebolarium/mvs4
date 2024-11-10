// Bu dosya, oy verme işlemlerini yönetir.
// Oy verme ve oy sayılarının güncellenmesiyle ilgili fonksiyonları içerir.

const Playlist = require('../models/Playlist');
const Song = require('../models/Song');

// Oy verme fonksiyonu.
// POST /api/votes
exports.vote = async (req, res) => {
  try {
    const { playlistId, songId, uuid } = req.body;

    // Playlisti bul.
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found.' });
    }

    // Şarkıyı bul.
    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({ message: 'Song not found.' });
    }

    // Anlık oy sayısını artır.
    const currentVotes = playlist.currentVoteCounts.get(songId) || 0;
    playlist.currentVoteCounts.set(songId, currentVotes + 1);

    // Şarkının toplam oy sayısını artır.
    song.totalVoteCount += 1;

    await playlist.save();
    await song.save();

    res.status(200).json({ message: 'Vote registered successfully.' });
  } catch (error) {
    res.status(500).json({ message: t('server_error') });
  }
};
// controllers/songController.js

const Playlist = require('../models/Playlist');
const Song = require('../models/Song');

// Add a new song
const addSong = async (req, res) => {
  const { title, artist } = req.body;
  const band_id = req.band_id;

  try {
    if (!band_id || !title || !artist) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const song = new Song({
      title,
      artist,
      band_id,
    });

    await song.save();
    res.status(201).json({ message: 'Song added successfully', song });
  } catch (error) {
    console.error('Error adding song:', error);
    res.status(500).json({ message: 'Error adding song', error });
  }
};

// Delete a song (prevent deletion if song is in a playlist)
const deleteSong = async (req, res) => {
  const { id } = req.params;
  const band_id = req.band_id;

  try {
    // Check if the song is part of any playlist
    const playlists = await Playlist.find({ band_id, 'songs.song_id': id });
    if (playlists.length > 0) {
      return res
        .status(400)
        .json({ message: 'Cannot delete song. It is part of a playlist.' });
    }

    const song = await Song.findByIdAndDelete(id);
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }

    res.json({ message: 'Song deleted successfully' });
  } catch (error) {
    console.error('Error deleting song:', error);
    res.status(500).json({ message: 'Error deleting song', error });
  }
};

// Get songs for the logged-in band
const getSongs = async (req, res) => {
  const band_id = req.band_id;

  try {
    const songs = await Song.find({ band_id });
    res.json({ songs });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching songs', error });
  }
};

// Vote for a song
const voteSong = async (req, res) => {
  const { id } = req.params; // Song ID
  const playlistId = req.body.playlistId;

  try {
    // Update votecount in the playlist
    await Playlist.updateOne(
      { _id: playlistId, 'songs.song_id': id },
      { $inc: { 'songs.$.votecount': 1 } }
    );

    // Update totalvotecount in the Song model
    await Song.findByIdAndUpdate(id, { $inc: { totalvotecount: 1 } });

    // Emit updated playlist to clients
    const io = req.app.get('io');
    if (io) {
      const updatedPlaylist = await Playlist.findById(playlistId)
        .populate('songs.song_id')
        .lean();
      io.to(playlistId).emit('playlistUpdated', updatedPlaylist.songs);
    }

    res.status(200).json({ message: 'Vote registered successfully' });
  } catch (error) {
    console.error('Error voting for song:', error);
    res.status(500).json({ message: 'Error voting for song', error });
  }
};

// Mark a song as played
const markAsPlayed = async (req, res) => {
  const { songId } = req.params;
  const bandId = req.band_id;

  try {
    const playlist = await Playlist.findOne({ band_id: bandId, published: true });
    if (!playlist) {
      return res.status(404).json({ message: 'Published playlist not found' });
    }

    const songInPlaylist = playlist.songs.find(
      (song) => song.song_id.toString() === songId
    );
    if (!songInPlaylist) {
      return res.status(404).json({ message: 'Song not found in playlist' });
    }

    songInPlaylist.played = true;
    await playlist.save();

    // Update the song's playcount
    await Song.findByIdAndUpdate(songId, { $inc: { playcount: 1 } });

    // Emit updated playlist to clients
    const io = req.app.get('io');
    if (io) {
      const updatedPlaylist = await Playlist.findById(playlist._id)
        .populate('songs.song_id')
        .lean();
      io.to(playlist._id.toString()).emit('playlistUpdated', updatedPlaylist.songs);
    }

    res.status(200).json({ message: 'Song marked as played' });
  } catch (error) {
    console.error('Error marking song as played:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// controllers/songController.js

const updateSong = async (req, res) => {
  const { title, artist } = req.body;
  const { id } = req.params;

  try {
    const updatedSong = await Song.findByIdAndUpdate(id, { title, artist }, { new: true });
    if (!updatedSong) return res.status(404).json({ message: 'Song not found' });

    res.json({ message: 'Song updated successfully', song: updatedSong });
  } catch (error) {
    console.error('Error updating song:', error);
    res.status(500).json({ message: 'Error updating song', error });
  }
};

module.exports = { addSong, deleteSong, getSongs, voteSong, markAsPlayed, updateSong };



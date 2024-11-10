// controllers/playlistController.js

const Playlist = require('../models/Playlist');
const Song = require('../models/Song');

// Create playlist function
const createPlaylist = async (req, res) => {
  const band_id = req.band_id;
  try {
    const existingPlaylist = await Playlist.findOne({ band_id });

    if (existingPlaylist) {
      return res.status(400).json({ message: 'Playlist already exists' });
    }

    const playlist = new Playlist({
      band_id,
    });

    await playlist.save();
    res.status(201).json({ message: 'Playlist created successfully', playlist });
  } catch (error) {
    console.error('Error creating playlist:', error);
    res.status(500).json({ message: 'Error creating playlist' });
  }
};

// Update playlist songs
const updatePlaylistSongs = async (req, res) => {
  const { song_id, action } = req.body;
  const band_id = req.band_id;
  const playlist = await Playlist.findOne({ band_id }).populate('songs.song_id', 'title artist key');

  if (!playlist) {
    return res.status(404).json({ message: 'Playlist not found' });
  }

  // Prevent adding/removing songs if playlist is published
  if (playlist.published) {
    return res.status(400).json({ message: 'Cannot modify songs while playlist is published' });
  }

  if (action === 'add') {
    // Add song to playlist
    const songInPlaylist = playlist.songs.find((song) => song.song_id._id.toString() === song_id);
    if (!songInPlaylist) {
      const song = await Song.findById(song_id);
      if (!song) {
        return res.status(404).json({ message: 'Song not found' });
      }
      playlist.songs.push({ song_id: song._id, votecount: 0 });
    }
  } else if (action === 'remove') {
    // Remove song from playlist
    playlist.songs = playlist.songs.filter((song) => song.song_id._id.toString() !== song_id);
  }

  await playlist.save();
  res.status(200).json({ message: 'Playlist updated successfully', playlist });
};

// Publish or unpublish playlist
const publishPlaylist = async (req, res) => {
  const { publish } = req.body;
  const band_id = req.band_id;
  const playlist = await Playlist.findOne({ band_id }).populate('songs.song_id', 'title artist');

  if (!playlist) {
    return res.status(404).json({ message: 'Playlist not found' });
  }

  // Prevent publishing an empty playlist
  if (publish && playlist.songs.length === 0) {
    return res.status(400).json({ message: 'Cannot publish an empty playlist' });
  }

  playlist.published = publish;

  if (publish) {
    // Ortama göre URL oluşturma
    const baseUrl = process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : 'http://localhost:3000';
    playlist.url = `${baseUrl}/playlist/${playlist._id}`;
  } else {
    playlist.songs.forEach((song) => {
      song.votecount = 0;
      song.played = false;
    });
    playlist.url = null;
  }

  await playlist.save();

  // Emit playlist status change
  const io = req.app.get('io');
  if (io && playlist._id) {
    io.to(playlist._id.toString()).emit('playlistStatusChanged', {
      published: publish,
      playlist,
    });
  }

  res.status(200).json({ message: publish ? 'Playlist published' : 'Playlist unpublished', playlist });
};

// Get playlist
const getPlaylist = async (req, res) => {
  const band_id = req.band_id;
  try {
    const playlist = await Playlist.findOne({ band_id }).populate('songs.song_id', 'title artist key');
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }
    res.status(200).json({ playlist });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching playlist', error });
  }
};

// Get current playlist
const getCurrentPlaylist = async (req, res) => {
  try {
    const bandId = req.band_id;

    const playlist = await Playlist.findOne({ band_id: bandId, published: true })
      .populate('songs.song_id')
      .lean();

    if (!playlist) {
      return res.status(404).json({ message: 'No current playlist found' });
    }

    res.status(200).json({ playlist });
  } catch (error) {
    console.error('Error fetching current playlist:', error);
    res.status(500).json({ message: t('server_error') });
  }
};

// Get published playlist by ID
const getPublishedPlaylist = async (req, res) => {
  const { id } = req.params;
  try {
    const playlist = await Playlist.findById(id)
    .populate('songs.song_id', 'title artist') // 'key' alanını ekledik
    .populate('band_id', 'band_name band_image'); // Ensure band_image is included

    if (!playlist || !playlist.published) {
      return res.status(404).json({ message: 'No playlist available' });
    }

    res.status(200).json(playlist);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching published playlist', error });
  }
};

module.exports = {
  createPlaylist,
  updatePlaylistSongs,
  publishPlaylist,
  getPlaylist,
  getCurrentPlaylist,
  getPublishedPlaylist,
};

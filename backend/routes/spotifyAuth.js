//spotifyAuth.js

const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();
require('dotenv').config();





const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

// Access Token Almak İçin Endpoint
router.post('/token', async (req, res) => {
  const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    const data = await response.json();
    //console.log('Spotify Token Yanıtı:', data); // Hata olup olmadığını kontrol etmek için log ekleyin

    if (response.ok) {
      res.json({ access_token: data.access_token });
    } else {
      res.status(response.status).json({ error: data });
      console.error('Access token alma sırasında hata:', data);
    }
  } catch (error) {
    console.error('Access Token alma sırasında beklenmeyen hata:', error);
    res.status(500).json({ error: 'Access Token alma sırasında hata oluştu' });
  }
});

module.exports = router;

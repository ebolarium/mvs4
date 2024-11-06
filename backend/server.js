// server.js

const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bandRoutes = require('./routes/bandRoutes');
const songRoutes = require('./routes/songRoutes');
const playlistRoutes = require('./routes/playlistRoutes');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const i18n = require('i18n');
const fs = require('fs');
const spotifyAuthRoutes = require('./routes/spotifyAuth');
const emailRoute = require('./routes/emailRoute');
const bodyParser = require('body-parser');
const CryptoJS = require('crypto-js');
const Band = require('./models/Band'); // Band modelini ekledik
const fetch = require('node-fetch'); // node-fetch paketini ekledik


dotenv.config(); // Environment variables'ları yükleyin

const app = express();
const server = http.createServer(app);

// Paddle Webhook Secret Key
const WEBHOOK_SECRET_KEY = 'pdl_ntfset_01jbeg11et89t7579610fhxn5z_YdkhEaae7TAP/gl/GwAkloZGNFFSWf1+';
const PADDLE_API_KEY = 'test_605824494b6e720104d54646e1c'; // Paddle API anahtarınızı buraya yazın


// i18n configuration
i18n.configure({
  locales: ['en', 'tr'],
  directory: path.join(__dirname, 'locales'),
  defaultLocale: 'en',
  objectNotation: true,
});
app.use(i18n.init);

// CORS Middleware
app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'https://votesong.live',
      'https://mvs4.onrender.com',
      'https://firebasestorage.googleapis.com',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));











// Paddle Signature Doğrulama Fonksiyonu
function verifyPaddleSignature(requestBody, signature) {
  const { ts, receivedH1 } = extractHeaderElements(signature);
  const payload = buildPayload(ts, requestBody);
  
  const computedH1 = hashPayload(payload, WEBHOOK_SECRET_KEY);

  if (receivedH1 !== computedH1) {
    throw new Error('Invalid paddle signature');
  }
}

// Header elemanlarını çıkar
function extractHeaderElements(header) {
  const parts = header.split(';');
  if (parts.length !== 2) {
    throw new Error('Incompatible header format');
  }
  const tsPart = parts.find((part) => part.startsWith('ts='));
  const h1Part = parts.find((part) => part.startsWith('h1='));

  if (!tsPart || !h1Part) {
    throw new Error('Missing ts or h1 in header');
  }

  const ts = tsPart.split('=')[1];
  const receivedH1 = h1Part.split('=')[1];

  return { ts, receivedH1 };
}

// Payload oluştur
function buildPayload(ts, requestBody) {
  return `${ts}:${requestBody.toString('utf8')}`;
}

// HMAC-SHA256 kullanarak payload'ı hashle (crypto-js ile)
function hashPayload(payload, secret) {
  const hmac = CryptoJS.HmacSHA256(payload, secret);
  return hmac.toString(CryptoJS.enc.Hex);
}

// Normal middleware'leri Paddle webhook'tan sonra ekliyoruz
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());



// Routes
app.use('/api/bands', bandRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/playlist', playlistRoutes);
app.use('/api/spotify', spotifyAuthRoutes);
app.use('/api', emailRoute); // Include the email route

// Serve frontend files
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Serve uploaded images
app.use('/uploads', cors(), express.static(path.join(__dirname, 'uploads')));

// Wildcard route for frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.set('io', io);

// Socket.io connections
io.on('connection', (socket) => {
  socket.on('joinPlaylist', (playlistId) => {
    socket.join(playlistId);
  });

  socket.on('leavePlaylist', (playlistId) => {
    socket.leave(playlistId);
  });

  // Handle songRequested event
  socket.on('songRequested', (song, playlistId) => {
    socket.to(playlistId).emit('newSongRequest', song);
  });

  socket.on('disconnect', () => {});
});

app.post('/paddle/cancel-subscription', async (req, res) => {
  const bandId = req.body.bandId;
  if (!bandId) {
    return res.status(400).json({ message: 'Band ID gerekli.' });
  }
  try {
    // Band'i veritabanından bul
    const band = await Band.findById(bandId);
    if (!band) {
      return res.status(404).json({ message: 'Band bulunamadı.' });
    }
    // Band'in subscriptionId'sini al
    const subscriptionId = band.subscription_id;
    if (!subscriptionId) {
      return res.status(400).json({ message: 'Bu band ile ilişkili bir abonelik bulunamadı.' });
    }
    // Paddle API'ye istek göndererek aboneliği iptal et
    const PADDLE_API_URL = 'https://api.paddle.com/subscriptions';
    const subscriptionCancelUrl = `${PADDLE_API_URL}/${subscriptionId}/cancel`;

    // İstek gövdesini hazırla
    const requestBody = {
      "effective_from": "now" // veya "next_billing_period" kullanabilirsiniz
    };

    // Başlıkları hazırla
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${PADDLE_API_KEY}`
    };

    // Paddle API'ye isteği gönder
    const response = await fetch(subscriptionCancelUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(requestBody)
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Paddle API Hatası:', result);
      return res.status(500).json({ message: 'Abonelik iptal edilemedi.', error: result });
    }

    // Band'in is_premium durumunu güncelle
    band.is_premium = false;
    await band.save();

    return res.json({ message: 'Abonelik başarıyla iptal edildi.' });

  } catch (error) {
    console.error('Abonelik iptal edilirken hata oluştu:', error);
    return res.status(500).json({ message: 'Sunucu hatası.' });
  }
});







const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

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
const CryptoJS = require('crypto-js');
const Band = require('./models/Band');
const fetch = require('node-fetch');
const querystring = require('querystring');
const jwt = require('jsonwebtoken');

dotenv.config(); // Environment variables'ları yükleyin

const app = express();
const server = http.createServer(app);

// Paddle Credentials
const WEBHOOK_SECRET_KEY = 'pdl_ntfset_01jbeg11et89t7579610fhxn5z_YdkhEaae7TAP/gl/GwAkloZGNFFSWf1+';
const PADDLE_VENDOR_ID = '24248'; // Paddle Vendor ID
const PADDLE_VENDOR_AUTH_CODE = '0ca5518f6c92283bb2600c0e9e2a967376935e0566a4676a19'; // Paddle Auth Code
const JWT_SECRET_KEY = 'ad869542aa1f608bf751614147486d8d6ffcfd7d9c4a14eba563653e3ef59d3dfc81c119a722c95e03d2bffbebd7a50d5c295907924903f779cb34a02686cefe';

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

// *** PADDLE WEBHOOK ROTASINI VE RAW BODY MIDDLEWARE'İNİ MIDDLEWARE'LERDEN ÖNCE EKLEYİN ***

// Raw body parsing middleware for Paddle webhook
app.use('/paddle/webhook', express.raw({ type: '*/*' }));

// Paddle Signature Doğrulama Fonksiyonu
function verifyPaddleSignature(rawBody, signature) {
  const { ts, receivedH1 } = extractHeaderElements(signature);
  const payload = buildPayload(ts, rawBody);

  const computedH1 = hashPayload(payload, WEBHOOK_SECRET_KEY);

  if (receivedH1 !== computedH1) {
    throw new Error('Invalid paddle signature');
  }
}

// Header elemanlarını çıkar
function extractHeaderElements(header) {
  const parts = header.split(',');
  if (parts.length !== 2) {
    throw new Error('Incompatible header format');
  }
  const tsPart = parts.find((part) => part.trim().startsWith('ts='));
  const h1Part = parts.find((part) => part.trim().startsWith('h1='));

  if (!tsPart || !h1Part) {
    throw new Error('Missing ts or h1 in header');
  }

  const ts = tsPart.split('=')[1];
  const receivedH1 = h1Part.split('=')[1];

  return { ts, receivedH1 };
}

// Payload oluştur
function buildPayload(ts, rawBody) {
  return `${ts}:${rawBody}`;
}

// HMAC-SHA256 kullanarak payload'ı hashle (crypto-js ile)
function hashPayload(payload, secret) {
  const hmac = CryptoJS.HmacSHA256(payload, secret);
  return hmac.toString(CryptoJS.enc.Hex);
}

// Paddle Webhook Route
app.post('/paddle/webhook', async (req, res) => {
  try {
    // Webhook imzasını doğrulayın
    const signature = req.headers['paddle-signature'];
    if (!signature) {
      console.error('Paddle signature missing');
      return res.status(400).send('Paddle signature missing');
    }

    // Ham isteği alın
    const rawBody = req.body.toString('utf8');

    // İmzayı doğrulayın
    verifyPaddleSignature(rawBody, signature);

    // İstek gövdesini parse edin
    const parsedBody = querystring.parse(rawBody);

    const alertName = parsedBody.alert_name;

    if (alertName === 'subscription_cancelled') {
      const subscriptionId = parsedBody.subscription_id;

      // Bu subscription_id'ye sahip band'i bulun
      const band = await Band.findOne({ subscription_id: subscriptionId });

      if (band) {
        band.is_premium = false;
        await band.save();
        console.log(`Abonelik ${subscriptionId} iptal edildi. Band ${band.band_name} güncellendi.`);
      } else {
        console.error(`Bu subscription ID ile eşleşen band bulunamadı: ${subscriptionId}`);
      }
    }

    // Diğer webhook event'lerini burada işleyebilirsiniz

    res.status(200).send('OK');
  } catch (error) {
    console.error('Paddle webhook işlenirken hata oluştu:', error);
    res.status(500).send('Internal Server Error');
  }
});

// *** NORMAL MIDDLEWARE'LERİ BURADA EKLEYİN ***
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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

// Abonelik iptali için route
app.post('/paddle/cancel-subscription', async (req, res) => {
  try {
    // Token'dan bandId'yi alın
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.error('Authorization header missing');
      return res.status(401).json({ message: 'Authorization header missing' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET_KEY); // JWT oluştururken kullandığınız anahtarı kullanın

    const bandId = decoded.id;

    if (!bandId) {
      console.error('Band ID missing in token');
      return res.status(400).json({ message: 'Band ID missing' });
    }

    // Band'i veritabanından bul
    const band = await Band.findById(bandId);
    if (!band) {
      console.error('Band not found');
      return res.status(404).json({ message: 'Band not found' });
    }

    // Band'in subscriptionId'sini al
    const subscriptionId = band.subscription_id;
    if (!subscriptionId) {
      console.error('No subscription associated with this band');
      return res.status(400).json({ message: 'No subscription associated with this band' });
    }

    // Paddle API'ye istek göndererek aboneliği iptal et
    const PADDLE_API_URL = 'https://vendors.paddle.com/api/2.0/subscription/users_cancel';

    // İstek gövdesini hazırla
    const requestBody = {
      vendor_id: PADDLE_VENDOR_ID,
      vendor_auth_code: PADDLE_VENDOR_AUTH_CODE,
      subscription_id: subscriptionId
    };

    // Paddle API'ye isteği gönder
    const response = await fetch(PADDLE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: querystring.stringify(requestBody)
    });

    const result = await response.json();

    if (!result.success) {
      console.error('Paddle API Hatası:', result);
      return res.status(500).json({ message: 'Abonelik iptal edilemedi.', error: result });
    }

    // Paddle abonelik iptalini kabul etti
    // is_premium flagini burada güncellemiyoruz
    // Bunun yerine, Paddle'dan gelen webhook abonelik iptalini onaylayınca güncelliyoruz

    return res.json({ message: 'Abonelik iptali başlatıldı' });
  } catch (error) {
    console.error('Abonelik iptali sırasında hata oluştu:', error);
    return res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

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
const { Paddle, EventName } = require('@paddle/paddle-node-sdk');
const { Readable } = require('stream');
const CryptoJS = require('crypto-js');





const Band = require('./models/Band'); // Import the Band model

const app = express();
const server = http.createServer(app);

dotenv.config();

// i18n configuration
i18n.configure({
  locales: ['en', 'tr'],
  directory: path.join(__dirname, 'locales'),
  defaultLocale: 'en',
  objectNotation: true,
});

// Use i18n middleware
app.use(i18n.init);

// Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false })); // For handling URL-encoded data


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

// Routes
app.use('/api/bands', bandRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/playlist', playlistRoutes);
app.use('/api/spotify', spotifyAuthRoutes);
app.use('/api', emailRoute); // Include the email route










// Paddle Webhook Endpoint
app.post('/paddle/webhook', express.raw({ type: '*/*' }), async (req, res) => {
  const signature = req.headers['paddle-signature'] || req.headers['Paddle-Signature'];

  if (!signature) {
    console.error('Paddle-Signature header not found');
    return res.status(400).send('Invalid signature');
  }

  try {
    if (!Buffer.isBuffer(req.body)) {
      console.error('Body is not a Buffer');
      return res.status(400).send('Invalid body type');
    }

    // Verify the Paddle Signature
    verifyPaddleSignature(req.body, signature);

    // Process the webhook
    const eventData = JSON.parse(req.body.toString('utf8'));

    switch (eventData.event_type) {
      case 'subscription.created':
        console.log(`Subscription ${eventData.data.id} was created`);
        break;
      case 'subscription.updated':
        console.log(`Subscription ${eventData.data.id} was updated`);
        break;
      default:
        console.log('Unhandled webhook event type:', eventData.event_type);
    }

    res.status(200).send('Webhook received');
  } catch (e) {
    console.error('Error processing webhook:', e.message);
    res.status(400).send('Invalid signature');
  }
});

// Paddle Signature Verification Functions
function verifyPaddleSignature(requestBody, signature) {
  const { ts, receivedH1 } = extractHeaderElements(signature);
  const payload = buildPayload(ts, requestBody);
  const computedH1 = hashPayload(payload, process.env.WEBHOOK_SECRET_KEY);

  if (receivedH1 !== computedH1) {
    throw new Error('Invalid paddle signature');
  }
}

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

function buildPayload(ts, requestBody) {
  return `${ts}:${requestBody.toString('utf8')}`;
}

function hashPayload(payload, secret) {
  const hmac = CryptoJS.HmacSHA256(payload, secret);
  return hmac.toString(CryptoJS.enc.Hex);
}





















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
  //console.log('A user connected:', socket.id);

  socket.on('joinPlaylist', (playlistId) => {
    //console.log('User joined playlist room with ID:', playlistId);
    socket.join(playlistId);
  });

  socket.on('leavePlaylist', (playlistId) => {
    //console.log('User left playlist room with ID:', playlistId);
    socket.leave(playlistId);
  });

  // Handle songRequested event
  socket.on('songRequested', (song, playlistId) => {
    socket.to(playlistId).emit('newSongRequest', song);
  });

  socket.on('disconnect', () => {
    //console.log('A user disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

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
const bodyParser = require('body-parser');
const crypto = require('crypto');
const spotifyAuthRoutes = require('./routes/spotifyAuth');
const emailRoute = require('./routes/emailRoute'); // If in a separate routes folder

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
app.use(bodyParser.urlencoded({ extended: true })); // For handling URL-encoded data

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
app.post('/paddle/webhook', (req, res) => {
  const { p_signature, ...fields } = req.body;

  // Convert fields to correct data types
  Object.keys(fields).forEach((field) => {
    if (fields[field] === 'true') {
      fields[field] = true;
    } else if (fields[field] === 'false') {
      fields[field] = false;
    } else if (!isNaN(fields[field])) {
      if (fields[field].includes('.')) {
        fields[field] = parseFloat(fields[field]);
      } else {
        fields[field] = parseInt(fields[field], 10);
      }
    }
  });

  // Sort fields alphabetically
  const sortedKeys = Object.keys(fields).sort();
  const sorted = {};
  sortedKeys.forEach((key) => {
    sorted[key] = fields[key];
  });

  // Serialize the sorted object to a string
  const serialized = sortedKeys
    .map((key) => {
      if (typeof sorted[key] === 'object') {
        return JSON.stringify(sorted[key]);
      }
      return sorted[key];
    })
    .join('');

  // Prepare the public key
  let publicKey = process.env.PADDLE_PUBLIC_KEY.replace(/\\n/g, '\n');
  publicKey = `-----BEGIN PUBLIC KEY-----\n${publicKey}\n-----END PUBLIC KEY-----`;

  // Verify the signature
  const verifier = crypto.createVerify('RSA-SHA1');
  verifier.update(serialized);
  const isValid = verifier.verify(publicKey, p_signature, 'base64');

  if (isValid) {
    const alertName = fields.alert_name;

    switch (alertName) {
      case 'subscription_created':
        // Update user's subscription status in your database
        break;
      case 'subscription_cancelled':
        // Update user's subscription status in your database
        break;
      // Handle other events as needed
      default:
        break;
    }

    res.sendStatus(200);
  } else {
    console.error('Invalid Paddle webhook signature');
    res.sendStatus(403); // Forbidden
  }
});

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

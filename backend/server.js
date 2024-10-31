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
const productsProxy = require('./routes/productsProxy');

const bodyParser = require('body-parser');
const crypto = require('crypto');
const spotifyAuthRoutes = require('./routes/spotifyAuth');
const emailRoute = require('./routes/emailRoute');

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
app.use('/api', productsProxy);




const querystring = require('querystring'); // Add this at the top

// Paddle Webhook Endpoint
app.post('/paddle/webhook', async (req, res) => {
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

  // Serialize the sorted object to query string format without URL encoding
  const serialized = querystring.stringify(sorted, '&', '=', {
    encodeURIComponent: (str) => str,
  });

  // Prepare the public key
  let publicKey = `-----BEGIN PUBLIC KEY-----
MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA4cr8bsSkSWHf4l/anMa6
Kca3ldITgBKv0yWJvK/o0jJHUYF3itSaLSJHH+XE/KieE99MqgvMIDLb69LhiK0i
77Rz85asEjawP7woDkQmq6qi1qBV28rXJiTMGuzshnp6Y5lodgM8vEoEXrJLWyPZ
tkjFZbr7bs+5HiJxdEaRmbqJ585jmTLielMuZUPH4hyH9qFjzADJDiaSsSaRuhBj
81P92XWOoq9HRZgWAkotowx14pTTtmu4USAznJwWkVVSSnSswzlP7qYFhxrKI1c8
9SflSIxl06CPPmxF5wgaJoALZyUfA7SFAPD4fnVkBYnMoCBjeFuZNhD4o9zsHfnh
1UlsiypwayKh4tV0tuBcljQYpzgXTQei6AntFLsV/zWPMchqE/1mPyy2g2Ljt8rC
oC8vS5XXKJkLrpC4lvAep57+XiVCGc/wSOSWVXeL/ssOfYtysB8HHQic9f0aPWzm
lNT4DuZ366t1PMFcxSs+R2EqRSuwHDzVj6Aqo0Ok0osdP+wP+u1hS3+Cied4C5Bo
XdBZ2BDajxvW9UA0kqEtJ+b2xgNkViUSU6VIq/smJFMF3lhkRUZ9BQV3S1njvsqb
XhItJqwfXBfNMS9669K42oUtU8wGPnWGCVCdUV1F5/zJ2fXfcitfpT/FSybOSLaU
3v48COcsOJFKLP6bY4YlIjMCAwEAAQ==
-----END PUBLIC KEY-----`;

  // Verify the signature
  const verifier = crypto.createVerify('sha1');
  verifier.update(serialized);
  const isValid = verifier.verify(publicKey, Buffer.from(p_signature, 'base64'));

  if (isValid) {
    const alertName = fields.alert_name;
    const email = fields.email; // Customer's email from Paddle webhook

    try {
      // Find the band by email
      const band = await Band.findOne({ band_email: email });

      if (!band) {
        console.error(`Band with email ${email} not found tho.`);
        return res.sendStatus(200); // Respond 200 to Paddle
      }

      switch (alertName) {
        case 'subscription_created':
        case 'subscription_updated':
        case 'subscription_payment_succeeded':
          // Set is_premium to true
          band.is_premium = true;
          await band.save();
          console.log(`Band ${email} upgraded to premium.`);
          break;

        case 'subscription_cancelled':
        case 'subscription_payment_failed':
          // Set is_premium to false
          band.is_premium = false;
          await band.save();
          console.log(`Band ${email} downgraded from premium.`);
          break;

        default:
          console.log(`Unhandled alert: ${alertName}`);
          break;
      }

      res.sendStatus(200); // Respond 200 to Paddle
    } catch (error) {
      console.error('Error handling webhook:', error);
      res.sendStatus(500);
    }
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

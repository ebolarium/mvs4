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
import { Paddle, EventName } from '@paddle/paddle-node-sdk';



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



const paddle = new Paddle('0ca5518f6c92283bb2600c0e9e2a967376935e0566a4676a19'); // Sandbox ya da Production API anahtarını buraya ekleyin
app.use(express.raw({ type: 'application/json' }));

// Webhook endpoint
app.post('/paddle/webhook', (req, res) => {
  const signature = req.headers['paddle-signature'];

  if (!signature) {
    console.error('Paddle-Signature header not found');
    return res.status(400).send('Invalid signature');
  }

  const rawRequestBody = req.body.toString(); // Raw body buffer'ını string'e çeviriyoruz
  const secretKey = process.env['WEBHOOK_SECRET_KEY'] || 'pdl_ntfset_01jbeg11et89t7579610fhxn5z_YdkhEaae7TAP/gl/GwAkloZGNFFSWf1+';

  try {
    if (signature && rawRequestBody) {
      // Webhook'un geçerliliğini kontrol etmek ve doğrulamak için `unmarshal` fonksiyonunu kullanıyoruz
      const eventData = paddle.webhooks.unmarshal(rawRequestBody, secretKey, signature);

      // Event türüne göre işlemleri yönet
      switch (eventData.eventType) {
        case EventName.ProductUpdated:
          console.log(`Product ${eventData.data.id} was updated`);
          break;
        case EventName.SubscriptionUpdated:
          console.log(`Subscription ${eventData.data.id} was updated`);
          break;
        default:
          console.log('Webhook event type:', eventData.eventType);
      }

      // Başarılı durumda HTTP 200 yanıtı gönder
      res.status(200).send('Webhook received');
    } else {
      console.log('Signature missing in header');
      res.status(400).send('Invalid signature');
    }
  } catch (e) {
    // İmza uyumsuzluğu veya diğer runtime hatalarını burada ele alıyoruz
    console.error('Error processing webhook:', e);
    res.status(400).send('Invalid signature');
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

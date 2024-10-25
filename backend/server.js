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
const i18n = require('i18n'); // i18n kütüphanesini ekliyoruz
const app = express();
const server = http.createServer(app);
const Playlist = require('./models/Playlist');
const spotifyAuthRoutes = require('./routes/spotifyAuth');
const emailRoute = require('./routes/emailRoute'); // Eğer ayrı routes klasöründeyse
const fs = require('fs');




dotenv.config();

// i18n configuration
i18n.configure({
  locales: ['en', 'tr'], // Kullanılacak diller
  directory: path.join(__dirname, 'locales'), // JSON dosyalarının bulunduğu klasör
  defaultLocale: 'en', // Varsayılan dil
  objectNotation: true, // JSON dosyalarındaki iç içe objeleri kullanmak için
});

// i18n middleware olarak ekliyoruz
app.use(i18n.init);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.set('io', io);

// Middleware
app.use(express.json());

// CORS Middleware
app.use(
  cors({
    origin: ['http://localhost:3000', 'https://votesong.live', 'https://mvs4.onrender.com','https://firebasestorage.googleapis.com'], // izin verilen kaynaklar
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
app.use('/api', emailRoute); // Route'u dahil et



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

app.use('/api/spotify', spotifyAuthRoutes);
  


// Socket.io connections
io.on('connection', (socket) => {
  //console.log('A user connected:', socket.id);

  socket.on('joinPlaylist', (playlistId) => {
    //console.log('User joined playlist room with ID:', playlistId);
    socket.join(playlistId);
  });

  socket.on('leavePlaylist', (playlistId) => {
   // console.log('User left playlist room with ID:', playlistId);
    socket.leave(playlistId);
  });

    // Yeni eklenen songRequested olayı burada olmalı
    socket.on('songRequested', (song, playlistId) => {
      socket.to(playlistId).emit('newSongRequest', song);
    });

  socket.on('disconnect', () => {
   // console.log('A user disconnected:', socket.id);
  });
});



const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

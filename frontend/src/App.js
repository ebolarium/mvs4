// src/App.js

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RegisterBand from './pages/RegisterBand';
import Login from './pages/Login';
import BandDashboard from './pages/BandDashboard';
import PublishedPlaylist from './pages/PublishedPlaylist';
import Homepage from './pages/Homepage';
import 'bootstrap/dist/css/bootstrap.min.css';
import { GlobalStateProvider } from './context/GlobalStateProvider';
import BandProfile from './pages/BandProfile';
import './i18n'; // i18n dosyamızı buraya ekliyoruz
import VerificationPage from './pages/VerificationPage';



function App() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#212529',
        color: 'white',
        margin: 0,
        padding: 0,
      }}
    >
   <GlobalStateProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/register" element={<RegisterBand />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<BandDashboard />} />
          <Route path="/playlist/:playlistId" element={<PublishedPlaylist />} />
          <Route path="/profile" element={<BandProfile />} />
          <Route path="/verify/:token" element={<VerificationPage />} />

        </Routes>
      </Router>
    </GlobalStateProvider>

    </div>
  );
}


export default App;

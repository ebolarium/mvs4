//CommonAppBar.js
import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from '../assets/VoteSong_Logo.gif';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const CommonAppBar = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [bandName, setBandName] = useState('');

  // Token ve Band Name kontrolü
  useEffect(() => {
    const token = localStorage.getItem('token'); // Token kontrolü
    if (token) {
      setIsLoggedIn(true);
      const storedBandName = localStorage.getItem('bandName'); // Band name kontrolü
      setBandName(storedBandName || ''); // Band name yoksa boş bırak
    } else {
      setIsLoggedIn(false); // Token yoksa login değil
      setBandName(''); // Band name sıfırlanır
    }
  }, [location.pathname]); // Her rota değişiminde kontrol edilir

  return (
    <AppBar position="sticky" sx={{ backgroundColor: '#1c1c1c' }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Sol Kısım: Logo ve VoteSong */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <img src={Logo} alt={t('vote_song_logo')} width={40} style={{ borderRadius: '50%' }} />
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Typography variant="h6">{t('vote_song')}</Typography>
          </Link>
        </Box>

        {/* Sağ Kısım: Login Durumu */}
        <Box>
          {isLoggedIn ? (
            <>
              <Typography variant="h6" sx={{ color: '#fff', display: 'inline-block', marginRight: 2 }}>
                {t('welcome_band', { bandName: bandName || t('guest') })}
              </Typography>
              <Button color="inherit" onClick={() => navigate('/dashboard')}>
                {t('dashboard')}
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" onClick={() => navigate('/login')}>
                {t('login')}
              </Button>
              <Button color="inherit" onClick={() => navigate('/register')}>
                {t('register')}
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default CommonAppBar;

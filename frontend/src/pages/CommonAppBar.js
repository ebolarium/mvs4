//CommonAppBar.js
import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from '../assets/VoteSong_Logo.gif';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const CommonAppBar = ({ isLoggedIn }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation(); // Rota bilgisi
  const [bandName, setBandName] = useState('');

  // Login durumunu ve bandName'i kontrol et
  useEffect(() => {
    if (isLoggedIn) {
      const storedBandName = localStorage.getItem('bandName');
      if (storedBandName) {
        setBandName(storedBandName);
      }
    } else {
      setBandName(''); // Kullanıcı çıkış yaptıysa bandName'i temizle
    }
  }, [isLoggedIn, location.pathname]); // Rota değişimini tetikleyici olarak ekledik

  return (
    <AppBar position="sticky" sx={{ backgroundColor: '#1c1c1c' }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Sol kısım: Logo ve VoteSong yazısı */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <img src={Logo} alt={t('vote_song_logo')} width={40} style={{ borderRadius: '50%' }} />
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Typography variant="h6">{t('vote_song')}</Typography>
          </Link>
        </Box>

        {/* Sağ kısım: Kullanıcı durumu */}
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

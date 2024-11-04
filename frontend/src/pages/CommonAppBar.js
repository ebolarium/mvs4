//CommonAppBar.js
import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Logo from '../assets/VoteSong_Logo.gif';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';


const CommonAppBar = ({ isLoggedIn }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [bandName, setBandName] = useState('');

  useEffect(() => {
    if (isLoggedIn) {
      const storedBandName = localStorage.getItem('bandName');
      if (storedBandName) {
        setBandName(storedBandName);
      }
    }
  }, [isLoggedIn]);

  return (
    <AppBar position="sticky" sx={{ backgroundColor: '#1c1c1c' }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <img src={Logo} alt={t('vote_song_logo')} width={40} style={{ borderRadius: '50%' }} />
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <Typography variant="h6">{t('vote_song')}</Typography>
          </Link>       
        </Box>
        <Box>
          {isLoggedIn ? (
            <Typography variant="h6" sx={{ color: '#fff' }}>
              {t('welcome_band', { bandName })}
            </Typography>
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

import React, { useState, useRef, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Paper, ClickAwayListener, Container, Grid, Card, CardContent, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close'; // Close ikonu
import { useNavigate } from 'react-router-dom';
import Logo from '../assets/VoteSong_Logo.gif';
import StockImage from '../assets/vote_song_background.png';
import { MusicNote, PlaylistAdd, Headset } from '@mui/icons-material';
import Login from './Login';
import RegisterBand from './RegisterBand'; // Register bileşeni
import { useTranslation } from 'react-i18next';

const Homepage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false); // Register modal state
  const anchorRef = useRef(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLoginToggle = () => setLoginOpen((prev) => !prev);
  const handleRegisterToggle = () => setRegisterOpen((prev) => !prev); // Register toggle

  const handleLoginClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setLoginOpen(false);
  };

  const handleRegisterClose = () => {
    setRegisterOpen(false); // Register modal kapatma
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setLoginOpen(false);
    navigate('/dashboard');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundImage: `url(${StockImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <AppBar position="sticky" sx={{ backgroundColor: '#1c1c1c' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <img src={Logo} alt={t('vote_song_logo')} width={40} style={{ borderRadius: '50%' }} />
            <Typography variant="h6">{t('vote_song')}</Typography>
          </Box>
          <Box>
            {isLoggedIn ? (
              <Button color="inherit" onClick={() => navigate('/dashboard')}>
                {t('dashboard')}
              </Button>
            ) : (
              <>
                <Button ref={anchorRef} color="inherit" onClick={handleLoginToggle}>
                  {t('login')}
                </Button>
                <Button color="inherit" onClick={handleRegisterToggle}>
                  {t('register')}
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {loginOpen && (
        <ClickAwayListener onClickAway={handleLoginClose}>
          <Paper
            sx={{
              position: 'absolute',
              top: anchorRef.current?.getBoundingClientRect().bottom + 8 || 0,
              left: anchorRef.current?.getBoundingClientRect().right - 300 || 0,
              backgroundColor: 'rgba(41, 41, 41, 0.75)',
              color: '#fff',
              width: 300,
              padding: 2,
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
            }}
          >
            <Login onLoginSuccess={handleLoginSuccess} />
          </Paper>
        </ClickAwayListener>
      )}

      {registerOpen && (
        <Box
          sx={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: '#fff',
            padding: 4,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
            zIndex: 1300,
            borderRadius: 4,
            width: 400,
          }}
        >
          <IconButton
            onClick={handleRegisterClose}
            sx={{ position: 'absolute', top: 8, right: 8 }}
          >
            <CloseIcon />
          </IconButton>
          <RegisterBand />
        </Box>
      )}

      <Box sx={{ color: '#fff', textAlign: 'center', py: 8 }}>
        <img src={Logo} alt={t('vote_song_logo')} width={200} style={{ marginBottom: '1rem' }} />
        <Typography variant="h2" gutterBottom>{t('elevate_music')}</Typography>
        <Typography variant="h5">{t('engage_audience')}</Typography>
      </Box>

      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} md={6}>
            <Card sx={{ backgroundColor: '#ffffffcc', borderRadius: '16px' }}>
              <CardContent>
                <Typography variant="h5" align="center">{t('basic_plan')}</Typography>
                <ul>
                  <li>{t('one_playlist')}</li>
                  <li>{t('ten_songs_limit')}</li>
                  <li>{t('five_dollars_month')}</li>
                </ul>
                <Button variant="outlined" color="primary" fullWidth>
                  {t('choose_basic')}
                </Button>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ backgroundColor: '#ffffffcc', borderRadius: '16px' }}>
              <CardContent>
                <Typography variant="h5" align="center">{t('pro_plan')}</Typography>
                <ul>
                  <li>{t('unlimited_playlists')}</li>
                  <li>{t('unlimited_songs')}</li>
                  <li>{t('additional_features')}</li>
                  <li>{t('ten_dollars_month')}</li>
                </ul>
                <Button variant="outlined" color="secondary" fullWidth>
                  {t('choose_pro')}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Homepage;

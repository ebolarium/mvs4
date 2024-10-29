//Homepage.js
import React, { useState, useRef, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Paper, ClickAwayListener, Link, Container, Grid, Card, CardContent, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import Logo from '../assets/VoteSong_Logo.gif';
import StockImage from '../assets/vote_song_background.png';
import Login from './Login';
import RegisterBand from './RegisterBand';
import { useTranslation } from 'react-i18next';
import { HowItWorksSection } from './HowItWorksSection';
import { AboutUsSection } from './AboutUsSection';
import { PricesSection } from './PricesSection';

import VerificationModal from './VerificationModal';
import ContactForm from './ContactForm';

const Homepage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const anchorRef = useRef(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  
  // Paddle.js yüklenir ve Paddle.Setup() garanti edilir
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.paddle.com/paddle/paddle.js';
    script.async = true;
    script.onload = () => {
      if (window.Paddle) {
        window.Paddle.Setup({ vendor: 207125 }); // Satıcı ID'nizi ekleyin
        console.log('Paddle.js successfully set up');
      } else {
        console.error('Paddle is not available');
      }
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);



  const handleLoginToggle = () => setLoginOpen((prev) => !prev);
  const handleRegisterToggle = () => setRegisterOpen((prev) => !prev);
  const handleLoginClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) return;
    setLoginOpen(false);
  };
  const handleRegisterClose = () => setRegisterOpen(false);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setLoginOpen(false);
    navigate('/dashboard');
  };

  const handleRegisterSuccess = () => {
    setRegisterOpen(false);
    setShowVerificationModal(true);
  };

  const handleVerificationModalClose = () => {
    setShowVerificationModal(false);
    navigate('/');
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
              <Button color="inherit" onClick={() => navigate('/dashboard')}>{t('dashboard')}</Button>
            ) : (
              <>
                <Button ref={anchorRef} color="inherit" onClick={handleLoginToggle}>{t('login')}</Button>
                <Button color="inherit" onClick={handleRegisterToggle}>{t('register')}</Button>
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
          <IconButton onClick={handleRegisterClose} sx={{ position: 'absolute', top: 8, right: 8 }}>
            <CloseIcon />
          </IconButton>
          <RegisterBand onRegisterSuccess={handleRegisterSuccess} />
        </Box>
      )}

      <Box sx={{ color: '#fff', textAlign: 'center', py: 8 }}>
        <img src={Logo} alt={t('vote_song_logo')} width={200} style={{ marginBottom: '1rem' }} />
        <Typography variant="h2" gutterBottom>{t('elevate_music')}</Typography>
        <Typography variant="h5">{t('engage_audience')}</Typography>
      </Box>

      <Container maxWidth="lg" sx={{ py: 10 }}> 
        <HowItWorksSection />
        <PricesSection />
        <AboutUsSection />
      </Container>

      <VerificationModal
        show={showVerificationModal}
        onClose={handleVerificationModalClose}
        message="Thank you for registering! Please verify your email."
      />
      <ContactForm />
      <Footer />
    </Box>
  );
};

const Footer = () => (
  <Box sx={{ backgroundColor: '#1c1c1c', color: '#fff', py: 3, mt: 4 }}>
    <Container maxWidth="lg">
      <Grid container spacing={2} justifyContent="center">
        <Grid item>
          <Link href="/terms-of-service" color="inherit" underline="hover">Terms of Service</Link>
        </Grid>
        <Grid item>
          <Link href="/privacy-policy" color="inherit" underline="hover">Privacy Policy</Link>
        </Grid>
        <Grid item>
          <Link href="/refund-policy" color="inherit" underline="hover">Refund Policy</Link>
        </Grid>
      </Grid>
      <Typography variant="body2" align="center" sx={{ mt: 2 }}>© 2024 VoteSong. All rights reserved.</Typography>
    </Container>
  </Box>
);

export default Homepage;

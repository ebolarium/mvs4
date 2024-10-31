// Homepage.js
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
  const [products, setProducts] = useState([]);
  const [loggedInUserId, setLoggedInUserId] = useState(null);

  // Kullanıcı giriş durumunu kontrol etme
  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('Fetched token:', token);
    if (token) {
      setIsLoggedIn(true);
      fetchUserData(); // Giriş yapılmışsa kullanıcı verisini alıyoruz
    }
  }, []);

  // Paddle.js yükleme ve Paddle.Setup() işlemi
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.paddle.com/paddle/paddle.js';
    script.async = true;
    script.onload = () => {
      if (window.Paddle) {
        window.Paddle.Environment.set('sandbox'); // Sandbox ortamını kullanıyorsanız
        window.Paddle.Setup({ vendor: 24248 });
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

  // Ürünleri Paddle API'den çekme
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Failed to fetch products:', errorText);
          return;
        }
        const data = await response.json();
        console.log('Fetched products:', data);
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products: ", error);
      }
    };

    fetchProducts();
  }, []);

  // Kullanıcı verisini alma fonksiyonu
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token'); // Token alınıyor
      console.log('Fetched token in fetchUserData:', token);
      if (!token) {
        console.error('No token found');
        return;
      }

      const response = await fetch('/api/user', {
        headers: {
          'Authorization': `Bearer ${token}`, // Token ile yetkilendirme başlığı ekliyoruz
        },
      });

      console.log('Response status:', response.status);
      const contentType = response.headers.get("content-type");
      console.log('Response content-type:', contentType);
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        console.log('Fetched user data:', data);
        if (data.userId) {
          setLoggedInUserId(data.userId); // Kullanıcı kimliğini ayarla
        } else {
          console.error('Error: userId is missing in the response:', data);
        }
      } else {
        const text = await response.text();
        console.error('Error: Response is not in JSON format:', text);
      }
    } catch (error) {
      console.error('An error occurred while fetching user data:', error);
    }
  };

  const handleLoginToggle = () => setLoginOpen((prev) => !prev);
  const handleRegisterToggle = () => setRegisterOpen((prev) => !prev);
  const handleLoginClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) return;
    setLoginOpen(false);
  };
  const handleRegisterClose = () => setRegisterOpen(false);

  const handleLoginSuccess = (userData) => {
    setIsLoggedIn(true);
    setLoginOpen(false);
    fetchUserData(); // Giriş başarılı olduğunda kullanıcı verisini alıyoruz
  };

  const handleRegisterSuccess = () => {
    setRegisterOpen(false);
    setShowVerificationModal(true);
  };

  const handleVerificationModalClose = () => {
    setShowVerificationModal(false);
  };

  const initiatePlanSelection = () => {
    if (!isLoggedIn) {
      alert(t('login_required_to_select_plan')); // Kullanıcı giriş yapmadıysa uyarı mesajı
      setLoginOpen(true); // Giriş modalını aç
    }
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
              left: anchorRef.current?.getBoundingClientRect().left || 0,
              backgroundColor: 'rgba(41, 41, 41, 0.75)',
              color: '#fff',
              width: 300,
              padding: 2,
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
              zIndex: 1300,
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

      <Box sx={{ color: '#fff', textAlign: 'center', py: 5 }}>
        <img src={Logo} alt={t('vote_song_logo')} width={200} style={{ marginBottom: '1rem' }} />
        <Typography variant="h2" gutterBottom>{t('elevate_music')}</Typography>
        <Typography variant="h5">{t('engage_audience')}</Typography>
      </Box>

      <Container maxWidth="lg" sx={{ py: 0 }}>
        <PricesSection
          isLoggedIn={isLoggedIn}
          openLoginModal={handleLoginToggle}
          products={products}
          loggedInUserId={loggedInUserId} // Kullanıcı kimliğini PricesSection bileşenine geçiriyoruz
        />
        <HowItWorksSection />
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

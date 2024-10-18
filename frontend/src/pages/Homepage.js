import React, { useState, useRef } from 'react';
import { AppBar, Toolbar, Typography, Button, Container, Grid, Card, CardContent, Box, TextField, Paper, ClickAwayListener } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Logo from '../assets/VoteSong_Logo.gif';
import StockImage from '../assets/vote_song_background.png';
import { MusicNote, PlaylistAdd, Headset } from '@mui/icons-material';

const Homepage = () => {
  const navigate = useNavigate();
  const [loginOpen, setLoginOpen] = useState(false);
  const anchorRef = useRef(null); 

  const handleLoginToggle = () => setLoginOpen((prev) => !prev);

  const handleLoginClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setLoginOpen(false);
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
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
      {/* Sticky Header */}
      <AppBar position="sticky" sx={{ backgroundColor: '#1c1c1c' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <img src={Logo} alt="Vote Song Logo" width={40} style={{ borderRadius: '50%' }} />
            <Typography variant="h6" component="div">Vote Song</Typography>
          </Box>
          <Box>
            <Button ref={anchorRef} color="inherit" onClick={handleLoginToggle}>Login</Button>
            <Button color="inherit">Register</Button>
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
        backgroundColor: 'rgba(41, 41, 41, 0.75)', // Semi-transparent background
        color: '#fff',
        width: 300,
        padding: 2,
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
      }}
    >
      <Typography variant="h6" align="center" gutterBottom>Login</Typography>
      <form onSubmit={handleLoginSubmit}>
        <TextField 
          label="Email" 
          variant="outlined" 
          fullWidth 
          margin="normal" 
          InputLabelProps={{ style: { color: '#fff' } }}
          sx={{ input: { color: '#fff' } }}
        />
        <TextField 
          label="Password" 
          type="password" 
          variant="outlined" 
          fullWidth 
          margin="normal" 
          InputLabelProps={{ style: { color: '#fff' } }}
          sx={{ input: { color: '#fff' } }}
        />
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
          Login
        </Button>
      </form>
      {/* Forgot Password Text */}
      <Typography
        variant="body2"
        align="center"
        sx={{ mt: 1, cursor: 'pointer', textDecoration: 'underline', color: '#aaa' }}
      >
        Forgot Password?
      </Typography>
    </Paper>
  </ClickAwayListener>
)}


      {/* Hero Section */}
      <Box sx={{ color: '#fff', textAlign: 'center', py: 8 }}>
        <img src={Logo} alt="Vote Song Logo" width={200} style={{ marginBottom: '1rem' }} />
        <Typography variant="h2" gutterBottom>Elevate Your Live Music</Typography>
        <Typography variant="h5">Engage your audience with interactive music experiences.</Typography>
      </Box>

      {/* Plans Section */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} md={6}>
            <Card sx={{ backgroundColor: '#ffffffcc', borderRadius: '16px' }}>
              <CardContent>
                <Typography variant="h5" align="center">Basic Plan</Typography>
                <ul>
                  <li>1 Playlist</li>
                  <li>10 Songs Limit</li>
                  <li>$5/month</li>
                </ul>
                <Button variant="outlined" color="primary" fullWidth>Choose Basic</Button>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ backgroundColor: '#ffffffcc', borderRadius: '16px' }}>
              <CardContent>
                <Typography variant="h5" align="center">Pro Plan</Typography>
                <ul>
                  <li>Unlimited Playlists</li>
                  <li>Unlimited Songs</li>
                  <li>Additional Features: Raffle and more </li>
                  <li>$10/month</li>
                </ul>
                <Button variant="outlined" color="secondary" fullWidth>Choose Pro</Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* How It Works Section */}
      <Container maxWidth="lg" sx={{ py: 5, textAlign: 'center' }}>
        <Typography variant="h3" gutterBottom>How It Works</Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <MusicNote sx={{ fontSize: 80, color: '#fff', mb: 2 }} />
            <Typography variant="h5" gutterBottom>Select your plan</Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <PlaylistAdd sx={{ fontSize: 80, color: '#fff', mb: 2 }} />
            <Typography variant="h5" gutterBottom>Create playlists & let your audience vote</Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Headset sx={{ fontSize: 80, color: '#fff', mb: 2 }} />
            <Typography variant="h5" gutterBottom>Enjoy real-time interactive sessions</Typography>
          </Grid>
        </Grid>
      </Container>

      {/* Footer */}
      <Box sx={{ backgroundColor: '#1c1c1c', color: '#fff', py: 2, textAlign: 'center' }}>
        <Typography variant="body2">© 2024 Vote Song. All Rights Reserved.</Typography>
      </Box>
    </Box>
  );
};

export default Homepage;

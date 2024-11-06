import React, { useContext } from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { GlobalStateContext } from '../context/GlobalStateProvider';
import Logo from '../assets/VoteSong_Logo.gif';

const CommonAppBar = () => {
  const { state } = useContext(GlobalStateContext);
  const { isLoggedIn, bandName } = state;
  const navigate = useNavigate();

  return (
    <AppBar position="sticky" sx={{ backgroundColor: '#1c1c1c' }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <img src={Logo} alt="VoteSong Logo" width={40} style={{ borderRadius: '50%' }} />
          <Typography variant="h6">VoteSong</Typography>
        </Box>
        <Box>
          {isLoggedIn ? (
            <>
              <Typography variant="h6" sx={{ color: '#fff', marginRight: 2 }}>
                Welcome, {bandName || 'Guest'}
              </Typography>
              <Button color="inherit" onClick={() => navigate('/dashboard')}>Dashboard</Button>
            </>
          ) : (
            <>
              <Button color="inherit" onClick={() => navigate('/login')}>Login</Button>
              <Button color="inherit" onClick={() => navigate('/register')}>Register</Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default CommonAppBar;

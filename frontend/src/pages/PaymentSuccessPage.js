// PaymentSuccessPage.js
import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const PaymentSuccessPage = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ py: 5, textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom>
        Payment Successful!
      </Typography>
      <Typography variant="body1" gutterBottom>
        Thank you for your purchase. Your subscription is now active.
      </Typography>
      <Button variant="contained" color="primary" onClick={() => navigate('/dashboard')}>
        Go to Dashboard
      </Button>
    </Box>
  );
};

export default PaymentSuccessPage;

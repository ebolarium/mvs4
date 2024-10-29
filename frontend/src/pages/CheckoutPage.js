// CheckoutPage.js
import React, { useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const CheckoutPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Replace with your actual Paddle Vendor ID and Product IDs
  const VENDOR_ID = '207125'; // e.g., 123456
  const MONTHLY_PRODUCT_ID = 'pro_01jbcra0n260dk8mtj7w02myc8'; // e.g., 12345
  const YEARLY_PRODUCT_ID = 'pro_01jbcz6kyxqak4k5pspfjzdgtg'; // e.g., 67890

  // Load Paddle.js and initialize it
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.paddle.com/paddle/paddle.js';
    script.async = true;
    script.onload = () => {
      if (window.Paddle) {
        // Uncomment the next line to use the sandbox environment during testing
        // window.Paddle.Environment.set('sandbox');
        window.Paddle.Setup({ vendor: VENDOR_ID });
        console.log('Paddle.js successfully set up');
      } else {
        console.error('Paddle is not available');
      }
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [VENDOR_ID]);

  // Function to initiate the checkout process
  const initiateCheckout = (productId) => {
    if (window.Paddle) {
      window.Paddle.Checkout.open({
        product: productId,
        locale: 'en',
        // Optional: Pass user email and passthrough data if available
        // email: userEmail,
        // passthrough: JSON.stringify({ userId: userId }),
        successCallback: (data) => {
          console.log('Payment Successful:', data);
          // Redirect to success page or update UI
          navigate('/payment-success');
        },
        closeCallback: () => {
          console.warn('Checkout was closed.');
        },
        errorCallback: (error) => {
          console.error('Checkout Error:', error);
          // Display error message to the user if needed
          alert(t('An error occurred during checkout. Please try again.'));
        },
      });
    } else {
      console.error('Paddle is not initialized');
    }
  };

  return (
    <Box sx={{ py: 5 }}>
      <Container maxWidth="md">
        <Typography variant="h4" align="center" gutterBottom>
          {t('Choose Your Plan')}
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          {/* Monthly Plan */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                backgroundColor: '#ffffffcc',
                borderRadius: '16px',
                transition: 'transform 0.3s',
                '&:hover': { transform: 'scale(1.05)' },
              }}
            >
              <CardContent>
                <Typography variant="h5" align="center" gutterBottom>
                  {t('Monthly Plan')}
                </Typography>
                <Typography
                  variant="h6"
                  align="center"
                  color="primary"
                  gutterBottom
                >
                  $9.99 / {t('month')}
                </Typography>
                <Typography variant="body1" align="center" sx={{ mb: 2 }}>
                  {t('Access all features with a monthly subscription.')}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={() => initiateCheckout(MONTHLY_PRODUCT_ID)}
                >
                  {t('Choose Monthly')}
                </Button>
              </CardContent>
            </Card>
          </Grid>
          {/* Yearly Plan */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                backgroundColor: '#ffffffcc',
                borderRadius: '16px',
                transition: 'transform 0.3s',
                '&:hover': { transform: 'scale(1.05)' },
              }}
            >
              <CardContent>
                <Typography variant="h5" align="center" gutterBottom>
                  {t('Yearly Plan')}
                </Typography>
                <Typography
                  variant="h6"
                  align="center"
                  color="secondary"
                  gutterBottom
                >
                  $99.99 / {t('year')}
                </Typography>
                <Typography variant="body1" align="center" sx={{ mb: 2 }}>
                  {t('Save 15% with an annual subscription.')}
                </Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  fullWidth
                  onClick={() => initiateCheckout(YEARLY_PRODUCT_ID)}
                >
                  {t('Choose Yearly')}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default CheckoutPage;

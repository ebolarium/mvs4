// PricesSection.js
import React from 'react';
import { Box, Container, Grid, Card, CardContent, Typography, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';

const PricesSection = ({ isLoggedIn, openLoginModal, products, loggedInUserId }) => {
  const { t } = useTranslation();

  const initiateCheckout = (priceId) => {
    console.log('Initiating checkout with priceId:', priceId);
    console.log('Logged In User ID:', loggedInUserId);
  
    if (!isLoggedIn) {
      alert(t('login_required_to_purchase'));
      openLoginModal();
      return;
    }
  
    if (!loggedInUserId) {
      console.error('loggedInUserId is null or undefined');
      alert(t('user_id_missing'));
      return;
    }
  
    if (window.Paddle) {
      window.Paddle.Checkout.open({
        product: priceId, // Paddle ürün kimliği
        passthrough: JSON.stringify({ userId: loggedInUserId }), // Kullanıcı kimliğini geçiriyoruz
        successCallback: (data) => {
          console.log('Payment Successful:', data);
          window.location.href = '/tesekkurler';
        },
        closeCallback: () => {
          console.warn('Checkout was closed.');
        },
        errorCallback: (error) => {
          console.error('Checkout Error:', error);
        },
        locale: 'en',
      });
    } else {
      console.error('Paddle is not initialized');
    }
  };
  

  return (
    <Box sx={{ py: 2, backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
      <Container maxWidth="md">
        <Typography variant="h4" align="center" gutterBottom>
          {t('pricing.title')}
        </Typography>
        <Typography variant="body1" align="center" gutterBottom sx={{ mb: 4 }}>
          {t('pricing.subtitle')}
        </Typography>

        <Grid container spacing={4} justifyContent="center">
          {products.map((product) => {
            const priceId = product.id;  // 'pri_...' formatında priceId
            return (
              <Grid item xs={12} md={6} key={priceId}>
                <Card
                  sx={{ backgroundColor: '#ffffffcc', borderRadius: '16px', transition: 'transform 0.3s', '&:hover': { transform: 'scale(1.05)' } }}
                >
                  <CardContent>
                    <Typography variant="h5" align="center" gutterBottom>
                      {product.name}
                    </Typography>
                    <Typography variant="h6" align="center" color="primary" gutterBottom>
                      {`Price: $${(product.price / 100).toFixed(2)} ${product.currency}`}
                    </Typography>
                    <Typography variant="body1" align="center" sx={{ mb: 2 }}>
                      {product.description}
                    </Typography>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      fullWidth 
                      onClick={() => initiateCheckout(priceId)} // Butona tıklama işlevini ekliyoruz
                    >
                      {t('pricing.purchase_button')}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </Box>
  );
};

export { PricesSection };

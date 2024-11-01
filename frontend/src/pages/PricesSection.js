// PricesSection.js
import React from 'react';
import { Box, Container, Grid, Card, CardContent, Typography, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';

const PricesSection = ({ isLoggedIn, openLoginModal, products, loggedInUserId }) => {
  const { t } = useTranslation();

  const initiateCheckout = (priceId) => {
    if (!isLoggedIn) {
      alert(t('login_required_to_purchase'));
      openLoginModal();
      return;
    }

    if (!loggedInUserId) {
      alert(t('user_id_missing'));
      return;
    }

    if (window.Paddle) {
      let itemsList = [
        {
          priceId: "pri_01jbm4srw7rgc8a1wbrdkhaetd",
          quantity: 1
        }
      ];

      window.Paddle.Checkout.open({
        items: itemsList,
        passthrough: JSON.stringify({ userId: loggedInUserId }),
        successCallback: (data) => {
          console.log('Payment Successful:', data);
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
        <Typography variant="h4" align="center" gutterBottom>{t('pricing.title')}</Typography>
        <Typography variant="body1" align="center" sx={{ mb: 4 }}>{t('pricing.subtitle')}</Typography>
        <Grid container spacing={4} justifyContent="center">
          {products.map((product) => (
            <Grid item xs={12} md={6} key={product.id}>
              <Card sx={{ backgroundColor: '#ffffffcc', borderRadius: '16px', '&:hover': { transform: 'scale(1.05)' } }}>
                <CardContent>
                  <Typography variant="h5" align="center" gutterBottom>{product.name}</Typography>
                  <Typography variant="h6" align="center" color="primary" gutterBottom>
                    {`Price: $${product.price} ${product.currency}`}
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    fullWidth 
                    onClick={() => initiateCheckout(product.id)} // Price ID'yi initiateCheckout'a geçiyoruz
                  >
                    {t('pricing.purchase_button')}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export { PricesSection };

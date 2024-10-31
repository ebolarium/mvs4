import React from 'react';
import { Box, Container, Grid, Card, CardContent, Typography, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';

const PricesSection = ({ isLoggedIn, openLoginModal, products }) => {
  const { t } = useTranslation();

  const initiateCheckout = (priceId) => {
    if (!isLoggedIn) {
      alert(t('login_required_to_purchase'));
      openLoginModal();
      return;
    }

    if (window.Paddle) {
      window.Paddle.Checkout.open({
        product: priceId,       // priceId'yi product parametresi olarak kullanıyoruz
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

  console.log("All Products:", products);

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
          {products.map((product) => (
            <Grid item xs={12} md={6} key={product.id}>
              <Card
                sx={{ backgroundColor: '#ffffffcc', borderRadius: '16px', transition: 'transform 0.3s', '&:hover': { transform: 'scale(1.05)' } }}
                onClick={() => initiateCheckout(product.id)}  // priceId'yi burada kullanıyoruz
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
                  <Button variant="contained" color="primary" fullWidth>
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

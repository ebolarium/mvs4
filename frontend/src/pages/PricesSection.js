import React from 'react';
import { Box, Container, Grid, Card, CardContent, Typography, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';

const PricesSection = ({ isLoggedIn, openLoginModal, products }) => {
  const { t } = useTranslation();

  const initiateCheckout = (productId) => {
    if (!isLoggedIn) {
      alert(t('login_required_to_purchase'));
      openLoginModal();
      return;
    }

    if (window.Paddle) {
      window.Paddle.Checkout.open({
        product: 'pri_01jbedvwaxzpn2q69p88e9yd96',  // Doğru ürün kimliği
        vendor: 24248,  // Satıcı kimliği
        //passthrough: JSON.stringify({ userId: loggedInUserId }),  // Kullanıcı bilgisi (isteğe bağlı)
        successCallback: (data) => {
          console.log('Payment Successful:', data);  // Ödeme başarılı olduğunda tetiklenir
        },
        closeCallback: () => {
          console.warn('Checkout was closed.');  // Ödeme penceresi kapatıldığında tetiklenir
        },
        errorCallback: (error) => {
          console.error('Checkout Error:', error);  // Ödeme sırasında hata oluşursa tetiklenir
        },
        locale: 'en',  // Dil ayarı
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
            // Tüm product nesnesini konsola yazdır
            console.log("Product Details:", product);

            return (
              <Grid item xs={12} md={6} key={product.id}>
                <Card
                  sx={{ backgroundColor: '#ffffffcc', borderRadius: '16px', transition: 'transform 0.3s', '&:hover': { transform: 'scale(1.05)' } }}
                  onClick={() => initiateCheckout(product.id)}
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
            );
          })}
        </Grid>
      </Container>
    </Box>
  );
};

export { PricesSection };

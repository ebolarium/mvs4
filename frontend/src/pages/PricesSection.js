import React from 'react';
import { Box, Container, Grid, Card, CardContent, Typography, Button } from '@mui/material';
import { useTranslation } from 'react-i18next'; // t fonksiyonunu kullanmak için ekledik

const PricesSection = () => {
    const { t } = useTranslation(); // t fonksiyonunu kullanmak için
  
    // Paddle Checkout işlemini başlatan fonksiyon
    const initiateCheckout = (productId) => {
      if (window.Paddle) {
        window.Paddle.Checkout.open({
          product: productId,
          successCallback: (data) => {
            console.log('Payment Successful:', data);
          },
          closeCallback: () => {
            console.warn('Checkout was closed.');
          },
          errorCallback: (error) => {
            console.error('Checkout Error:', error);
          },
        });
      } else {
        console.error('Paddle is not initialized');
      }
    };
  
    return (
      <Box sx={{ py: 10, backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
        <Container maxWidth="md">
          <Typography variant="h4" align="center" gutterBottom>
            {t('pricing.title')}
          </Typography>
          <Typography variant="body1" align="center" gutterBottom sx={{ mb: 4 }}>
            {t('pricing.subtitle')}
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} md={6}>
              <Card
                sx={{ backgroundColor: '#ffffffcc', borderRadius: '16px', transition: 'transform 0.3s', '&:hover': { transform: 'scale(1.05)' } }}
                onClick={() => initiateCheckout('pro_01jbcra0n260dk8mtj7w02myc8')} // Aylık abonelik ID'si ile ödeme başlatma
              >
                <CardContent>
                  <Typography variant="h5" align="center" gutterBottom>
                    {t('pricing.monthly_plan.title')}
                  </Typography>
                  <Typography variant="h6" align="center" color="primary" gutterBottom>
                    {t('pricing.monthly_plan.price')}
                  </Typography>
                  <Typography variant="body1" align="center" sx={{ mb: 2 }}>
                    {t('pricing.monthly_plan.description')}
                  </Typography>
                  <Button variant="contained" color="primary" fullWidth>
                    {t('pricing.monthly_plan.button')}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
  
            <Grid item xs={12} md={6}>
              <Card
                sx={{ backgroundColor: '#ffffffcc', borderRadius: '16px', transition: 'transform 0.3s', '&:hover': { transform: 'scale(1.05)' } }}
                onClick={() => initiateCheckout('pri_01jbcz80fzsbcsx54styqtfme0')} // Yıllık abonelik ID'si ile ödeme başlatma
              >
                <CardContent>
                  <Typography variant="h5" align="center" gutterBottom>
                    {t('pricing.yearly_plan.title')}
                  </Typography>
                  <Typography variant="h6" align="center" color="secondary" gutterBottom>
                    {t('pricing.yearly_plan.price')}
                  </Typography>
                  <Typography variant="body1" align="center" sx={{ mb: 2 }}>
                    {t('pricing.yearly_plan.description')}
                  </Typography>
                  <Button variant="contained" color="secondary" fullWidth>
                    {t('pricing.yearly_plan.button')}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
    );
};
  
export { PricesSection };

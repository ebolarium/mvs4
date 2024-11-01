// PricesSection.js
import React from 'react';
import { Box, Typography, Button } from '@mui/material';

const PricesSection = () => {
  const handleSubscribe = () => {
    // Paddle entegrasyonu: checkout penceresini aç
    Paddle.Checkout.open({
      items: [
        {
          priceId: "pri_01jbm4srw7rgc8a1wbrdkhaetd",
          quantity: 1,
        },
      ],
      successCallback: function (data) {
        console.log("Satın alma başarılı!", data);
      },
      closeCallback: function () {
        console.log("Ödeme penceresi kapatıldı.");
      },
    });
  };

  return (
    <Box sx={{ py: 2, textAlign: 'center', backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
      <Typography variant="h4">Abonelik Planları</Typography>
      <Button variant="contained" color="primary" onClick={handleSubscribe} sx={{ mt: 2 }}>
        Abone Ol
      </Button>
    </Box>
  );
};

export { PricesSection };

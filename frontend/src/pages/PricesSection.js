// PricesSection.js
import React, { useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';

// Paddle tanımını global değişken olarak kullanıyoruz
/* global Paddle */

const PricesSection = () => {
  useEffect(() => {
    // Paddle'ı başlat ve sadece client-side token kullanarak yapılandır
    Paddle.Environment.set("sandbox");
    Paddle.Initialize({
      token: "test_605824494b6e720104d54646e1c" // Buraya kendi client-side token'ınızı ekleyin
    });
  }, []);

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

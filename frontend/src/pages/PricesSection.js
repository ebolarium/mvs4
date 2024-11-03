import React, { useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';

const PricesSection = ({ isLoggedIn }) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
    script.async = true;
    script.onload = () => {
      if (window.Paddle) {
        window.Paddle.Environment.set("sandbox");
        window.Paddle.Initialize({
          token: "test_605824494b6e720104d54646e1c"
        });
      } else {
        console.error("Paddle yüklenemedi.");
      }
    };
    script.onerror = () => {
      console.error("Paddle scripti yüklenemedi.");
    };
    document.body.appendChild(script);
  }, []);

  const handleSubscribe = () => {
    const token = localStorage.getItem('token');
    if (!token || token === "undefined") {
      alert("Lütfen önce giriş yapın veya kayıt olun.");
      return;
    }

    let bandId;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      bandId = payload.id;
    } catch (error) {
      console.error("Token çözme hatası:", error);
      alert("Geçersiz giriş bilgisi. Lütfen tekrar giriş yapın.");
      return;
    }

    if (window.Paddle) {
      window.Paddle.Checkout.open({
        items: [
          {
            priceId: "pri_01jbm4srw7rgc8a1wbrdkhaetd",
            quantity: 1,
          },
        ],
        passthrough: JSON.stringify({ bandId }),
        successCallback: function (data) {
          console.log("Satın alma başarılı!", data);
        },
        closeCallback: function () {
          console.log("Ödeme penceresi kapatıldı.");
        },
      });
    } else {
      console.error("Paddle tanımlı değil.");
    }
  };

  return (
    <Box sx={{ py: 2, textAlign: 'center', backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
      <Typography variant="h4">Abonelik Planları</Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={handleSubscribe}
        sx={{ mt: 2 }}
        disabled={!isLoggedIn}
      >
        Abone Ol
      </Button>
    </Box>
  );
};

export { PricesSection };

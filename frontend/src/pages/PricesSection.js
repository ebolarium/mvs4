// PricesSection.js

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
          token: "test_605824494b6e720104d54646e1c",
        });
        console.log("Paddle successfully initialized.");
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
    // Kullanıcı login olmuş mu kontrol et
    const token = localStorage.getItem('token');
    if (!token || token === "undefined") {
      console.error("Token bulunamadı veya tanımsız. Kullanıcı giriş yapmalı.");
      alert("Lütfen önce giriş yapın veya kayıt olun.");
      return;
    }

    console.log("Token alındı:", token);

    // Token'dan bandId al
    let bandId;
    try {
      const payload = JSON.parse(atob(token.split('.')[1])); // Token'ın payload kısmını base64'ten çöz
      bandId = payload.id;
      console.log("bandId token'dan başarıyla çözüldü:", bandId);
    } catch (error) {
      console.error("Token çözme hatası:", error);
      alert("Geçersiz giriş bilgisi. Lütfen tekrar giriş yapın.");
      return;
    }

    // Eğer bandId hala geçerli değilse, ödeme başlatma
    if (!bandId) {
      console.error("bandId bulunamadı veya geçersiz.");
      alert("Geçersiz kullanıcı bilgisi.");
      return;
    }

    if (window.Paddle) {
      console.log("Ödeme başlatılıyor. bandId:", bandId);
      // Paddle entegrasyonu: checkout penceresini aç
      window.Paddle.Checkout.open({
        items: [
          {
            priceId: "pri_01jbm4srw7rgc8a1wbrdkhaetd",
            quantity: 1,
          },
        ],
        customData: {
          "bandId": bandId  // bandId'yi customData olarak gönderiyoruz
        },
        successCallback: function (data) {
          console.log("Satın alma başarılı! Paddle verileri:", data);
        },
        closeCallback: function () {
          console.log("Ödeme penceresi kapatıldı.");
        },
      });
    } else {
      console.error("Paddle tanımlı değil.");
    }
  };

  const handleMonthlySubscription = () => {
    // Kullanıcı login olmuş mu kontrol et
    const token = localStorage.getItem('token');
    if (!token || token === "undefined") {
      console.error("Token bulunamadı veya tanımsız. Kullanıcı giriş yapmalı.");
      alert("Lütfen önce giriş yapın veya kayıt olun.");
      return;
    }

    console.log("Token alındı:", token);

    // Token'dan bandId al
    let bandId;
    try {
      const payload = JSON.parse(atob(token.split('.')[1])); // Token'ın payload kısmını base64'ten çöz
      bandId = payload.id;
      console.log("bandId token'dan başarıyla çözüldü:", bandId);
    } catch (error) {
      console.error("Token çözme hatası:", error);
      alert("Geçersiz giriş bilgisi. Lütfen tekrar giriş yapın.");
      return;
    }

    // Eğer bandId hala geçerli değilse, ödeme başlatma
    if (!bandId) {
      console.error("bandId bulunamadı veya geçersiz.");
      alert("Geçersiz kullanıcı bilgisi.");
      return;
    }

    if (window.Paddle) {
      console.log("Aylık abonelik başlatılıyor. bandId:", bandId);
      // Paddle entegrasyonu: aylık abonelik için checkout penceresini aç
      window.Paddle.Checkout.open({
        items: [
          {
            priceId: "pri_01jbedvwaxzpn2q69p88e9yd96",
            quantity: 1,
          },
        ],
        customData: {
          "bandId": bandId  // bandId'yi customData olarak gönderiyoruz
        },
        successCallback: function (data) {
          console.log("Aylık abonelik başarılı! Paddle verileri:", data);
        },
        closeCallback: function () {
          console.log("Abonelik ödeme penceresi kapatıldı.");
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
      <Button
        variant="contained"
        color="secondary"
        onClick={handleMonthlySubscription}
        sx={{ mt: 2, ml: 2 }}
        disabled={!isLoggedIn}
      >
        Aylık Abonelik
      </Button>
    </Box>
  );
};

export { PricesSection };

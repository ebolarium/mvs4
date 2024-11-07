// PricesSection.js

import React, { useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';


const PricesSection = ({ isLoggedIn }) => {
  const { t } = useTranslation();

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
      alert(t('pleaseLoginOrRegister'));
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
      alert(t('invalidLoginInfo'));
      return;
    }

    // Eğer bandId hala geçerli değilse, ödeme başlatma
    if (!bandId) {
      console.error("bandId bulunamadı veya geçersiz.");
      alert(t('invalidUserInfo'));
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
      alert(t('pleaseLoginOrRegister'));
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
      alert(t('invalidLoginInfo'));
      return;
    }

    // Eğer bandId hala geçerli değilse, ödeme başlatma
    if (!bandId) {
      console.error("bandId bulunamadı veya geçersiz.");
      alert(t('invalidUserInfo'));
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

  const handleYearlySubscription = () => {
    // Kullanıcı login olmuş mu kontrol et
    const token = localStorage.getItem('token');
    if (!token || token === "undefined") {
      console.error("Token bulunamadı veya tanımsız. Kullanıcı giriş yapmalı.");
      alert(t('pleaseLoginOrRegister'));
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
      alert(t('invalidLoginInfo'));
      return;
    }

    // Eğer bandId hala geçerli değilse, ödeme başlatma
    if (!bandId) {
      console.error("bandId bulunamadı veya geçersiz.");
      alert(t('invalidLoginInfo'));
      return;
    }

    if (window.Paddle) {
      console.log("Yıllık abonelik başlatılıyor. bandId:", bandId);
      // Paddle entegrasyonu: yıllık abonelik için checkout penceresini aç
      window.Paddle.Checkout.open({
        items: [
          {
            priceId: "pri_01jbedwnj09vd7hr99xyhddbsg",
            quantity: 1,
          },
        ],
        customData: {
          "bandId": bandId  // bandId'yi customData olarak gönderiyoruz
        },
        successCallback: function (data) {
          console.log("Yıllık abonelik başarılı! Paddle verileri:", data);
        },
        closeCallback: function () {
          console.log("Yıllık abonelik ödeme penceresi kapatıldı.");
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
        color="secondary"
        onClick={handleMonthlySubscription}
        sx={{ mt: 2, ml: 2 }}
        disabled={!isLoggedIn}
      >
        {t('monthlySubscription')}
        </Button>
      <Button
        variant="contained"
        color="success"
        onClick={handleYearlySubscription}
        sx={{ mt: 2, ml: 2 }}
        disabled={!isLoggedIn}
      >
        {t('yearlySubscription')}
        </Button>
    </Box>
  );
};

export { PricesSection };

// PricesSection.js

import React, { useEffect } from 'react';
import { Box, Typography, Button, Card, CardContent, CardActions } from '@mui/material';
import { useTranslation } from 'react-i18next';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

const PricesSection = ({ isLoggedIn }) => {
  const { t } = useTranslation();

  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
    script.async = true;
    script.onload = () => {
      if (window.Paddle) {
        window.Paddle.Environment.set("production");
        window.Paddle.Initialize({
          token: "live_fc1e0defb6165bb3c844fc0177b",
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

    // Token'dan bandId ve bandEmail al
    let bandId, bandEmail;
    try {
      const payload = JSON.parse(atob(token.split('.')[1])); // Token'ın payload kısmını base64'ten çöz
      bandId = payload.id;
      bandEmail = payload.email; // E-posta bilgisini alıyoruz

      console.log("bandId ve bandEmail token'dan başarıyla çözüldü:", bandId, bandEmail);
    } catch (error) {
      console.error("Token çözme hatası:", error);
      alert(t('invalidLoginInfo'));
      return;
    }

    // Eğer bandId veya bandEmail hala geçerli değilse, ödeme başlatma
    if (!bandId || !bandEmail) {
      console.error("bandId veya bandEmail bulunamadı veya geçersiz.");
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
        email: bandEmail, // Müşteri e-posta adresini email alanında gönderiyoruz
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

    // Token'dan bandId ve bandEmail al
    let bandId, bandEmail;
    try {
      const payload = JSON.parse(atob(token.split('.')[1])); // Token'ın payload kısmını base64'ten çöz
      bandId = payload.id;
      bandEmail = payload.band_email; // Token'dan band_email bilgisi çekiliyor
      console.log("Token payload:", payload);
      console.log("Çözülen bandId:", payload.id);
      console.log("Çözülen bandEmail:", payload.band_email);
      console.log("bandId ve bandEmail token'dan başarıyla çözüldü:", bandId, bandEmail);
    } catch (error) {
      console.error("Token çözme hatası:", error);
      alert(t('invalidLoginInfo'));
      return;
    }

    // Eğer bandId veya bandEmail hala geçerli değilse, ödeme başlatma
    if (!bandId || !bandEmail) {
      console.error("bandId veya bandEmail bulunamadı veya geçersiz.");
      alert(t('invalidUserInfo'));
      return;
    }

    if (window.Paddle) {
      console.log("Aylık abonelik başlatılıyor. bandId:", bandId);
      // Paddle entegrasyonu: aylık abonelik için checkout penceresini aç
      console.log("Paddle checkout için gönderilen bandId:", bandId);
      console.log("Paddle checkout için gönderilen bandEmail:", bandEmail);
      window.Paddle.Checkout.open({
        items: [
          {
            priceId: "pri_01jc2t9w0pt21j6kafhznhm3cj",
            quantity: 1,
          },
        ],
        customData: {
          "bandId": bandId
        },
        email: bandEmail, 
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

    // Token'dan bandId ve bandEmail al
    let bandId, bandEmail;
    try {
      const payload = JSON.parse(atob(token.split('.')[1])); // Token'ın payload kısmını base64'ten çöz
      bandId = payload.id;
      bandEmail = payload.email; // E-posta bilgisini alıyoruz
      console.log("bandId ve bandEmail token'dan başarıyla çözüldü:", bandId, bandEmail);
    } catch (error) {
      console.error("Token çözme hatası:", error);
      alert(t('invalidLoginInfo'));
      return;
    }

    // Eğer bandId veya bandEmail hala geçerli değilse, ödeme başlatma
    if (!bandId || !bandEmail) {
      console.error("bandId veya bandEmail bulunamadı veya geçersiz.");
      alert(t('invalidUserInfo'));
      return;
    }

    if (window.Paddle) {
      console.log("Yıllık abonelik başlatılıyor. bandId:", bandId);
      // Paddle entegrasyonu: yıllık abonelik için checkout penceresini aç
      window.Paddle.Checkout.open({
        items: [
          {
            priceId: "pri_01jc2tb9wx6gs2896e8t5r34tt",
            quantity: 1,
          },
        ],
        customData: {
          "bandId": bandId  // bandId'yi customData olarak gönderiyoruz
        },
        email: bandEmail, // Müşteri e-posta adresini email alanında gönderiyoruz
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
    <Box sx={{ py: 4, textAlign: 'center', backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
      <Typography variant="h3" gutterBottom>{t('subscriptionPlans')}</Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mt: 4 }}>
        <Card sx={{ minWidth: 275, boxShadow: 3 }}>
          <CardContent>
            <CalendarMonthIcon sx={{ fontSize: 40, color: 'secondary.main' }} />
            <Typography variant="h5" component="div" sx={{ mt: 2 }}>{t('monthlySubscription')}</Typography>
            <Typography variant="h4" sx={{ mt: 2 }}>$9.99</Typography>
            <Typography variant="body2" sx={{ mt: 2 }}>
              {t('monthlySubscriptionDescription')}
            </Typography>
          </CardContent>
          <CardActions>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleMonthlySubscription}
              sx={{ mx: 'auto' }}
              disabled={!isLoggedIn}
            >
              {t('subscribeNow')}
            </Button>
          </CardActions>
        </Card>
        <Card sx={{ minWidth: 275, boxShadow: 3 }}>
          <CardContent>
            <MonetizationOnIcon sx={{ fontSize: 40, color: 'success.main' }} />
            <Typography variant="h5" component="div" sx={{ mt: 2 }}>{t('yearlySubscription')}</Typography>
            <Typography variant="h4" sx={{ mt: 2 }}>$96.00</Typography>
            <Typography variant="body2" sx={{ mt: 2 }}>
              {t('yearlySubscriptionDescription')}
            </Typography>
          </CardContent>
          <CardActions>
            <Button
              variant="contained"
              color="success"
              onClick={handleYearlySubscription}
              sx={{ mx: 'auto' }}
              disabled={!isLoggedIn}
            >
              {t('subscribeNow')}
            </Button>
          </CardActions>
        </Card>
      </Box>
    </Box>
  );
};

export { PricesSection };

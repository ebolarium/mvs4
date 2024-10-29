import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next'; // t fonksiyonunu kullanmak için ekledik

const AboutUsSection = () => {
    const { t } = useTranslation(); // useTranslation hook'unu kullanarak t fonksiyonunu elde ettik

    return (
      <Box sx={{ py: 10, backgroundColor: 'rgba(41, 41, 41, 0.8)', color: '#fff' }}>
        <Container maxWidth="lg">
          <Typography variant="h4" align="center" gutterBottom>
            {t('about_us.title')}  {/* 'About Us' metni yerine çevirilebilir anahtar kullandık */}
          </Typography>
          <Typography variant="body1" align="center" sx={{ maxWidth: 800, mx: 'auto' }}>
            {t('about_us.description')} {/* Açıklama metni için çevirilebilir anahtar kullandık */}
          </Typography>
        </Container>
      </Box>
    );
};

export { AboutUsSection };

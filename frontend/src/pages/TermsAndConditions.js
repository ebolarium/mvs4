import React from 'react';
import { Container, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

const TermsAndConditions = () => {
  const { t } = useTranslation();
  
  return (
    <Container style={{ padding: '20px', marginTop: '50px' }}>
      <Typography variant="h4" gutterBottom>{t('terms_and_conditions')}</Typography>
      <Typography variant="body1">
        {t('terms_content')} {/* Buraya kullanım koşulları metnini ekleyin */}
      </Typography>
    </Container>
  );
};

export default TermsAndConditions;

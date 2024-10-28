import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';

const TermsAndConditions = () => {
  const { t } = useTranslation();

  const sections = [
    { title: t('terms_content.section_1_title'), body: t('terms_content.section_1_body') },
    { title: t('terms_content.section_2_title'), body: t('terms_content.section_2_body') },
    { title: t('terms_content.section_3_title'), body: t('terms_content.section_3_body') },
    { title: t('terms_content.section_4_title'), body: t('terms_content.section_4_body') },
    { title: t('terms_content.section_5_title'), body: t('terms_content.section_5_body') },
    { title: t('terms_content.section_6_title'), body: t('terms_content.section_6_body') },
    { title: t('terms_content.section_7_title'), body: t('terms_content.section_7_body') },
    { title: t('terms_content.section_8_title'), body: t('terms_content.section_8_body') },
    { title: t('terms_content.section_9_title'), body: t('terms_content.section_9_body') },
    { title: t('terms_content.section_10_title'), body: t('terms_content.section_10_body') },
    { title: t('terms_content.section_11_title'), body: t('terms_content.section_11_body') },
  ];

  return (
    <Container style={{ padding: '40px', marginTop: '50px' }}>
      <Typography variant="h4" gutterBottom align="center">
        {t('terms_and_conditions')}
      </Typography>

      <Box sx={{ mt: 3 }}>
        {sections.map((section, index) => (
          <Box key={index} sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              {section.title}
            </Typography>
            <Typography paragraph>{section.body}</Typography>
          </Box>
        ))}
      </Box>
    </Container>
  );
};

export default TermsAndConditions;

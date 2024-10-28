import React from 'react';
import { Container, Typography, Box, Link } from '@mui/material';
import CommonAppBar from './CommonAppBar';


const PrivacyPolicy = () => {
  return (
    <>
    <CommonAppBar isLoggedIn={false} /> {/* AppBar bileşeni eklendi */}

    <Container maxWidth="md" sx={{ py: 8 }}>
      <Typography variant="h4" gutterBottom align="center">
        Privacy Policy
      </Typography>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          1. Data Collection
        </Typography>
        <Typography paragraph>
          We collect personal information necessary to provide our services, such as name, email address, and payment details.
        </Typography>

        <Typography variant="h6" gutterBottom>
          2. Use of Information
        </Typography>
        <Typography paragraph>
          The information collected is used to process payments, provide customer support, and improve our services.
        </Typography>

        <Typography variant="h6" gutterBottom>
          3. Sharing of Information
        </Typography>
        <Typography paragraph>
          We do not share your personal data with third parties except as required by law or for payment processing.
        </Typography>

        <Typography variant="h6" gutterBottom>
          4. Data Security
        </Typography>
        <Typography paragraph>
          We use encryption and other security measures to protect your personal data.
        </Typography>

        <Typography variant="h6" gutterBottom>
          5. User Rights
        </Typography>
        <Typography paragraph>
          You can request access to, correction, or deletion of your personal data by contacting us at{' '}
          <Link href="mailto:support@votesong.live" underline="hover">
            support@votesong.live
          </Link>.
        </Typography>

        <Typography variant="h6" gutterBottom>
          6. Changes to Privacy Policy
        </Typography>
        <Typography paragraph>
          We may update this privacy policy periodically. Continued use of our services constitutes your acceptance of the new terms.
        </Typography>
      </Box>
    </Container>
    </>
  );
};

export default PrivacyPolicy;

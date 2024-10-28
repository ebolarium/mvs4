import React from 'react';
import { Container, Typography, Box, Link } from '@mui/material';
import CommonAppBar from './CommonAppBar';


const TermsOfService = () => {
  return (
<>
    <CommonAppBar isLoggedIn={false} /> {/* AppBar bileşeni eklendi */}

    <Container maxWidth="md" sx={{ py: 8 }}>
      <Typography variant="h4" gutterBottom align="center">
        Terms of Service
      </Typography>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          1. Acceptance of Terms
        </Typography>
        <Typography paragraph>
          By using our services, you agree to be bound by these terms. If you do not accept these terms, please do not use our services.
        </Typography>

        <Typography variant="h6" gutterBottom>
          2. Use of Services
        </Typography>
        <Typography paragraph>
          You agree to use our services in compliance with applicable laws. You are responsible for all activities conducted through your account.
        </Typography>

        <Typography variant="h6" gutterBottom>
          3. Payments and Billing
        </Typography>
        <Typography paragraph>
          All fees are non-refundable unless otherwise stated. By subscribing, you authorize us to charge your payment method for the agreed amount.
        </Typography>

        <Typography variant="h6" gutterBottom>
          4. Termination
        </Typography>
        <Typography paragraph>
          We reserve the right to terminate or suspend access to our services if you violate these terms.
        </Typography>

        <Typography variant="h6" gutterBottom>
          5. Limitation of Liability
        </Typography>
        <Typography paragraph>
          We are not responsible for any indirect or consequential damages arising from the use of our services.
        </Typography>

        <Typography variant="h6" gutterBottom>
          6. Changes to Terms
        </Typography>
        <Typography paragraph>
          We may update these terms from time to time. Continued use of the services indicates your acceptance of the new terms.
        </Typography>

        <Typography variant="body1" gutterBottom>
          For any questions, please contact us at{' '}
          <Link href="mailto:support@votesong.live" underline="hover">
support@votesong.live          </Link>.
        </Typography>
      </Box>
    </Container>
    </>
  );
};

export default TermsOfService;

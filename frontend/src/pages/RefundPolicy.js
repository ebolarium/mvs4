import React from 'react';
import { Container, Typography, Box, Link } from '@mui/material';
import CommonAppBar from './CommonAppBar';

const RefundPolicy = () => {
  return (
    <>
    <CommonAppBar isLoggedIn={false} /> {/* AppBar bileşeni eklendi */}

    <Container maxWidth="md" sx={{ py: 8 }}>
      <Typography variant="h4" gutterBottom align="center">
        Refund Policy
      </Typography>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          1. Eligibility for Refunds
        </Typography>
        <Typography paragraph>
          Refunds are only provided under the following conditions:
        </Typography>
        <ul>
          <li>Service was not delivered as promised.</li>
          <li>Technical issues that prevented the use of the service.</li>
        </ul>

        <Typography variant="h6" gutterBottom>
          2. Non-Refundable Items
        </Typography>
        <Typography paragraph>
          Subscription fees are non-refundable after the trial period, if applicable.
        </Typography>

        <Typography variant="h6" gutterBottom>
          3. Refund Process
        </Typography>
        <Typography paragraph>
          To request a refund, please contact us at{' '}
          <Link href="mailto:support@votesong.live" underline="hover">
            support@votesong.live
          </Link>{' '}
          with your payment details.
        </Typography>

        <Typography variant="h6" gutterBottom>
          4. Timeframe for Refunds
        </Typography>
        <Typography paragraph>
          Refunds will be processed within 7-10 business days after approval.
        </Typography>

        <Typography variant="h6" gutterBottom>
          5. Changes to Refund Policy
        </Typography>
        <Typography paragraph>
          We reserve the right to modify this refund policy at any time.
        </Typography>
      </Box>
    </Container>
    </>
  );
};

export default RefundPolicy;

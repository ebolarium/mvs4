import React from 'react';
import { Box, Container, Grid, Card, CardContent, Typography } from '@mui/material';
import AddRepertoireImage from '../assets/add_repertoire.png';
import CreatePlaylistImage from '../assets/create_playlist.png';
import ShareQRImage from '../assets/share_qr.png';
import MonitorVotesImage from '../assets/monitor_votes.png';

const HowItWorksSection = () => {
  return (
    <Box sx={{ py: 5, backgroundColor: 'rgba(255, 255, 255, 0.5)' }}>
      <Container maxWidth="md">
        <Typography variant="h4" align="center" gutterBottom>
          How It Works
        </Typography>
        <Grid container spacing={5} justifyContent="center">
          {/* Add Your Repertoire Card */}
          <Grid item xs={12} md={6} lg={3}>
            <Card>
              <CardContent>
                <img src={AddRepertoireImage} alt="Add Your Repertoire" style={{ width: '100%' }} />
                <Typography variant="h6" align="center" gutterBottom>
                  Add Your Repertoire
                </Typography>
                <Typography variant="body2" align="center">
                  Easily add all of your songs to create a comprehensive list of your music.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Create a Playlist Card */}
          <Grid item xs={12} md={6} lg={3}>
            <Card>
              <CardContent>
                <img src={CreatePlaylistImage} alt="Create a Playlist" style={{ width: '100%' }} />
                <Typography variant="h6" align="center" gutterBottom>
                  Create a Playlist
                </Typography>
                <Typography variant="body2" align="center">
                  Build customized playlists to suit the event or audience.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Share the QR Card */}
          <Grid item xs={12} md={6} lg={3}>
            <Card>
              <CardContent>
                <img src={ShareQRImage} alt="Share the QR" style={{ width: '100%' }} />
                <Typography variant="h6" align="center" gutterBottom>
                  Share the QR
                </Typography>
                <Typography variant="body2" align="center">
                  Share a QR code with your audience so they can easily access and vote.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Monitor Votes Card */}
          <Grid item xs={12} md={6} lg={3}>
            <Card>
              <CardContent>
                <img src={MonitorVotesImage} alt="Monitor Votes" style={{ width: '100%' }} />
                <Typography variant="h6" align="center" gutterBottom>
                  Monitor Votes
                </Typography>
                <Typography variant="body2" align="center">
                  Keep track of votes in real-time to see which songs are most popular.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};


const AboutUsSection = () => {
    return (
      <Box sx={{ py: 10, backgroundColor: 'rgba(41, 41, 41, 0.8)', color: '#fff' }}>
        <Container maxWidth="lg">
          <Typography variant="h4" align="center" gutterBottom>
            About Us
          </Typography>
          <Typography variant="body1" align="center" sx={{ maxWidth: 800, mx: 'auto' }}>
            We are dedicated to bringing musicians and their audiences closer together by providing an interactive platform that makes live music experiences more engaging. Our mission is to help bands create unforgettable moments by letting the audience participate and choose their favorite songs in real-time.
          </Typography>
        </Container>
      </Box>
    );
  };
  
  export { HowItWorksSection, AboutUsSection };
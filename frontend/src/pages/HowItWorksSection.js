// HowItWorksSection.js

import React from 'react';
import { Box, Container, Grid, Card, CardContent, Typography, Button } from '@mui/material';
import AddRepertoireImage from '../assets/add_repertoire.png';
import CreatePlaylistImage from '../assets/create_playlist.png';
import ShareQRImage from '../assets/share_qr.png';
import MonitorVotesImage from '../assets/monitor_votes.png';
import { useTranslation } from 'react-i18next'; // t fonksiyonunu kullanmak için ekledik


const HowItWorksSection = () => {
  return (
    <Box sx={{ py: 5, backgroundColor: 'rgba(255, 255, 255, 0.5)' }}>
      <Container maxWidth="md">
        <Typography variant="h4" align="center" gutterBottom>
          How It Works
        </Typography>
        <Grid container spacing={5} justifyContent="center">
          {[
            { img: AddRepertoireImage, title: 'Add Your Repertoire', desc: 'Easily add all of your songs to create a comprehensive list of your music.' },
            { img: CreatePlaylistImage, title: 'Create a Playlist', desc: 'Build customized playlists to suit the event or audience.' },
            { img: ShareQRImage, title: 'Share the QR', desc: 'Share a QR code with your audience so they can easily access and vote.' },
            { img: MonitorVotesImage, title: 'Monitor Votes', desc: 'Keep track of votes in real-time to see which songs are most popular.' },
          ].map((item, index) => (
            <Grid item xs={12} md={6} lg={3} key={index}>
              <Card>
                <CardContent>
                  <img src={item.img} alt={item.title} style={{ width: '100%' }} />
                  <Typography variant="h6" align="center" gutterBottom>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" align="center">
                    {item.desc}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};


export { HowItWorksSection };

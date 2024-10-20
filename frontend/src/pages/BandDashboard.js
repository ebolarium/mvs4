// Updated BandDashboard.js
import React, { useEffect, useState, useContext } from 'react';
import { Container, Row, Col, Tab, Nav, Card, Button } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import Songs from './Songs';
import Playlists from './Playlists';
import GigMode from './GigMode';
import Analytics from './Analytics';
import Loader from './Loader';
import { GlobalStateContext } from '../context/GlobalStateProvider';
import { useTranslation } from 'react-i18next';
import API_BASE_URL from '../config/apiConfig';
import Logo from '../assets/VoteSong_Logo.gif';
import { Typography } from '@mui/material';




const BandDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [playlistId, setPlaylistId] = useState(null);
  const [loading, setLoading] = useState(true);
  const { state } = useContext(GlobalStateContext);
  const [bandName, setBandName] = useState(''); // Kullanıcı adı için state


  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert(t('login_required'));
      navigate('/');
      return;
    }



    // Kullanıcı bilgilerini almak için API isteği
    fetch(`${API_BASE_URL}/bands/profile`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(t('error_fetching_band_profile'));
        }
        return response.json();
      })
      .then((data) => {
        if (data && data.band && data.band.band_name) {
          setBandName(data.band.band_name);
        }
      })
      .catch((error) => console.error(t('error_fetching_band_profile'), error));





    fetch(`${API_BASE_URL}/playlist/current`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        if (response.status === 404) {
          setPlaylistId(null);
          return null;
        }
        if (!response.ok) {
          throw new Error(t('error_fetching_current_playlist'));
        }
        return response.json();
      })
      .then((data) => {
        if (data && data.playlist && data.playlist._id) {
          setPlaylistId(data.playlist._id);
        }
      })
      .catch((error) => console.error(t('error_fetching_current_playlist'), error))
      .finally(() => setLoading(false));
  }, [navigate, t]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    alert(t('logged_out_successfully'));
    navigate('/');
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <>
           <div style={{
        backgroundColor: '#1c1c1c',
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        color: '#fff'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src={Logo} alt={t('vote_song_logo')} width={40} style={{ borderRadius: '50%' }} />
          <Typography variant="h6">{t('vote_song')}</Typography>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Typography variant="body1">{t('welcome_band')}, {bandName}</Typography> {/* Kullanıcı adı burada gösteriliyor */}
          <Button variant="info" as={Link} to="/profile" className="me-2">
            {t('edit_profile')}
          </Button>
          <Button variant="danger" onClick={handleLogout}>
            {t('logout')}
          </Button>
        </div>
      </div>

      <Container className="mt-5">
        <Row>
          <Col>
            <Card className="shadow">
              <Card.Body>
                <h2 className="text-center mb-4">{t('band_dashboard')}</h2>
                <Tab.Container defaultActiveKey="analytics">
                  <Nav variant="tabs" className="justify-content-center">
                    <Nav.Item>
                      <Nav.Link eventKey="analytics">{t('analytics')}</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="songs">{t('songs')}</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="playlists">{t('playlists')}</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="gigmode">{t('gig_mode')}</Nav.Link>
                    </Nav.Item>
                  </Nav>
                  <Tab.Content className="mt-4">
                    <Tab.Pane eventKey="analytics">
                      <Analytics />
                    </Tab.Pane>
                    <Tab.Pane eventKey="songs">
                      <Songs />
                    </Tab.Pane>
                    <Tab.Pane eventKey="playlists">
                      <Playlists />
                    </Tab.Pane>
                    <Tab.Pane eventKey="gigmode">
                      {playlistId ? (
                        <GigMode playlistId={playlistId} />
                      ) : (
                        <p>{t('no_published_playlist_found')}</p>
                      )}
                    </Tab.Pane>
                  </Tab.Content>
                </Tab.Container>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default BandDashboard;

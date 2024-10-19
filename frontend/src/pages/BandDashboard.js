import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Tab, Nav, Card, Button } from 'react-bootstrap';
import Songs from './Songs';
import Playlists from './Playlists';
import GigMode from './GigMode';
import Analytics from './Analytics';
import Loader from './Loader'; // Loader bileşeni eklendi.
import API_BASE_URL from '../config/apiConfig';
import { GlobalStateContext } from '../context/GlobalStateProvider';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const BandDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [playlistId, setPlaylistId] = useState(null);
  const [loading, setLoading] = useState(true); // Yükleme state'i
  const { state, socket } = useContext(GlobalStateContext);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert(t('login_required'));
      navigate('/');
      return;
    }

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
      .finally(() => setLoading(false)); // Yükleme tamamlandığında spinner kapatılır.
  }, [navigate, t]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    alert(t('logged_out_successfully'));
    navigate('/');
  };

  if (loading) {
    return <Loader />; // Yükleme sırasında spinner göster.
  }

  return (
    <Container className="mt-5">
      <Row>
        <Col>
          <Card className="shadow">
            <Card.Body>
              <h2 className="text-center mb-4">{t('band_dashboard')}</h2>
              <Button variant="danger" onClick={handleLogout}>
                {t('logout')}
              </Button>
              <Button variant="info" as={Link} to="/profile" className="ms-2">
                {t('edit_profile')}
              </Button>
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
  );
};

export default BandDashboard;

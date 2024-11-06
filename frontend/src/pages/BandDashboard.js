// Updated BandDashboard.js
import React, { useEffect, useState, useContext } from 'react';
import { Container, Row, Col, Tab, Nav, Card, Button, Modal, Form, Alert } from 'react-bootstrap';
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
import { OverlayTrigger, Tooltip } from 'react-bootstrap';




const BandDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [playlistId, setPlaylistId] = useState(null);
  const [loading, setLoading] = useState(true);
  const { state } = useContext(GlobalStateContext);
  const [bandName, setBandName] = useState(''); // Kullanıcı adı için state
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState(''); // Hata mesajı için state
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [successMessage, setSuccessMessage] = useState('');
  const [bandEmail, setBandEmail] = useState('');
  const [isPremium, setIsPremium] = useState(false); // Premium kontrolü için state




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

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };



  const renderTooltip = (props) => (
    <Tooltip id="button-tooltip" {...props}>
      Premium Only
    </Tooltip>
  );
  


  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_BASE_URL}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: bandName, 
          email: bandEmail, 
          message: formData.message 
        }),
      });

      if (response.ok) {
        setSuccessMessage('Hata bildiriminiz başarıyla gönderildi.');
        setFormData({ message: '' });
      } else {
        setErrorMessage('Hata bildirimi gönderilemedi.');
      }
    } catch (error) {
      setErrorMessage('Sunucu hatası: ' + error.message);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert(t('login_required'));
      navigate('/');
    } else {
      // Kullanıcı bilgilerini çek
      fetch(`${API_BASE_URL}/bands/profile`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
        .then((res) => res.json())
        .then((data) => {
          setBandName(data.band.band_name);
          setBandEmail(data.band.band_email);
          setIsPremium(data.band.is_premium); // Premium bilgisini set et

        })
        .catch((err) => console.error(err));
    }
  }, [navigate, t]);

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
          <Link to="/#" style={{ textDecoration: 'none', color: 'inherit' }}>
          <Typography variant="h6">{t('vote_song')}</Typography>
          </Link>        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Typography variant="body1">{t('welcome_band')}, {bandName}</Typography> {/* Kullanıcı adı burada gösteriliyor */}
          <Button variant="info" as={Link} to="/profile" className="me-2">
            {t('edit_profile')}
          </Button>
          <Button variant="warning" onClick={handleOpenModal}>
            Hata Bildir
          </Button>
          <Button variant="danger" onClick={handleLogout}>
            {t('logout')}
          </Button>

        </div>
      </div>

      <Modal show={showModal} onHide={handleCloseModal} size="sm" centered>
        <Modal.Header closeButton>
          <Modal.Title>Hata Bildir</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="message">
              <Form.Label>Mesaj</Form.Label>
              <Form.Control
                as="textarea"
                name="message"
                rows={3}
                value={formData.message}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Button type="submit" variant="primary" className="mt-3 w-100">
              Gönder
            </Button>
          </Form>
          {errorMessage && <Alert variant="danger" className="mt-3">{errorMessage}</Alert>}
          {successMessage && <Alert variant="success" className="mt-3">{successMessage}</Alert>}
        </Modal.Body>
      </Modal>

      <Container className="mt-5">
        <Row>
          <Col>
            <Card className="shadow">
              <Card.Body>
                <h2 className="text-center mb-4">{t('band_dashboard')}</h2>
                <Tab.Container defaultActiveKey="songs">
                <Nav variant="tabs" className="justify-content-center">
  <Nav.Item>
    <OverlayTrigger
      placement="top"
      overlay={!isPremium ? renderTooltip : <></>} // Premium değilse tooltip göster
    >
      <span>
        <Nav.Link eventKey="analytics" disabled={!isPremium}>
          {t('analytics')}
        </Nav.Link>
      </span>
    </OverlayTrigger>
  </Nav.Item>

  <Nav.Item>
    <Nav.Link eventKey="songs">{t('songs')}</Nav.Link>
  </Nav.Item>

  <Nav.Item>
    <Nav.Link eventKey="playlists">{t('playlists')}</Nav.Link>
  </Nav.Item>

  <Nav.Item>
    <OverlayTrigger
      placement="top"
      overlay={!isPremium ? renderTooltip : <></>} // Premium değilse tooltip göster
    >
      <span>
        <Nav.Link eventKey="gigmode" disabled={!isPremium}>
          {t('gig_mode')}
        </Nav.Link>
      </span>
    </OverlayTrigger>
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

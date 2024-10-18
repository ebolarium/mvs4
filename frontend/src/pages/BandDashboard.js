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

const BandDashboard = () => {
  const navigate = useNavigate();
  const [playlistId, setPlaylistId] = useState(null);
  const [loading, setLoading] = useState(true); // Yükleme state'i
  const { state, socket } = useContext(GlobalStateContext);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You need to login first');
      navigate('/login');
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
          throw new Error('Failed to fetch current playlist');
        }
        return response.json();
      })
      .then((data) => {
        if (data && data.playlist && data.playlist._id) {
          setPlaylistId(data.playlist._id);
        }
      })
      .catch((error) => console.error('Error fetching current playlist:', error))
      .finally(() => setLoading(false)); // Yükleme tamamlandığında spinner kapatılır.
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    alert('Logged out successfully!');
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
              <h2 className="text-center mb-4">Band Dashboard</h2>
              <Button variant="danger" onClick={handleLogout}>
                Logout
              </Button>
              <Button variant="info" as={Link} to="/profile" className="ms-2">
                Edit Profile
              </Button>
              <Tab.Container defaultActiveKey="analytics">
                <Nav variant="tabs" className="justify-content-center">
                  <Nav.Item>
                    <Nav.Link eventKey="analytics">Analytics</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="songs">Songs</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="playlists">Playlists</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="gigmode">Gig Mode</Nav.Link>
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
                      <p>No published playlist found</p>
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

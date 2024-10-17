// Homepage.js
import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './Homepage.css'; // Daha iyi stil yönetimi için ayrı bir CSS dosyası
import P_Logo from '../P_Logo.png'; // Logo dosyasını içe aktarıyoruz

const Homepage = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
  };

  const handleRegister = () => {
    navigate('/register');
  };

  return (
    <Container className="homepage d-flex flex-column justify-content-center align-items-center min-vh-100">
      <Row className="mb-5 text-center">
        <Col>
          <img src={P_Logo} alt="Pechete Logo" className="homepage-logo mb-4" width={180} />
          <h1 className="display-3">Welcome to Pechete</h1>
          <p className="lead">
            Connect with your audience and make your music stand out. Join Pechete today and create unforgettable
            experiences with your fans.
          </p>
        </Col>
      </Row>
      <Row>
        <Col md={6} className="d-flex justify-content-center mb-3">
          <Card className="shadow-lg">
            <Card.Body className="text-center">
              <h2 className="mb-4">Login</h2>
              <p>Already have an account? Log in now and continue where you left off.</p>
              <Button variant="primary" onClick={handleLogin} className="w-100">
                Login
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} className="d-flex justify-content-center">
          <Card className="shadow-lg">
            <Card.Body className="text-center">
              <h2 className="mb-4">Register</h2>
              <p>Don't have an account? Sign up now and be part of the Pechete community.</p>
              <Button variant="success" onClick={handleRegister} className="w-100">
                Register
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Homepage;
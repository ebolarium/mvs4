// Login.js
import React, { useState } from 'react';
import { Container, Form, Button, Row, Col, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config/apiConfig';


const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
    const response = await fetch(`${API_BASE_URL}/bands/login`, {

        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          band_email: email,
          band_password: password,
        }),
        // credentials: 'include'  // Kimlik doğrulama bilgileri için

      });

      const data = await response.json();
      if (response.ok) {
        // Giriş başarılı, tokenı localStorage'a kaydet
        localStorage.setItem('token', data.token);
        // Giriş sonrası dashboard'a yönlendirme
        navigate('/dashboard');
      } else {
        setErrorMessage(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('An error occurred while logging in.');
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-100">
      <Row>
        <Col>
          <Card className="p-4 shadow">
            <Card.Body>
              <h2 className="mb-4 text-center">Pechete Login</h2>
              {errorMessage && <p className="text-danger text-center">{errorMessage}</p>}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formEmail">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formPassword">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                  />
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100">
                  Login
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;

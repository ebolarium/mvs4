import React, { useState } from 'react';
import { Form, Button, Card } from 'react-bootstrap';
import API_BASE_URL from '../config/apiConfig';

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

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
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        onLoginSuccess(); // Başarılı giriş sonrası callback'i tetikliyoruz
      } else {
        setErrorMessage(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('An error occurred while logging in.');
    }
  };

  return (
    <Card className="p-4 shadow">
      <Card.Body>
        <h2 className="mb-4 text-center">Login</h2>
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
  );
};

export default Login;

import React, { useState } from 'react';
import { Form, Button, Card } from 'react-bootstrap';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config/apiConfig';

const RegisterBand = () => {
  const [formData, setFormData] = useState({
    band_name: '',
    band_email: '',
    band_password: '',
    band_confirm_password: ''
  });

  const { band_name, band_email, band_password, band_confirm_password } = formData;
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (band_password !== band_confirm_password) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    const band_id = uuidv4();

    try {
      const response = await fetch(`${API_BASE_URL}/bands/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          band_id,
          band_name,
          band_email,
          band_password
        }),
      });

      const data = await response.json();
      if (response.ok) {
        // Token'ı localStorage'a kaydet ve dashboard'a yönlendir
        localStorage.setItem('token', data.token);
        alert('Band registered successfully!');
        setFormData({
          band_name: '',
          band_email: '',
          band_password: '',
          band_confirm_password: ''
        });
        setErrorMessage('');
        navigate('/'); // Kullanıcıyı dashboard'a yönlendir
      } else {
        setErrorMessage(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('An error occurred while registering the band.');
    }
  };

  return (
    <Card className="shadow-sm" style={{ padding: '20px', borderRadius: '10px' }}>
      <Card.Body>
        <h2 className="text-center mb-3">Band Registration</h2>
        {errorMessage && <p className="text-danger text-center">{errorMessage}</p>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-2" controlId="formBandName">
            <Form.Label>Band Name</Form.Label>
            <Form.Control
              type="text"
              name="band_name"
              value={band_name}
              onChange={handleChange}
              placeholder="Enter Band Name"
              required
            />
          </Form.Group>

          <Form.Group className="mb-2" controlId="formBandEmail">
            <Form.Label>Band Email</Form.Label>
            <Form.Control
              type="email"
              name="band_email"
              value={band_email}
              onChange={handleChange}
              placeholder="Enter Band Email"
              required
            />
          </Form.Group>

          <Form.Group className="mb-2" controlId="formBandPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              name="band_password"
              value={band_password}
              onChange={handleChange}
              placeholder="Enter Password"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formConfirmPassword">
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control
              type="password"
              name="band_confirm_password"
              value={band_confirm_password}
              onChange={handleChange}
              placeholder="Confirm Password"
              required
            />
          </Form.Group>

          <Button variant="primary" type="submit" className="w-100">
            Register
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default RegisterBand;

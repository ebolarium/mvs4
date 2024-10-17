import React, { useState } from 'react';
import { Container, Form, Button, Row, Col, Card } from 'react-bootstrap';
import { v4 as uuidv4 } from 'uuid'; // UUID ile otomatik band_id oluşturmak için
import { useNavigate } from 'react-router-dom'; // Yönlendirme için gerekli
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
  const navigate = useNavigate(); // Yönlendirme için hook

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
        alert('Band registered successfully!');
        setFormData({
          band_name: '',
          band_email: '',
          band_password: '',
          band_confirm_password: ''
        });
        setErrorMessage('');
        navigate('/login'); // Başarıyla kayıt olduktan sonra login sayfasına yönlendirme
      } else {
        setErrorMessage(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('An error occurred while registering the band.');
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-100">
      <Row>
        <Col>
          <Card className="p-4 shadow">
            <Card.Body>
              <h2 className="mb-4 text-center">Pechete Band Registration</h2>
              {errorMessage && <p className="text-danger text-center">{errorMessage}</p>}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formBandName">
                  <Form.Label>Band Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="band_name"
                    value={band_name}
                    onChange={handleChange}
                    placeholder="Band Name"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBandEmail">
                  <Form.Label>Band Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="band_email"
                    value={band_email}
                    onChange={handleChange}
                    placeholder="Band Email"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBandPassword">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="band_password"
                    value={band_password}
                    onChange={handleChange}
                    placeholder="Password"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-4" controlId="formConfirmPassword">
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
        </Col>
      </Row>
    </Container>
  );
};

export default RegisterBand;

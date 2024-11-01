// Login.js
import React, { useState } from 'react';
import { Form, Button, Card } from 'react-bootstrap';
import API_BASE_URL from '../config/apiConfig';
import { useTranslation } from 'react-i18next';
import VerificationModal from './VerificationModal';
import { useNavigate } from 'react-router-dom';

const Login = ({ onLoginSuccess }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
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
      });

      const data = await response.json();
      console.log('Login Response:', data); // Yanıtı kontrol etmek için ekledik

      if (response.ok) {
        if (data.is_verified === true) {
          localStorage.setItem('token', data.token);
          onLoginSuccess(); // Başarılı login sonrası yönlendir
        } else {
          setShowModal(true); // Doğrulama gerekliyse modal göster
        }
      } else {
        setErrorMessage(`Error: ${t(data.message)}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage(t('error_logging_in'));
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    navigate('/'); // Ana sayfaya yönlendir
  };

  return (
    <Card className="p-4 shadow">
      <Card.Body>
        <h2 className="mb-4 text-center">{t('login')}</h2>
        {errorMessage && <p className="text-danger text-center">{errorMessage}</p>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="formEmail">
            <Form.Label>{t('email')}</Form.Label>
            <Form.Control
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('enter_email')}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formPassword">
            <Form.Label>{t('password')}</Form.Label>
            <Form.Control
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('enter_password')}
              required
            />
          </Form.Group>

          <Button variant="primary" type="submit" className="w-100">
            {t('login')}
          </Button>
        </Form>
      </Card.Body>

      <VerificationModal
        show={showModal}
        onClose={handleModalClose}
        message="Please verify your email to login."
      />
    </Card>
  );
};

export default Login;

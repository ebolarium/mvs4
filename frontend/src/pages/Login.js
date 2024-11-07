// Login.js
import React, { useState } from 'react';
import { Form, Button, Card, Modal } from 'react-bootstrap';
import API_BASE_URL from '../config/apiConfig';
import { useTranslation } from 'react-i18next';
import VerificationModal from './VerificationModal';
import { useNavigate } from 'react-router-dom';
import LockIcon from '@mui/icons-material/Lock'; // Material UI'dan Kilit simgesi ekliyoruz


const Login = ({ onLoginSuccess }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
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
      if (response.ok) {
        if (data.is_verified === true) {
          localStorage.setItem('token', data.token);
          onLoginSuccess();
        } else {
          setShowModal(true);
        }
      } else {
        setErrorMessage(`Error: ${t(data.message)}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage(t('error_logging_in'));
    }
  };

  const handleForgotPassword = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/send-reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: forgotEmail }),
      });

      if (response.ok) {
        alert(t('passwordResetLinkSent'));
        setForgotPasswordOpen(false);
      } else {
        alert(t('errorOccurred'));
      }
    } catch (error) {
      console.error('Error sending password reset link:', error);
      alert(t('errorOccurred'));
    }
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
        <Button variant="link" onClick={() => setForgotPasswordOpen(true)} className="mt-3">
          {t('forgotPassword')}
        </Button>
      </Card.Body>

      <VerificationModal show={showModal} onClose={() => setShowModal(false)} message="Please verify your email to login." />

      {/* Forgot Password Modal */}
      <Modal show={forgotPasswordOpen} onHide={() => setForgotPasswordOpen(false)} centered>

        <Modal.Header closeButton>
          <Modal.Title>
            <LockIcon style={{ fontSize: 40, marginRight: '10px', color: '#1976d2' }} />
            {t('resetPassword')}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3" controlId="formForgotEmail">
            <Form.Label>{t('email')}</Form.Label>
            <Form.Control
              type="email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              placeholder={t('enter_email')}
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleForgotPassword}>
            {t('sendResetLink')}
          </Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
};

export default Login;

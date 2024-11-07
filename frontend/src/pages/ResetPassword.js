// ResetPassword.js
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Button, Card } from 'react-bootstrap';
import API_BASE_URL from '../config/apiConfig';
import { useTranslation } from 'react-i18next';

const ResetPassword = () => {
  const { token } = useParams(); // URL'den token'ı almak için
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleResetPassword = async (e) => {
    e.preventDefault();
  
    if (newPassword !== confirmPassword) {
      setErrorMessage(t('passwords_do_not_match'));
      return;
    }
  
    try {
      const response = await fetch(`${API_BASE_URL}/bands/reset-password/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newPassword }), // newPassword alanını gönderiyoruz
      });
  
      const data = await response.json();
  
      if (response.ok) {
        setSuccessMessage(t('passwordResetSuccessful'));
        setTimeout(() => navigate('/'), 3000);
      } else {
        setErrorMessage(t(data.message));
      }
    } catch (error) {
      console.error('Error resetting password:', error.message);
      setErrorMessage(t('errorOccurred'));
    }
  };
  

  return (
    <Card className="p-4 shadow mx-auto" style={{ maxWidth: '400px', marginTop: '50px' }}>
      <Card.Body>
        <h2 className="mb-4 text-center">{t('resetPassword')}</h2>
        {errorMessage && <p className="text-danger text-center">{errorMessage}</p>}
        {successMessage && <p className="text-success text-center">{successMessage}</p>}
        <Form onSubmit={handleResetPassword}>
          <Form.Group className="mb-3" controlId="formNewPassword">
            <Form.Label>{t('newPassword')}</Form.Label>
            <Form.Control
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={t('enterNewPassword')}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formConfirmPassword">
            <Form.Label>{t('confirmPassword')}</Form.Label>
            <Form.Control
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t('confirmNewPassword')}
              required
            />
          </Form.Group>

          <Button variant="primary" type="submit" className="w-100">
            {t('resetPasswordButton')}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default ResetPassword;

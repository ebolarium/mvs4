import React, { useState } from 'react';
import { Form, Button, Card, Modal, Spinner } from 'react-bootstrap';
import { v4 as uuidv4 } from 'uuid';
import API_BASE_URL from '../config/apiConfig';
import { useTranslation } from 'react-i18next';
import { Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const RegisterBand = ({ onRegisterSuccess }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    band_name: '',
    band_email: '',
    band_password: '',
    band_confirm_password: '',
    termsAccepted: false,
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false); // Yükleniyor göstergesi için
  const [showTerms, setShowTerms] = useState(false); // Modal kontrolü

  const { band_name, band_email, band_password, band_confirm_password, termsAccepted } = formData;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (band_password !== band_confirm_password) {
      setErrorMessage(t('passwords_do_not_match'));
      return;
    }
    if (!termsAccepted) {
      setErrorMessage(t('accept_terms'));
      return;
    }

    const band_id = uuidv4();
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/bands/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ band_id, band_name, band_email, band_password }),
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok) {
        setFormData({
          band_name: '',
          band_email: '',
          band_password: '',
          band_confirm_password: '',
          termsAccepted: false,
        });
        setErrorMessage('');
        onRegisterSuccess();
      } else {
        setErrorMessage(`Error: ${t(data.message)}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage(t('error_registering_band'));
      setLoading(false);
    }
  };

  return (
    <>
      <Card className="shadow-sm" style={{ padding: '20px', borderRadius: '10px' }}>
        <Card.Body>
          <h2 className="text-center mb-3">{t('band_registration')}</h2>
          {errorMessage && <p className="text-danger text-center">{errorMessage}</p>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-2" controlId="formBandName">
              <Form.Label>{t('band_name')}</Form.Label>
              <Form.Control
                type="text"
                name="band_name"
                value={band_name}
                onChange={handleChange}
                placeholder={t('enter_band_name')}
                required
              />
            </Form.Group>

            <Form.Group className="mb-2" controlId="formBandEmail">
              <Form.Label>{t('band_email')}</Form.Label>
              <Form.Control
                type="email"
                name="band_email"
                value={band_email}
                onChange={handleChange}
                placeholder={t('enter_band_email')}
                required
              />
            </Form.Group>

            <Form.Group className="mb-2" controlId="formBandPassword">
              <Form.Label>{t('password')}</Form.Label>
              <Form.Control
                type="password"
                name="band_password"
                value={band_password}
                onChange={handleChange}
                placeholder={t('enter_password')}
                required
                minLength={8} // Şifre minimum uzunluk kontrolü
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formConfirmPassword">
              <Form.Label>{t('confirm_password')}</Form.Label>
              <Form.Control
                type="password"
                name="band_confirm_password"
                value={band_confirm_password}
                onChange={handleChange}
                placeholder={t('confirm_password')}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formTerms">
  <Form.Check
    type="checkbox"
    name="termsAccepted"
    checked={termsAccepted}
    onChange={handleChange}
    label={
      <>
        {t('accept_terms')} {' '}
        <a href="/terms" target="_blank" rel="noopener noreferrer" style={{ marginLeft: '5px' }}>
          {t('view_terms')}
        </a>
      </>
    }
    required
  />
</Form.Group>

            <Button variant="primary" type="submit" className="w-100" disabled={loading}>
              {loading ? <Spinner animation="border" size="sm" /> : t('register')}
            </Button>
          </Form>
        </Card.Body>
      </Card>

 
    </>
  );
};

export default RegisterBand;

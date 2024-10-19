// src/pages/BandProfile.js

import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom'; // useNavigate hook'u eklendi
import API_BASE_URL from '../config/apiConfig';
import { useTranslation } from 'react-i18next';

const BandProfile = () => {
  const { t } = useTranslation();
  const [bandInfo, setBandInfo] = useState({
    band_name: '',
    band_image: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);

  const navigate = useNavigate(); // useNavigate kullanımı

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert(t('login_required'));
      window.location.href = '/';
      return;
    }

    fetch(`${API_BASE_URL}/bands/profile`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(t('error_fetching_band_profile'));
        }
        return response.json();
      })
      .then((data) => {
        setBandInfo(data.band);
      })
      .catch((error) => {
        console.error(t('error_fetching_band_profile'), error);
      });
  }, [t]);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleImageUpload = (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      alert(t('login_required'));
      window.location.href = '/';
      return;
    }

    const formData = new FormData();
    formData.append('band_image', selectedFile);

    fetch(`${API_BASE_URL}/bands/upload-image`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(t('failed_to_upload_image'));
        }
        return response.json();
      })
      .then((data) => {
        setBandInfo({ ...bandInfo, band_image: data.imageUrl });
        alert(t('image_uploaded_successfully'));
      })
      .catch((error) => {
        console.error(t('failed_to_upload_image'), error);
      });
  };

  return (
    <Container className="mt-5">
      <Button variant="secondary" onClick={() => navigate('/dashboard')} className="mb-3">
        ← {t('return_to_dashboard')}
      </Button>
      <Card className="shadow bg-dark text-white">
        <Card.Body>
          <h2 className="text-center mb-4">{t('band_profile')}</h2>
          <div className="text-center mb-4">
            {bandInfo.band_image ? (
              <img
                src={bandInfo.band_image}
                alt="Band"
                style={{ width: '200px', height: '200px', borderRadius: '50%' }}
              />
            ) : (
              <p>{t('no_image_uploaded')}</p>
            )}
          </div>
          <Form onSubmit={handleImageUpload}>
            <Form.Group controlId="formFile" className="mb-3">
              <Form.Label>{t('select_image_to_upload')}</Form.Label>
              <Form.Control type="file" onChange={handleFileChange} accept="image/*" />
            </Form.Group>
            <Button variant="primary" type="submit">
              {t('upload_image')}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default BandProfile;

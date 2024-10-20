import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Row, Col, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import API_BASE_URL from '../config/apiConfig';
import { useTranslation } from 'react-i18next';
import './BandProfile.css';

const BandProfile = () => {
  const { t } = useTranslation();
  const [bandInfo, setBandInfo] = useState({
    band_name: '',
    band_email: '',
    band_image: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [bandPassword, setBandPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

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

  const handleProfileUpdate = (e) => {
    e.preventDefault();

    if (bandPassword !== confirmPassword) {
      alert(t('passwords_do_not_match'));
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert(t('login_required'));
      window.location.href = '/';
      return;
    }

    const updateData = {
      band_name: bandInfo.band_name || '',
      band_email: bandInfo.band_email || '',
      band_password: bandPassword,
    };

    fetch(`${API_BASE_URL}/bands/profile`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(t('error_updating_band_profile'));
        }
        return response.json();
      })
      .then((data) => {
        setBandInfo(data.band);
        alert(t('profile_updated_successfully'));
      })
      .catch((error) => {
        console.error(t('error_updating_band_profile'), error);
      });
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Container className="band-profile-container">
      <Button variant="secondary" onClick={() => navigate('/dashboard')} className="mb-3">
        ← {t('return_to_dashboard')}
      </Button>
      <Card className="band-profile-card">
        <Card.Body>
          <h5 className="band-profile-title">{t('band_profile')}</h5>
          <Row className="align-items-center mb-4">
            <Col xs={3} className="text-center">
              {bandInfo.band_image ? (
                <img
                  src={bandInfo.band_image}
                  alt="Band"
                  className="band-profile-image"
                />
              ) : (
                <p>{t('no_image_uploaded')}</p>
              )}
            </Col>
            <Col xs={9}>
              <Form onSubmit={handleImageUpload} className="d-flex align-items-center">
                <Form.Group controlId="formFile" className="me-3">
                  <Form.Control type="file" onChange={handleFileChange} accept="image/*" className="form-control-lg" />
                </Form.Group>
                <Button variant="primary" type="submit" className="btn-sm">
                  {t('upload_image')}
                </Button>
              </Form>
            </Col>
          </Row>
          <Form onSubmit={handleProfileUpdate} className="profile-update-form">
            <Form.Group controlId="formBandName" className="mb-3">
              <Form.Label className="form-label">{t('band_name')}</Form.Label>
              <Form.Control
                type="text"
                value={bandInfo.band_name || ''}
                onChange={(e) => setBandInfo({ ...bandInfo, band_name: e.target.value })}
                className="form-control-lg"
              />
            </Form.Group>

            <Form.Group controlId="formBandPassword" className="mb-3">
              <Form.Label className="form-label">{t('password')}</Form.Label>
              <InputGroup>
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  value={bandPassword}
                  onChange={(e) => setBandPassword(e.target.value)}
                  className="form-control-lg"
                />
                <Button variant="outline-secondary" onClick={toggleShowPassword}>
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </Button>
              </InputGroup>
            </Form.Group>
            <Form.Group controlId="formConfirmPassword" className="mb-3">
              <Form.Label className="form-label">{t('confirm_password')}</Form.Label>
              <InputGroup>
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="form-control-lg"
                />
                <Button variant="outline-secondary" onClick={toggleShowPassword}>
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </Button>
              </InputGroup>
            </Form.Group>
            <div className="text-center">
              <Button variant="success" type="submit" className="btn-lg">
                {t('update')}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default BandProfile;

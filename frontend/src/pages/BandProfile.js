// src/pages/BandProfile.js

import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card } from 'react-bootstrap';
import API_BASE_URL from '../config/apiConfig';

const BandProfile = () => {
  const [bandInfo, setBandInfo] = useState({
    band_name: '',
    band_image: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    // Fetch band info
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You need to login first');
      window.location.href = '/login';
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
          throw new Error('Failed to fetch band info');
        }
        return response.json();
      })
      .then((data) => {
        setBandInfo(data.band);
      })
      .catch((error) => {
        console.error('Error fetching band info:', error);
      });
  }, []);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleImageUpload = (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      alert('You need to login first');
      window.location.href = '/login';
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
          throw new Error('Failed to upload image');
        }
        return response.json();
      })
      .then((data) => {
        setBandInfo({ ...bandInfo, band_image: data.imageUrl });
        alert('Image uploaded successfully');
      })
      .catch((error) => {
        console.error('Error uploading image:', error);
      });
  };

  return (
    <Container className="mt-5">
      <Card className="shadow bg-dark text-white">
        <Card.Body>
          <h2 className="text-center mb-4">Band Profile</h2>
          <div className="text-center mb-4">
            {bandInfo.band_image ? (
              <img
                src={bandInfo.band_image}
                alt="Band"
                style={{ width: '200px', height: '200px', borderRadius: '50%' }}
              />
            ) : (
              <p>No image uploaded</p>
            )}
          </div>
          <Form onSubmit={handleImageUpload}>
            <Form.Group controlId="formFile" className="mb-3">
              <Form.Label>Upload Band Image</Form.Label>
              <Form.Control type="file" onChange={handleFileChange} accept="image/*" />
            </Form.Group>
            <Button variant="primary" type="submit">
              Upload Image
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default BandProfile;

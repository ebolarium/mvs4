// SongRequestModal.js

import React, { useState } from 'react';
import { Modal, Button, Form, ListGroup } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';


const SongRequestModal = ({ show, onClose, onRequest }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  // Function to get the Spotify Access Token
  const getAccessToken = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/spotify/token`, {
        method: 'POST',
      });
      const data = await response.json();

      if (response.ok) {
        return data.access_token;
      } else {
        console.error('Failed to get access token:', data);
      }
    } catch (error) {
      console.error('Error getting access token:', error);
    }
  };

  // Function to handle song search
  const handleSearch = async () => {
    const token = await getAccessToken();

    if (!token) {
      console.error('Access token not found.');
      return;
    }

    try {
      const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      const data = await response.json();
      if (response.ok) {
        console.log("Spotify search results:", data);
        setResults(data.tracks.items);
      } else {
        console.error('Error during Spotify search:', data);
      }
    } catch (error) {
      console.error('Error during Spotify search:', error);
    }
  };

  // Function to handle song request
  const handleRequest = (song) => {
    
    console.log('Requesting song:', song);
    onRequest(song);
    onClose();
  };

  const { t } = useTranslation();


  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>
        {t('request_a_song')}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Song Search Form */}
        <Form.Group className="mb-3">
          <Form.Label>{t('enter_song_or_artist')}
          </Form.Label>
          <Form.Control
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('enter_song_or_artist')}
          />
        </Form.Group>
        <Button variant="primary" onClick={handleSearch}>
        {t('search')}
        </Button>

        {/* Search Results List */}
        {results.length > 0 && (
          <ListGroup className="mt-3">
            {results.map((song) => (
              <ListGroup.Item key={song.id} className="d-flex justify-content-between align-items-center">
                <div>
                  <strong>{song.name}</strong> by {song.artists[0].name}
                </div>
                <Button variant="success" onClick={() => handleRequest(song)}>
                {t('request')}
                </Button>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
        {t('close')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SongRequestModal;

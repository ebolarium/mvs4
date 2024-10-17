// src/pages/Songs.js

import React, { useState, useEffect, useContext } from 'react';
import { Container, Form, Button, Row, Col, Card, ListGroup } from 'react-bootstrap';
import { GlobalStateContext } from '../context/GlobalStateProvider';
import API_BASE_URL from '../config/apiConfig';

const Songs = () => {
  const [songs, setSongs] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
  });
  const { state, dispatch } = useContext(GlobalStateContext);

  const { title, artist } = formData;

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      return alert('You need to login first');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/songs`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      setSongs(data.songs || []);
      dispatch({ type: 'SET_ALL_SONGS', payload: data.songs || [] });
    } catch (error) {
      console.error('Error fetching songs:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      return alert('You need to login first');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/songs/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        const updatedSongs = [...songs, data.song];
        setSongs(updatedSongs);
        setFormData({ title: '', artist: '' });

        // Update global state
        dispatch({ type: 'ADD_SONG', payload: data.song });
      } else {
        const errorData = await response.json();
        alert(`Error adding song: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error adding song:', error);
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) {
      return alert('You need to login first');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/songs/delete/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const updatedSongs = songs.filter((song) => song._id !== id);
        setSongs(updatedSongs);

        // Update global state
        dispatch({
          type: 'SET_ALL_SONGS',
          payload: state.allSongs.filter((song) => song._id !== id),
        });
      } else {
        const errorData = await response.json();
        alert(`Error deleting song: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error deleting song:', error);
    }
  };

  return (
    <Container className="mt-5">
      <Row>
        <Col md={6}>
          <Card className="shadow">
            <Card.Body>
              <h2 className="text-center mb-4">Add a New Song</h2>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formTitle">
                  <Form.Label>Song Title</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={title}
                    onChange={handleChange}
                    placeholder="Enter song title"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formArtist">
                  <Form.Label>Artist</Form.Label>
                  <Form.Control
                    type="text"
                    name="artist"
                    value={artist}
                    onChange={handleChange}
                    placeholder="Enter artist name"
                    required
                  />
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100">
                  Add Song
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="shadow">
            <Card.Body>
              <h2 className="text-center mb-4">Song List</h2>
              <ListGroup variant="flush">
                {songs.length > 0 ? (
                  songs.map((song) => (
                    <ListGroup.Item
                      key={song._id}
                      className="d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <strong>{song.title}</strong> by {song.artist}
                      </div>
                      <div className="d-flex align-items-center">
                        {/* Total Vote Count */}
                        <div className="me-3">👍 {song.totalvotecount || 0}</div>
                        {/* Play Count */}
                        <div className="me-3">▶ {song.playcount || 0}</div>
                        {/* Delete Button */}
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(song._id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </ListGroup.Item>
                  ))
                ) : (
                  <p>No songs available.</p>
                )}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Songs;

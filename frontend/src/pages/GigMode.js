// src/pages/GigMode.js

import React, { useContext, useEffect } from 'react';
import { Container, ListGroup, Button, Modal } from 'react-bootstrap';
import { GlobalStateContext } from '../context/GlobalStateProvider';
import { Fullscreen, FullscreenExit } from '@mui/icons-material';
import API_BASE_URL from '../config/apiConfig';

const GigMode = ({ playlistId }) => {
  const { state, dispatch, socket } = useContext(GlobalStateContext);
  const [showFullscreen, setShowFullscreen] = React.useState(false);

  useEffect(() => {
    if (!playlistId || !socket) {
      return;
    }

    const fetchInitialData = () => {
      const token = localStorage.getItem('token');
      if (!token) {
        return alert('You need to login first');
      }

      fetch(`${API_BASE_URL}/playlist`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Failed to fetch playlist');
          }
          return response.json();
        })
        .then((data) => {
          if (data && data.playlist && data.playlist.songs) {
            const sortedSongs = data.playlist.songs
              .filter((song) => song.song_id)
              .map((song) => ({
                _id: song.song_id._id,
                title: song.song_id.title,
                artist: song.song_id.artist,
                votecount: song.votecount,
                played: song.played || false,
              }))
              .sort((a, b) => {
                if (a.played === b.played) {
                  return b.votecount - a.votecount;
                }
                return a.played ? 1 : -1;
              });
            dispatch({ type: 'SET_SONGS', payload: sortedSongs });
            dispatch({ type: 'SET_PLAYLIST', payload: data.playlist });
          }
        })
        .catch((error) => console.error('Error fetching playlist:', error));
    };

    const handleConnect = () => {
      socket.emit('joinPlaylist', playlistId);
      fetchInitialData();
    };

    if (socket.connected) {
      handleConnect();
    } else {
      socket.on('connect', handleConnect);
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.emit('leavePlaylist', playlistId);
    };
  }, [playlistId, socket, dispatch]);

  const handleMarkAsPlayed = async (songId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/songs/markAsPlayed/${songId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
  
      if (response.ok) {
        console.log('Song marked as played:', songId);
        if (socket && playlistId) {
          socket.emit('songPlayed', songId, playlistId);
        }
      } else {
        const errorData = await response.json();
        console.error('Failed to mark the song as played:', errorData.message);
      }
    } catch (error) {
      console.error('Error marking song as played:', error);
    }
  };

  const renderSongList = () => (
    <ListGroup>
      {state.songs.length === 0 ? (
        <p>No songs available in the current playlist.</p>
      ) : (
        state.songs.map((song) => (
          <ListGroup.Item
            key={song._id}
            className={`d-flex justify-content-between align-items-center ${
              song.played ? 'bg-secondary text-muted' : ''
            }`}
          >
            <div>
              {song.title} by {song.artist} - 👍 {song.votecount}
            </div>
            {!song.played ? (
              <Button variant="success" onClick={() => handleMarkAsPlayed(song._id)}>
                Çal
              </Button>
            ) : (
              <Button variant="secondary" disabled>
                Çalındı
              </Button>
            )}
          </ListGroup.Item>
        ))
      )}
    </ListGroup>
  );

  return (
    <Container className="mt-5">
      <h2>Sahne Modu</h2>
      <div className="d-flex justify-content-end mb-3">
        <Button variant="link" onClick={() => setShowFullscreen(true)}>
          <Fullscreen fontSize="large" />
        </Button>
      </div>

      {/* Main Content */}
      {renderSongList()}

      {/* Fullscreen Modal */}
      <Modal show={showFullscreen} fullscreen onHide={() => setShowFullscreen(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <Button variant="link" onClick={() => setShowFullscreen(false)}>
              <FullscreenExit fontSize="large" />
            </Button>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-light">
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Sahne Modu - Tam Ekran</h2>
          <div style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>
            {renderSongList()}
          </div>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default GigMode;

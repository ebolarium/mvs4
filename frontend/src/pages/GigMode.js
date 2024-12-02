// src/pages/GigMode.js

import React, { useContext, useEffect, useState } from 'react';
import { Container, ListGroup, Button, Modal } from 'react-bootstrap';
import { GlobalStateContext } from '../context/GlobalStateProvider';
import { Fullscreen, FullscreenExit } from '@mui/icons-material';
import API_BASE_URL from '../config/apiConfig';
import { useTranslation } from 'react-i18next';

const GigMode = ({ playlistId }) => {
  const { t } = useTranslation();
  const { state, dispatch, socket } = useContext(GlobalStateContext);
  const [showFullscreen, setShowFullscreen] = React.useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestSongs, setRequestSongs] = useState([]);

  // fetchInitialData fonksiyonunu tanımlayın
  const fetchInitialData = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      return alert(t('login_required'));
    }

    fetch(`${API_BASE_URL}/playlist`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(t('error_fetching_playlist'));
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
              key: song.song_id.key || t('no_key_info'), 
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
      .catch((error) => console.error(t('error_fetching_playlist'), error));
  };

  useEffect(() => {
    if (!playlistId || !socket) {
      return;
    }

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
  }, [playlistId, socket, dispatch, t]);

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
        console.log(t('song_marked_as_played'), songId);
        if (socket && playlistId) {
          socket.emit('songPlayed', songId, playlistId);
        }
      } else {
        const errorData = await response.json();
        console.error(t('error_marking_song_as_played'), errorData.message);
      }
    } catch (error) {
      console.error(t('error_marking_song_as_played'), error);
    }
  };

  useEffect(() => {
    if (socket && playlistId) {
      socket.on('newSongRequest', (newSong) => {
        setRequestSongs((prevSongs) => [...prevSongs, newSong]);
      });

      return () => {
        socket.off('newSongRequest');
      };
    }
  }, [socket, playlistId]);

  useEffect(() => {
    if (socket && playlistId) {
      socket.on('playlistUpdated', (updatedPlaylistId) => {
        if (updatedPlaylistId === playlistId) {
          // Playlist güncellenmişse, verileri yeniden al
          fetchInitialData();
        }
      });
  
      return () => {
        socket.off('playlistUpdated');
      };
    }
  }, [socket, playlistId]);

  const renderRequestSongList = () => (
    <ListGroup>
      {requestSongs.length === 0 ? (
        <p>{t('no_request_songs')}</p>
      ) : (
        requestSongs.map((song) => (
          <ListGroup.Item key={song._id}>
            <div>
              <strong>{song.title}</strong> {t('by')} {song.artist}
            </div>
          </ListGroup.Item>
        ))
      )}
    </ListGroup>
  );

  const renderSongList = () => (
    <ListGroup>
      {state.songs.length === 0 ? (
        <p>{t('no_songs_available_playlist')}</p>
      ) : (
        state.songs.map((song) => (
          <ListGroup.Item
            key={song._id}
            className={`d-flex justify-content-between align-items-center ${
              song.played ? 'bg-secondary text-muted' : ''
            }`}
          >
            <div style={{ fontSize: '1.2rem', fontWeight: 'normal' }}>
              <span style={{ color: 'black', fontSize: '1.4em' }}>{song.title} </span>{t('by')} {song.artist} /{'  '} {'  '}
              <span style={{ color: 'red', fontSize: '0.7em' }}>{song.key}</span>
              👍 {song.votecount}
            </div>
            {!song.played ? (
              <Button
                variant="success"
                style={{ fontSize: '1.5rem', padding: '0.5rem', width: '200px' }}
                onClick={() => handleMarkAsPlayed(song._id)}
              >
                {t('play')}
              </Button>
            ) : (
              <Button variant="secondary" disabled>
                {t('played')}
              </Button>
            )}
          </ListGroup.Item>
        ))
      )}
    </ListGroup>
  );

  return (
    <Container className="mt-5">
      <h2>{t('gig_mode')}</h2>
      <div className="d-flex justify-content-end mb-3">
        <Button variant="link" onClick={() => setShowFullscreen(true)}>
          <Fullscreen fontSize="large" />
        </Button>
        <Button variant="primary" onClick={() => setShowRequestModal(true)}>
          {t('request_songs')} ({requestSongs.length})
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
        <Modal.Body className="bg-dark text-light" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '3rem', fontWeight: 'bold', textAlign: 'center' }}>
            {t('gig_mode_fullscreen')}
          </h2>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>
            {renderSongList()}
          </div>
        </Modal.Body>
      </Modal>

      {/* Request Songs Modal */}
      <Modal show={showRequestModal} onHide={() => setShowRequestModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{t('requested_songs_list')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {renderRequestSongList()}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRequestModal(false)}>
            {t('close')}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default GigMode;

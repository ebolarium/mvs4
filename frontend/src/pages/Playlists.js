// src/pages/Playlists.js

import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Button, Card, ListGroup } from 'react-bootstrap';
import { GlobalStateContext } from '../context/GlobalStateProvider';
import API_BASE_URL from '../config/apiConfig';
import { useTranslation } from 'react-i18next';

const Playlists = () => {
  const { t } = useTranslation();
  const [playlist, setPlaylist] = useState(null);
  const [isPublished, setIsPublished] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const { state, dispatch, socket } = useContext(GlobalStateContext);
  const allSongs = state.allSongs || [];

  useEffect(() => {
    fetchSongs();
    fetchPlaylist();
  }, []);

  useEffect(() => {
    if (playlist?._id && socket) {
      console.log(t('attempt_join_playlist'), playlist._id);
      socket.emit('joinPlaylist', playlist._id);
    }

    return () => {
      if (playlist?._id && socket) {
        socket.emit('leavePlaylist', playlist._id);
      }
    };
  }, [playlist, socket]);

  const fetchSongs = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      return alert(t('login_required'));
    }

    try {
      const response = await fetch(`${API_BASE_URL}/songs`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        alert(t('session_expired'));
        localStorage.removeItem('token');
        window.location.href = '/';
        return;
      }

      if (!response.ok) {
        throw new Error(t('error_fetching_songs'));
      }
      const data = await response.json();
      dispatch({ type: 'SET_ALL_SONGS', payload: data.songs || [] });
    } catch (error) {
      console.error(t('error_fetching_songs'), error);
    }
  };

  const fetchPlaylist = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      return alert(t('login_required'));
    }
  
    try {
      const response = await fetch(`${API_BASE_URL}/playlist`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (response.status === 401) {
        alert(t('session_expired'));
        localStorage.removeItem('token');
        window.location.href = '/';
        return;
      }
  
      if (response.status === 404) {
        setPlaylist(null);
        setIsPublished(false);
        setQrCodeUrl(null);
        dispatch({ type: 'SET_SONGS', payload: [] });
        return;
      }
  
      if (!response.ok) {
        throw new Error(t('error_fetching_playlist'));
      }
  
      const data = await response.json();
  
      const relativeUrl = data.playlist?.relativeUrl
        ? `${API_BASE_URL}${data.playlist.relativeUrl}`
        : data.playlist?.url;
      setQrCodeUrl(relativeUrl);
  
      const processedSongs = data.playlist.songs
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
  
      setPlaylist(data.playlist || null);
      setIsPublished(data.playlist?.published || false);
      dispatch({ type: 'SET_SONGS', payload: processedSongs });
  
    } catch (error) {
      console.error(t('error_fetching_playlist'), error);
    }
  };
  

  const handleSongAction = async (song_id, action) => {
    const token = localStorage.getItem('token');
    if (!token) {
      return alert(t('login_required'));
    }

    await fetch(`${API_BASE_URL}/playlist/update-songs`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ song_id, action }),
    });
    fetchPlaylist();
  };

  const handlePublish = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      return alert(t('login_required'));
    }
  
    const newPublishState = !isPublished;
  
    const response = await fetch(`${API_BASE_URL}/playlist/publish`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ publish: newPublishState }),
    });
  
    if (!response.ok) {
      const data = await response.json();
      alert(t(data.message));
      return;
    }
  
    setIsPublished(newPublishState);
  
    fetchPlaylist();
  };
  

  return (
    <Container className="mt-5">
      <Row>
        <Col md={6}>
          <Card className="shadow">
            <Card.Body>
              <h2 className="text-center mb-4">{t('song_repository')}</h2>
              <ListGroup style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {allSongs
                  .filter((song) => !state.songs.some((p) => p._id === song._id))
                  .map((song) => (
                    <ListGroup.Item
                      key={song._id}
                      className="d-flex justify-content-between align-items-center"
                    >
                      <div>
                        {song.title} {t('by')} {song.artist}
                      </div>
                      <Button
                        variant="primary"
                        onClick={() => handleSongAction(song._id, 'add')}
                        disabled={isPublished} // Disable when published
                      >
                        {t('add')}
                      </Button>
                    </ListGroup.Item>
                  ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="shadow">
            <Card.Body>
              <h2 className="text-center mb-4">{t('playlist')}</h2>
              {playlist ? (
                <>
                  <ListGroup style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {state.songs.length > 0 ? (
                      state.songs.map((song, index) => (
                        <ListGroup.Item
                          key={`${song._id}-${index}`}
                          className="d-flex justify-content-between align-items-center"
                        >
                          {song.title} {t('by')} {song.artist} - {t('votes')}: {song.votecount}
                          <Button
                            variant="danger"
                            className="ms-3"
                            onClick={() => handleSongAction(song._id, 'remove')}
                            disabled={isPublished} // Disable when published
                          >
                            {t('remove')}
                          </Button>
                        </ListGroup.Item>
                      ))
                    ) : (
                      <p>{t('no_songs_available')}</p>
                    )}
                  </ListGroup>
                  <Button
                    className="mt-4"
                    variant={isPublished ? 'danger' : 'success'}
                    onClick={handlePublish}
                    disabled={state.songs.length === 0 && !isPublished} // Disable if empty and not published
                  >
                    {isPublished ? t('unpublish') : t('publish')}
                  </Button>
                  {isPublished && (
                    <>
                      <p className="mt-3">
                        {t('playlist_url')}: 
                        <a href={qrCodeUrl} target="_blank" rel="noopener noreferrer">
                          {qrCodeUrl}
                        </a>
                      </p>
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrCodeUrl}`}
                        alt={t('qr_code')}
                      />
                    </>
                  )}
                </>
              ) : (
                <p>{t('playlist_not_created')}</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Playlists;

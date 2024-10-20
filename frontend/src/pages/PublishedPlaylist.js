// src/pages/PublishedPlaylist.js

import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, ListGroup, Button, Card } from 'react-bootstrap';
import { GlobalStateContext } from '../context/GlobalStateProvider';
import API_BASE_URL from '../config/apiConfig';
import { useTranslation } from 'react-i18next';
import SongRequestModal from './SongRequestModal';

const PublishedPlaylist = () => {
  const { t } = useTranslation();
  const { playlistId } = useParams();
  const { state, dispatch, socket } = useContext(GlobalStateContext);
  const [cooldown, setCooldown] = useState(0);
  const [showRequestModal, setShowRequestModal] = useState(false);

  const handleRequest = (song) => {
    console.log('Requested song:', song);

    const songData = {
      _id: song.id,
      title: song.name,
      artist: song.artists.map(artist => artist.name).join(', '),
    };

    if (socket && playlistId) {
      socket.emit('songRequested', songData, playlistId);
    }

    setShowRequestModal(false);
  };

  useEffect(() => {
    const storedCooldown = localStorage.getItem('cooldown');
    if (storedCooldown) {
      const timeLeft = parseInt(storedCooldown) - Date.now();
      if (timeLeft > 0) {
        setCooldown(timeLeft);
        const timer = setInterval(() => {
          setCooldown((prev) => {
            if (prev <= 1000) {
              clearInterval(timer);
              localStorage.removeItem('cooldown');
              return 0;
            }
            return prev - 1000;
          });
        }, 1000);
      } else {
        localStorage.removeItem('cooldown');
      }
    }
  }, []);

  useEffect(() => {
    const fetchPlaylistData = () => {
      fetch(`${API_BASE_URL}/playlist/published/${playlistId}`, {
        method: 'GET',
      })
        .then((response) => {
          if (response.status === 404) {
            dispatch({ type: 'SET_PLAYLIST', payload: null });
            dispatch({ type: 'SET_SONGS', payload: [] });
            return;
          }
          if (!response.ok) {
            throw new Error(t('error_fetching_playlist'));
          }
          return response.json();
        })
        .then((data) => {
          if (data) {
            dispatch({ type: 'SET_PLAYLIST', payload: data });
        
            const sortedSongs = data.songs
              .filter((song) => song.song_id)
              .map((song) => ({
                _id: song.song_id._id,
                title: song.song_id.title,
                artist: song.song_id.artist,
                votecount: song.votecount,
                played: song.played || false,
              }))
              .sort((a, b) => {
                if (a.played && !b.played) return 1;
                if (!a.played && b.played) return -1;
                return b.votecount - a.votecount;
              });
        
            dispatch({ type: 'SET_SONGS', payload: sortedSongs });
          }
        })
        .catch((error) => console.error(t('error_fetching_playlist'), error));
    };

    const handleConnect = () => {
      console.log(t('socket_connected_join_playlist'));
      socket.emit('joinPlaylist', playlistId);
      fetchPlaylistData();
    };

    if (socket && playlistId) {
      if (socket.connected) {
        handleConnect();
      } else {
        socket.on('connect', handleConnect);
      }

      socket.on('playlistStatusChanged', (data) => {
        if (!data.published) {
          dispatch({ type: 'SET_PLAYLIST', payload: null });
          dispatch({ type: 'SET_SONGS', payload: [] });
        } else {
          fetchPlaylistData();
        }
      });

      return () => {
        socket.off('connect', handleConnect);
        socket.off('playlistStatusChanged');
        socket.emit('leavePlaylist', playlistId);
      };
    }
  }, [playlistId, socket, dispatch, t]);

  const handleVote = async (songId) => {
    if (cooldown > 0) return;

    try {
      console.log(t('attempting_vote'), songId);
      const response = await fetch(`${API_BASE_URL}/songs/vote/${songId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ playlistId }),
      });

      if (response.ok) {
        console.log(t('vote_successful'), songId);

        const cooldownTime = 5 * 60 * 1000;
        localStorage.setItem('cooldown', Date.now() + cooldownTime);
        setCooldown(cooldownTime);

        const timer = setInterval(() => {
          setCooldown((prev) => {
            if (prev <= 1000) {
              clearInterval(timer);
              localStorage.removeItem('cooldown');
              return 0;
            }
            return prev - 1000;
          });
        }, 1000);
      } else {
        console.error(t('failed_to_vote'));
      }
    } catch (error) {
      console.error(t('error_voting_song'), error);
    }
  };

  if (!state.playlist || !state.playlist.published) {
    return <p style={{ color: 'white' }}>{t('no_active_playlist')}</p>;
  }

  return (
    <Container
      className="mt-5 bg-dark text-white"
      style={{ minHeight: '100vh', paddingBottom: '20px' }}
    >
      {/* Band Image and Name Banner */}
      <Card className="mb-4 shadow-sm text-center bg-dark text-white">
        <Card.Body>
          {state.playlist.band_id.band_image && (
            <img
              src={state.playlist.band_id.band_image}
              alt={t('band_image')}
              style={{ width: '100%', height: '200px', objectFit: 'cover' }}
            />
          )}
          <Card.Title style={{ fontSize: '2rem', fontWeight: 'bold' }}>
            {state.playlist.band_id.band_name || t('live_music')}
          </Card.Title>
          <Card.Text className="text-white" style={{ fontSize: '1.2rem' }}>
            {t('vote_for_your_song')}
          </Card.Text>
        </Card.Body>
      </Card>

      {/* Cooldown Timer */}
      {cooldown > 0 && (
        <p className="text-center">
          {Math.ceil(cooldown / 1000)} {t('seconds_to_next_vote')}
        </p>
      )}

      {/* Request a Song Button */}
      <Button variant="primary" onClick={() => setShowRequestModal(true)} style={{ marginBottom: '20px' }}>
        {t('request_a_song')}
      </Button>

      {/* Song Search and Request Modal */}
      <SongRequestModal
        show={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        onRequest={handleRequest}
      />

      {/* Song List */}
      <ListGroup>
        {state.songs.map((song, index) => (
          <ListGroup.Item
            key={`${song._id}-${index}`}
            className={`d-flex justify-content-between align-items-center ${
              song.played ? 'bg-secondary text-muted' : ''
            }`}
          >
            <div>
              <strong>{song.title}</strong> {t('by')} {song.artist} - 👍 {song.votecount}
            </div>
            <Button
              style={{ backgroundColor: '#6c757d', color: 'white', borderColor: '#6c757d' }}
              onClick={() => handleVote(song._id)}
              disabled={song.played || cooldown > 0}
            >
              {song.played ? t('played') : t('vote')}
            </Button>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </Container>
  );
};

export default PublishedPlaylist;

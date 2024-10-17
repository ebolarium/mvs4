// src/pages/PublishedPlaylist.js

import React, { useContext, useEffect, useState } from 'react'; // Ensure useState is imported
import { useParams } from 'react-router-dom';
import { Container, ListGroup, Button, Card } from 'react-bootstrap';
import { GlobalStateContext } from '../context/GlobalStateProvider';
import API_BASE_URL from '../config/apiConfig';

const PublishedPlaylist = () => {
  const { playlistId } = useParams();
  const { state, dispatch, socket } = useContext(GlobalStateContext);
  const [cooldown, setCooldown] = useState(0); // Declare cooldown state variable

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
            throw new Error('Failed to fetch playlist');
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
              .sort((a, b) => b.votecount - a.votecount);
            dispatch({ type: 'SET_SONGS', payload: sortedSongs });
          }
        })
        .catch((error) => console.error('Error fetching playlist:', error));
    };

    const handleConnect = () => {
      console.log('PublishedPlaylist: Socket connected, joining playlist room');
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
  }, [playlistId, socket, dispatch]);

  const handleVote = async (songId) => {
    if (cooldown > 0) return;

    try {
      console.log('Attempting to vote for song ID:', songId);
      // Send a PUT request to vote for a song
      const response = await fetch(`${API_BASE_URL}/songs/vote/${songId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ playlistId }),
      });

      if (response.ok) {
        console.log(`Successfully voted for song with ID: ${songId}`);

        // Set cooldown
        const cooldownTime = 5 * 60 * 1000; // 5 minutes
        localStorage.setItem('cooldown', Date.now() + cooldownTime);
        setCooldown(cooldownTime);

        // Start countdown
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
        console.error('Failed to vote for the song');
      }
    } catch (error) {
      console.error('Error voting for song:', error);
    }
  };

  if (!state.playlist || !state.playlist.published) {
    return <p style={{ color: 'white' }}>No active playlist at the moment.</p>;
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
              alt="Band"
              style={{ width: '100%', height: '200px', objectFit: 'cover' }}
              />
          )}
          <Card.Title style={{ fontSize: '2rem', fontWeight: 'bold' }}>
            {state.playlist.band_id.band_name || 'Live Music'}
          </Card.Title>
          <Card.Text className="text-white" style={{ fontSize: '1.2rem' }}>
            Şarkına Oy Ver!
          </Card.Text>
        </Card.Body>
      </Card>


      {/* Cooldown Timer */}
      {cooldown > 0 && (
        <p className="text-center">
          {Math.ceil(cooldown / 1000)} saniye sonra tekrar oy verebilirsin.
        </p>
      )}

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
              <strong>{song.title}</strong> by {song.artist} - 👍 {song.votecount}
            </div>
            <Button
              style={{ backgroundColor: '#6c757d', color: 'white', borderColor: '#6c757d' }}
              onClick={() => handleVote(song._id)}
              disabled={song.played || cooldown > 0} // Disable if played or in cooldown
            >
              {song.played ? 'Çalındı' : 'Oy Ver'}
            </Button>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </Container>
  );
};

export default PublishedPlaylist;

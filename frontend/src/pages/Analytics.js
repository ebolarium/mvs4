// src/pages/Analytics.js

import React, { useContext, useEffect } from 'react';
import { Table } from 'react-bootstrap';
import { GlobalStateContext } from '../context/GlobalStateProvider';
import API_BASE_URL from '../config/apiConfig';

const Analytics = () => {
  const { state, dispatch } = useContext(GlobalStateContext);
  const songs = state.allSongs || [];

  useEffect(() => {
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

        if (!response.ok) {
          throw new Error('Failed to fetch songs');
        }
        const data = await response.json();
        dispatch({ type: 'SET_ALL_SONGS', payload: data.songs || [] });
      } catch (error) {
        console.error('Error fetching songs:', error);
      }
    };

    fetchSongs();
  }, [dispatch]);

  return (
    <div>
      <h2>Analytics</h2>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Title</th>
            <th>Artist</th>
            <th>Total Votes</th>
            <th>Play Count</th>
          </tr>
        </thead>
        <tbody>
          {songs.map((song) => (
            <tr key={song._id}>
              <td>{song.title}</td>
              <td>{song.artist}</td>
              <td>{song.totalvotecount || 0}</td>
              <td>{song.playcount || 0}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default Analytics;

// src/pages/Analytics.js

import React, { useContext, useEffect } from 'react';
import { Table } from 'react-bootstrap';
import { GlobalStateContext } from '../context/GlobalStateProvider';
import API_BASE_URL from '../config/apiConfig';
import { useTranslation } from 'react-i18next';

const Analytics = () => {
  const { t } = useTranslation();
  const { state, dispatch } = useContext(GlobalStateContext);
  const songs = state.allSongs || [];

  useEffect(() => {
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

        if (!response.ok) {
          throw new Error(t('error_fetching_songs'));
        }
        const data = await response.json();
        dispatch({ type: 'SET_ALL_SONGS', payload: data.songs || [] });
      } catch (error) {
        console.error(t('error_fetching_songs'), error);
      }
    };

    fetchSongs();
  }, [dispatch, t]);

  return (
    <div>
      <h2>{t('analytics')}</h2>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>{t('title')}</th>
            <th>{t('artist')}</th>
            <th>{t('total_votes')}</th>
            <th>{t('play_count')}</th>
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

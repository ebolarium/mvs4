// src/context/GlobalStateProvider.js

import React, { createContext, useReducer, useEffect, useState } from 'react';
import io from 'socket.io-client';

export const GlobalStateContext = createContext();

const initialState = {
  playlist: null,
  songs: [],
  allSongs: [],
  isLoggedIn: false, // Kullanıcı login durumu
  bandName: '', // Kullanıcı grubu adı
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_PLAYLIST':
      return { ...state, playlist: action.payload };
    case 'SET_SONGS':
      return { ...state, songs: action.payload };
    case 'SET_ALL_SONGS':
      return { ...state, allSongs: action.payload };
    case 'SET_LOGIN_STATUS':
      return { ...state, isLoggedIn: action.payload };
    case 'SET_BAND_NAME':
      return { ...state, bandName: action.payload };
    default:
      return state;
  }
};

export const GlobalStateProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [socket, setSocket] = useState(null);

  const updateLoginStatus = () => {
    const token = localStorage.getItem('token');
    if (token) {
      dispatch({ type: 'SET_LOGIN_STATUS', payload: true });
      const storedBandName = localStorage.getItem('bandName');
      dispatch({ type: 'SET_BAND_NAME', payload: storedBandName || '' });
    } else {
      dispatch({ type: 'SET_LOGIN_STATUS', payload: false });
      dispatch({ type: 'SET_BAND_NAME', payload: '' });
    }
  };

  // İlk yüklemede login durumunu kontrol et
  useEffect(() => {
    updateLoginStatus();
  }, []);

  // localStorage değişikliklerini dinle
  useEffect(() => {
    const handleStorageChange = () => {
      updateLoginStatus();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Socket bağlantısını yönet
  useEffect(() => {
    const socketURL = process.env.REACT_APP_SOCKET_URL || 'ws://localhost:5000';

    const socketInstance = io(socketURL, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });

    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      console.log('Socket connected:', socketInstance.id);
    });

    socketInstance.on('playlistUpdated', (updatedSongs) => {
      const processedSongs = updatedSongs
        .filter((song) => song.song_id)
        .map((song) => ({
          _id: song.song_id._id,
          title: song.song_id.title,
          artist: song.song_id.artist,
          votecount: song.votecount,
          played: song.played || false,
        }))
        .sort((a, b) => (a.played === b.played ? b.votecount - a.votecount : a.played ? 1 : -1));

      dispatch({ type: 'SET_SONGS', payload: processedSongs });
    });

    socketInstance.on('playlistStatusChanged', (data) => {
      if (!data.published) {
        dispatch({ type: 'SET_PLAYLIST', payload: null });
        dispatch({ type: 'SET_SONGS', payload: [] });
      }
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected:', socketInstance.id);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <GlobalStateContext.Provider value={{ state, dispatch, socket }}>
      {children}
    </GlobalStateContext.Provider>
  );
};

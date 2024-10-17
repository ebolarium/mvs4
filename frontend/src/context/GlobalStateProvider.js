// src/context/GlobalStateProvider.js

import React, { createContext, useReducer, useEffect, useState } from 'react';
import io from 'socket.io-client';

export const GlobalStateContext = createContext();

const initialState = {
  playlist: null,
  songs: [],
  allSongs: [], // Added to include all songs in the global state
  // Add other state variables as needed
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_PLAYLIST':
      return { ...state, playlist: action.payload };
    case 'SET_SONGS':
      return { ...state, songs: action.payload };
    case 'SET_ALL_SONGS':
      return { ...state, allSongs: action.payload };
    case 'ADD_SONG':
      return { ...state, allSongs: [...state.allSongs, action.payload] };
    case 'UPDATE_SONG_VOTES':
      return {
        ...state,
        songs: state.songs.map((song) =>
          song._id === action.payload.songId
            ? { ...song, votecount: song.votecount + 1 }
            : song
        ),
      };
    case 'MARK_SONG_PLAYED':
      return {
        ...state,
        songs: state.songs.map((song) =>
          song._id === action.payload ? { ...song, played: true } : song
        ),
      };
    default:
      return state;
  }
};

export const GlobalStateProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Use the correct socket URL based on the environment
    const socketURL = process.env.REACT_APP_SOCKET_URL || 'ws://localhost:5000';

    const socketInstance = io(socketURL, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });

    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      console.log('Socket connected:', socketInstance.id);
    });

    // Centralized event handlers
    socketInstance.on('playlistUpdated', (updatedSongs) => {
      console.log('GlobalStateProvider - playlistUpdated:', updatedSongs);

      // Process the updatedSongs to match the expected structure
      const processedSongs = updatedSongs
        .filter((song) => song.song_id) // Ensure song_id exists
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
      dispatch({ type: 'SET_SONGS', payload: processedSongs });
    });

    socketInstance.on('playlistStatusChanged', (data) => {
      if (!data.published) {
        dispatch({ type: 'SET_PLAYLIST', payload: null });
        dispatch({ type: 'SET_SONGS', payload: [] });
      } else {
        // Optionally, fetch the playlist again
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

// frontend/src/index.js

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { GlobalStateProvider } from './context/GlobalStateProvider'; // Import GlobalStateProvider

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GlobalStateProvider>
      <App />
    </GlobalStateProvider>
  </React.StrictMode>
);

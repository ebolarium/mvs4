// apiConfig.js
const API_BASE_URL = `${process.env.REACT_APP_API_URL || 'Online URL Burada olacak'}/api`;

export const BAND_API = `${API_BASE_URL}/bands`;
export const PLAYLIST_API = `${API_BASE_URL}/playlist`;
export const LOGIN_API = `${API_BASE_URL}/bands/login`;

export default API_BASE_URL;

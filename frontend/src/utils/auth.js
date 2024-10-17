// Token expiration kontrolü
export const checkTokenExpiration = () => {
    const token = localStorage.getItem('token');
    if (!token) return false;
  
    const decodedToken = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
  
    return decodedToken.exp > currentTime;
  };
  
  export const logoutUser = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };
  
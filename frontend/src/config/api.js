export const API_BASE_URL = 'https://deliversurex-backend-kfxe.onrender.com/api';

const endpoints = {
  login: `${API_BASE_URL}/login`,
  register: `${API_BASE_URL}/register`,
  getUser: (id) => `${API_BASE_URL}/user/${id}`,
  livePremium: `${API_BASE_URL}/premium/live`,
  activatePolicy: `${API_BASE_URL}/policy/activate`,
  reportClaim: `${API_BASE_URL}/claims/report`,
  getUserClaims: (id) => `${API_BASE_URL}/claims/user/${id}`,
  verifyCrowd: `${API_BASE_URL}/crowd/verify`,
};

export default endpoints;


import axios from 'axios';

// Build API base URL with priority that supports various env setups (Vite / CRA / Next)
const env = (typeof window !== 'undefined' && import.meta && import.meta.env) ? import.meta.env : {}; // Vite / modern bundlers
const nodeEnv = (typeof process !== 'undefined' && process.env) ? process.env : {}; // server-side or some build tooling
const API_URL = env.REACT_APP_API_URL || env.VITE_API_URL || nodeEnv.NEXT_PUBLIC_API_BASE_URL || nodeEnv.REACT_APP_API_URL || nodeEnv.API_BASE_URL || 'http://localhost:8000/api/';
const NORMALIZED_API_URL = String(API_URL).replace(/\/$/, '') + '/';

const apiClient = axios.create({
  baseURL: NORMALIZED_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
// keep original API_URL exported for uses elsewhere (if needed)
// export const BASE_API_URL = NORMALIZED_API_URL;

// Function to get the access token from localStorage
const getAccessToken = () => {
  return localStorage.getItem('access_token');
};

// Function to get the refresh token from localStorage
const getRefreshToken = () => {
  return localStorage.getItem('refresh_token');
};

// Function to set tokens in localStorage
const setTokens = (access, refresh) => {
  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);
};

// Function to remove tokens from localStorage
const removeTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

// Registration function
const register = async (username, email, password) => {
  try {
    const response = await apiClient.post('auth/register/', { username, email, password });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Login function
const login = async (username, password) => {
  try {
    const response = await apiClient.post('auth/token/', { username, password });
    const { access, refresh } = response.data;
    setTokens(access, refresh);
    return response.data;
  } catch (error) {
    // Si l'erreur a une réponse (erreur API), la relancer
    if (error.response?.data) {
      throw error.response.data;
    }
    // Sinon relancer l'erreur complète (erreur réseau, etc.)
    throw error;
  }
};

// Logout function
const logout = () => {
  removeTokens();
};

// Axios Interceptor for injecting access token and handling token refresh
apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If no response (network error, API unavailable), reject with helpful message
    if (!error.response) {
      console.error('[API] Network error or API unavailable:', error.message);
      const networkError = new Error('Impossible de se connecter à l\'API. Vérifiez votre connexion ou réessayez plus tard.');
      networkError.isNetworkError = true;
      return Promise.reject(networkError);
    }

    const { status } = error.response;

    // If error status is 401 (Unauthorized) and it's not the refresh token request itself
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = getRefreshToken();

      if (refreshToken) {
        try {
          const response = await axios.post(`${NORMALIZED_API_URL}auth/token/refresh/`, {
            refresh: refreshToken,
          });
          const { access, refresh } = response.data;
          setTokens(access, refresh);
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${access}`;
          // Retry the original request with the new access token
          originalRequest.headers['Authorization'] = `Bearer ${access}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          // If refresh token fails, logout the user
          removeTokens();
          console.error('Refresh token failed', refreshError);
          // Redirect to login if in browser
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token available, logout user
        removeTokens();
        console.error('No refresh token available. User logged out.');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    }

    // Log other errors in development
    if (import.meta.env.DEV) {
      console.group(`API Error - ${status}`);
      console.error('URL:', originalRequest.url);
      console.error('Method:', originalRequest.method);
      console.error('Response:', error.response.data);
      console.groupEnd();
    }

    return Promise.reject(error);
  }
);

export { register, login, logout, getAccessToken, getRefreshToken, apiClient };

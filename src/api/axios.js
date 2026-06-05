import axios from 'axios';

const api = axios.create({
  baseURL: 'https://uptimeapi.narendrasingh.site',
  withCredentials: true,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Show actual error from backend
api.interceptors.response.use(
  res => res,
  err => {
    const msg = err.response?.data?.error || err.response?.data?.message || err.message || 'Something went wrong';
    err.displayMessage = msg;
    return Promise.reject(err);
  }
);

export default api;

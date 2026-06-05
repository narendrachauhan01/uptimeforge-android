import axios from 'axios';

const api = axios.create({
  baseURL: 'https://uptimeapi.narendrasingh.site',
  withCredentials: true,
  timeout: 15000,
});

export default api;

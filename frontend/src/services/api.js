import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Request interceptor + logging
api.interceptors.request.use(
  (config) => {
    // attach token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    // mark start time for timing
    config.metadata = { start: Date.now() };

    const method = (config.method || 'get').toUpperCase();
    const fullUrl = `${config.baseURL || ''}${config.url || ''}`;
    console.log(`[API] -> ${method} ${fullUrl}`, {
      params: config.params,
      data: config.data,
    });

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor + unwrapping ApiResponse + logging
api.interceptors.response.use(
  (response) => {
    const duration = response.config?.metadata?.start
      ? `${Date.now() - response.config.metadata.start}ms`
      : 'n/a';
    console.log(
      `[API] <- ${response.status} ${response.config?.url} (${duration})`,
      response.data
    );

    // Unwrap ApiResponse { code, message, data }
    if (response?.data && Object.prototype.hasOwnProperty.call(response.data, 'data')) {
      return {
        ...response,
        data: response.data.data,
        message: response.data.message,
        code: response.data.code,
      };
    }
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;
    const msg = error.response?.data?.message || error.message || 'API Error';
    console.error(`[API] x- ${status || 'ERR'} ${url || ''}`, {
      message: msg,
      data: error.response?.data,
    });

    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }

    return Promise.reject({
      message: msg,
      errors: error.response?.data?.errors || null,
      status,
      originalError: error,
    });
  }
);

export default api;



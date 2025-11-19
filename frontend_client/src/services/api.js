import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Attach token from storage (localStorage or sessionStorage)
    const rememberMe = localStorage.getItem('rememberMe') === 'true';
    const token = rememberMe 
      ? localStorage.getItem('token')
      : (sessionStorage.getItem('token') || localStorage.getItem('token'));
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Mark start time for timing
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

// Response interceptor
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
    const responseData = error.response?.data;
    
    // Extract error message from ApiResponse structure
    let msg = 'API Error';
    if (responseData) {
      if (responseData.message) {
        msg = responseData.message;
      } else if (responseData.data?.message) {
        msg = responseData.data.message;
      } else if (typeof responseData === 'string') {
        msg = responseData;
      }
    } else if (error.message) {
      msg = error.message;
    }

    console.error(`[API] x- ${status || 'ERR'} ${url || ''}`, {
      message: msg,
      data: responseData,
      status,
    });

    // Handle authentication errors
    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('refreshToken');
      // Don't redirect automatically in customer frontend
      // Let components handle it
    }

    // Handle validation errors
    const errors = responseData?.errors || responseData?.data?.errors || null;

    // Create a more descriptive error object
    const errorObject = {
      message: msg,
      errors,
      status,
      originalError: error,
      responseData,
    };

    return Promise.reject(errorObject);
  }
);

export default api;



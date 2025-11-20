import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://store-management-tu.onrender.com/api/v1';

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
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
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



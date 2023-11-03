import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { LOCAL_STORAGE_KEY } from '~/constants';
import { clearLocalStorage } from '~/utils';

const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:3001/api/v1';

const axiosInterceptors = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInterceptors.interceptors.request.use(
  function (config: InternalAxiosRequestConfig) {
    // Do something before request is sent
    const persistedStore = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
    const { token } = JSON.parse(persistedStore.auth);
    const { selectedDb } = JSON.parse(persistedStore.db);

    if (typeof token === 'string' && token.trim() !== '') {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const apiURIs = [
      '/drawer',
      '/field',
      '/folder',
      '/file',
      '/dashboard',
      '/migrate',
      '/user',
      '/permission',
      '/type',
      '/format',
      '/audit-trail',
      '/reference',
      '/auto-index',
      '/software',
    ];
    const matchURI = apiURIs.some((item) => config.url.includes(item));
    if (matchURI && selectedDb && selectedDb.tenant) {
      config.headers['x-tenant-id'] = selectedDb.tenant;
    }

    return config;
  },
  function (error: AxiosError) {
    // Do something with request error
    return Promise.reject(error);
  },
);

// Add a response interceptor
axiosInterceptors.interceptors.response.use(
  function (response: AxiosResponse) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response;
  },
  function (error: AxiosError) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    const {
      response: { status = null },
    } = error || { response: { status: null } };

    if (status === 401 || status === 403) {
      window.location.pathname = '/login';
      clearLocalStorage();
    }

    return Promise.reject(error);
  },
);

export default axiosInterceptors;

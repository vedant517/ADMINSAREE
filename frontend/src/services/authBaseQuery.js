import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from './apiConfig';
import { getStoredAuthToken } from '../utils/userSession';

/** Shared RTK Query base — attaches Bearer token and cookies for user APIs. */
export const createAuthBaseQuery = () =>
  fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: 'include',
    prepareHeaders: (headers) => {
      const token = getStoredAuthToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  });

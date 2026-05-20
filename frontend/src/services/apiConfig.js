/**
 * API Configuration
 * Centralized place to manage the backend URL.
 */

const getApiBaseUrl = () => {
  // In production (when built for and served by the backend), always use the relative '/api' path
  if (import.meta.env.MODE === 'production') {
    return '/api';
  }

  // If VITE_API_URL is set in environment variables, use it.
  // Otherwise, use the proxy path '/api'.
  const envUrl = import.meta.env.VITE_API_URL;
  
  if (envUrl) {
    // Ensure no trailing slash
    return envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl;
  }
  
  // Default for development (proxied by Vite)
  return '/api';
};

export const API_BASE_URL = getApiBaseUrl();

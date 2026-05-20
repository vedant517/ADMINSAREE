/**
 * API Configuration
 * Centralized place to manage the backend URL.
 */

const getApiBaseUrl = () => {
  // Prioritize VITE_API_URL from environment variables (important for separate Render deployments)
  const envUrl = import.meta.env.VITE_API_URL;
  
  if (envUrl) {
    // Ensure no trailing slash
    return envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl;
  }
  
  // Default for development (proxied by Vite) or when served directly by backend
  return '/api';
};

export const API_BASE_URL = getApiBaseUrl();

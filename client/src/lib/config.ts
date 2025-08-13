
// Configuration for different environments
const config = {
  development: {
    apiBaseUrl: '', // Empty string for relative URLs in development
  },
  production: {
    apiBaseUrl: 'https://your-actual-replit-url.repl.co', // Replace this with your actual deployed Replit URL
  }
};

// Detect if we're in a mobile app (Capacitor)
const isMobileApp = () => {
  return window.location.protocol === 'capacitor:' || 
         window.location.protocol === 'ionic:' ||
         (window as any).Capacitor !== undefined;
};

// Get the appropriate API base URL
export const getApiBaseUrl = () => {
  if (isMobileApp()) {
    return config.production.apiBaseUrl;
  }
  return config.development.apiBaseUrl;
};

export const apiUrl = (endpoint: string) => {
  const baseUrl = getApiBaseUrl();
  return baseUrl + endpoint;
};

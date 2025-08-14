// Configuration for different environments
const config = {
  development: {
    apiBaseUrl: '', // Empty string for relative URLs in development
  },
  production: {
    apiBaseUrl: 'https://deite-a2-vasudevjamdagnigaur.repl.co', // Your actual Replit deployment URL
  }
};

// Detect if we're in a mobile app (Capacitor)
const isMobileApp = () => {
  // Check for Capacitor environment
  if (typeof window !== 'undefined') {
    // Check for Capacitor object
    if ((window as any).Capacitor !== undefined) {
      return true;
    }
    
    // Check for Capacitor protocol
    if (window.location.protocol === 'capacitor:' || window.location.protocol === 'ionic:') {
      return true;
    }
    
    // Check for mobile user agent
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    if (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase())) {
      return true;
    }
  }
  
  return false;
};

// Get the appropriate API base URL
export const getApiBaseUrl = () => {
  // Always use production URL for mobile apps
  if (isMobileApp()) {
    console.log('Mobile app detected, using production API URL');
    return config.production.apiBaseUrl;
  }
  
  // Use development URL for web
  console.log('Web environment detected, using development API URL');
  return config.development.apiBaseUrl;
};

export const apiUrl = (endpoint: string) => {
  const baseUrl = getApiBaseUrl();
  const fullUrl = baseUrl + endpoint;
  console.log(`API URL constructed: ${fullUrl}`);
  return fullUrl;
};

// Export for debugging
export const debugInfo = {
  isMobile: isMobileApp(),
  apiBaseUrl: getApiBaseUrl(),
  userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
};
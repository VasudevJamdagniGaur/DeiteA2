// Configuration for different environments
const config = {
  development: {
    apiBaseUrl: '', // Empty string for relative URLs in development
  },
  production: {
    apiBaseUrl: 'https://deite-a2-vasudevjamdagnigaur.repl.co', // Your actual Replit deployment URL
  }
};

// Fallback URLs in case the primary URL fails
const fallbackUrls = [
  'https://deite-a2-vasudevjamdagnigaur.repl.co',
  // Add any additional fallback URLs here if needed
];

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

// Enhanced API call with retry logic
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  console.log(`🚀 Making API call to: ${endpoint}`);
  
  const urls = isMobileApp() ? fallbackUrls.map(url => url + endpoint) : [apiUrl(endpoint)];
  
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    console.log(`📡 Trying URL ${i + 1}/${urls.length}: ${url}`);
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      
      if (response.ok) {
        console.log(`✅ API call successful with URL: ${url}`);
        return response;
      } else {
        console.warn(`⚠️ API call failed with status ${response.status} for URL: ${url}`);
        if (i === urls.length - 1) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      }
    } catch (error: any) {
      console.error(`❌ API call error for URL ${url}:`, error.message);
      if (i === urls.length - 1) {
        throw error;
      }
    }
  }
  
  throw new Error('All API endpoints failed');
};

// Export for debugging
export const debugInfo = {
  isMobile: isMobileApp(),
  apiBaseUrl: getApiBaseUrl(),
  userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
};
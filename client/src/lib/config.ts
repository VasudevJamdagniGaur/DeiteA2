import { mobileHttpRequest, isMobileApp as isMobileAppUtil } from './mobile-network';

// Configuration for different environments
const config = {
  development: {
    apiBaseUrl: '', // Empty string for relative URLs in development (web only)
  },
  production: {
    apiBaseUrl: '', // For web deployment
  }
};

// For mobile apps, we'll use direct RunPod connection (no local server needed)
const MOBILE_DIRECT_RUNPOD_URL = "https://vbpxyhouli5bmjw6cve0:40u3src5k8wrj4vf8b0u@giy3d1ylj8dr8b-19123-vbpxyhouli5bmjw6cve0.proxy.runpod.net/api/generate";

// Fallback URLs for mobile apps
const fallbackUrls = [
  '', // Current domain fallback
];

// Use the mobile utility for consistent mobile detection
const isMobileApp = isMobileAppUtil;

// Get the appropriate API base URL
export const getApiBaseUrl = () => {
  // Always use local server (no external Replit dependency)
  if (isMobileApp()) {
    console.log('Mobile app detected, using local server API');
    return config.production.apiBaseUrl;
  }
  
  // Use local server for web as well
  console.log('Web environment detected, using local server API');
  return config.development.apiBaseUrl;
};

export const apiUrl = (endpoint: string) => {
  const baseUrl = getApiBaseUrl();
  const fullUrl = baseUrl + endpoint;
  console.log(`API URL constructed: ${fullUrl}`);
  return fullUrl;
};

// Enhanced API call with mobile-optimized networking
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  console.log(`🚀 Making API call to: ${endpoint}`);
  
  // For mobile apps, try fallback URLs; for web, use direct endpoint
  const urls = isMobileApp() 
    ? fallbackUrls.filter(url => url).map(url => url + endpoint).concat([apiUrl(endpoint)])
    : [apiUrl(endpoint)];
  
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    console.log(`📡 Trying URL ${i + 1}/${urls.length}: ${url}`);
    
    try {
      // Use the enhanced mobile HTTP request
      const response = await mobileHttpRequest(url, options);
      
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